from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta, timezone
import os
import logging
from dotenv import load_dotenv
import sys

# Create logs directory if it doesn't exist
log_dir = 'logs'
os.makedirs(log_dir, exist_ok=True)

# Configure logging
logging.basicConfig(
    filename=os.path.join(log_dir, 'app.log'),
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', '182003'),
    'database': os.getenv('MYSQL_DATABASE', 'greenbalconydrip')
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        logging.info("Successfully connected to MySQL database")
        return conn
    except mysql.connector.Error as e:
        logging.error(f"MySQL connection error: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error while connecting to database: {str(e)}")
        return None

def parse_reading_data(reading):
    """
    Parse the reading data from speedreading entries to check for watering events
    Returns: True if W0 or W1 is found, False otherwise
    
    Example reading formats:
    - "1735646580:W1:13401:0~1735646580:BV:523~" (W1 with BV)
    - "1735646820:W0:4925:0:200:0~1735646820:BV:524~" (W0 with BV)
    - "1735646122:BV:3300" (Only BV)
    - "1735646580:E2:13401:0~1735646580:BV:523~" (E2 with BV)
    """
    if not reading:
        return False
    
    try:
        # Split by tilde (~) to handle multiple readings in one entry
        parts = reading.split('~')
        
        for part in parts:
            # Check for W0 or W1 in each part
            if ':W0:' in part or ':W1:' in part:
                logging.info(f"Found watering event in reading: {part}")
                return True
                
        # If we get here, no watering events were found
        logging.debug(f"No watering events found in reading: {reading}")
        return False
    except Exception as e:
        logging.error(f"Error parsing reading data: {str(e)}, reading: {reading}")
        return False

def get_flow_status(schedule_id, date):
    """
    Determine flow status for a specific schedule and date
    Returns: 'completed', 'pending', or 'no data'
    """
    conn = get_db_connection()
    if not conn:
        logging.error(f"Failed to connect to database in get_flow_status for schedule_id {schedule_id}")
        return 'no data'
        
    cursor = conn.cursor(dictionary=True)
    
    try:
        logging.info(f"Checking flow status for schedule_id {schedule_id} on date {date}")
        
        # Get schedule time for this ID
        cursor.execute("""
            SELECT TIME(time) as schedule_time
            FROM schedule
            WHERE idSchedule = %s
        """, (schedule_id,))
        schedule_result = cursor.fetchone()
        
        if not schedule_result:
            logging.error(f"No schedule found for ID {schedule_id}")
            return 'no data'
            
        schedule_time = schedule_result['schedule_time']
        
        # Convert date string to datetime.date if it's not already
        if isinstance(date, str):
            date = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Get current date and time in UTC using timezone-aware approach
        current_utc = datetime.now(timezone.utc)
        
        # Check for watering events in speedreading entries with corrected patterns
        cursor.execute("""
            SELECT reading, createdat
            FROM miscellaneous
            WHERE idMiscellaneous = %s
            AND subject = 'speedreading'
            AND DATE(createdat) = %s
            AND (
                reading LIKE '%W0:%'
                OR reading LIKE '%W1:%'
                OR reading LIKE '%:W0:%'
                OR reading LIKE '%:W1:%'
            )
            ORDER BY createdat DESC
        """, (schedule_id, date))
        
        watering_entries = cursor.fetchall()
        
        # More detailed parsing of watering events
        has_watering_event = False
        for entry in watering_entries:
            reading = entry['reading']
            parts = reading.split('~')
            for part in parts:
                if ':W0:' in part or ':W1:' in part or 'W0:' in part or 'W1:' in part:
                    has_watering_event = True
                    logging.info(f"Found watering event in reading: {part}")
                    break
            if has_watering_event:
                break
        
        logging.info(f"Schedule {schedule_id} on {date}: has watering event = {has_watering_event}")
        
        # Find the latest date in the database to determine if this is "today"
        cursor.execute("""
            SELECT DATE(MAX(createdat)) as latest_date
            FROM miscellaneous
        """)
        latest_date_result = cursor.fetchone()
        latest_date = latest_date_result['latest_date'] if latest_date_result else current_utc.date()
        
        # Check for getconfigrun success - this determines if the device attempted to run the schedule
        cursor.execute("""
            SELECT COUNT(*) as config_count
            FROM miscellaneous
            WHERE idMiscellaneous = %s
            AND subject = 'getconfigrun'
            AND reading = 'success'
            AND DATE(createdat) = %s
        """, (schedule_id, date))
        
        config_result = cursor.fetchone()
        has_config_success = config_result['config_count'] > 0
        
        logging.info(f"Schedule {schedule_id} on {date}: getconfigrun success = {has_config_success}")
        
        # If we have a watering event, it's definitely completed
        if has_watering_event:
            status = 'completed'
            logging.info(f"Status for schedule {schedule_id} on {date}: completed (watering event found)")
            return status
            
        # Check if there was any activity at all for this schedule_id on this date
        cursor.execute("""
            SELECT COUNT(*) as activity_count
            FROM miscellaneous
            WHERE idMiscellaneous = %s
            AND DATE(createdat) = %s
        """, (schedule_id, date))
        
        activity_result = cursor.fetchone()
        has_any_activity = activity_result['activity_count'] > 0
        
        # Convert schedule_time to datetime.time for comparison
        schedule_time_obj = datetime.strptime(str(schedule_time), '%H:%M:%S').time()
        
        # For current date (latest in database), check if time has passed
        if date == latest_date:
            # Get the latest time for this date
            cursor.execute("""
                SELECT TIME(MAX(createdat)) as latest_time
                FROM miscellaneous
                WHERE DATE(createdat) = %s
            """, (date,))
            latest_time_result = cursor.fetchone()
            latest_time = datetime.strptime(str(latest_time_result['latest_time']), '%H:%M:%S').time() if latest_time_result and latest_time_result['latest_time'] else current_utc.time()
            
            # If schedule time has passed for today and we have any activity, mark as pending
            if latest_time > schedule_time_obj:
                status = 'pending'
                logging.info(f"Status for schedule {schedule_id} on {date}: pending (time has passed, no watering event)")
            else:
                status = 'no data'
                logging.info(f"Status for schedule {schedule_id} on {date}: no data (schedule time not yet reached)")
        else:
            # For past dates, if we have any activity, mark as pending
            if has_any_activity:
                status = 'pending'
                logging.info(f"Status for schedule {schedule_id} on past date {date}: pending (past date with activity)")
            else:
                status = 'no data'
                logging.info(f"Status for schedule {schedule_id} on past date {date}: no data (no activity found)")
        
        return status
        
    except Exception as e:
        logging.error(f"Error in get_flow_status for schedule_id {schedule_id}: {str(e)}")
        return 'no data'
    finally:
        cursor.close()
        conn.close()

@app.route('/api/watering-data')
def get_watering_data():
    """
    API endpoint to get watering data for all active schedules
    Returns a JSON array of schedule data with flow status for yesterday and today
    """
    conn = get_db_connection()
    if not conn:
        logging.error("Database connection failed in get_watering_data")
        return jsonify({'error': 'Database connection failed'}), 500
        
    cursor = conn.cursor(dictionary=True)
    
    try:
        logging.info("Processing request to /api/watering-data")
        
        # Get all active schedules first
        cursor.execute("""
            SELECT 
                s.idSchedule,
                CONCAT(DATE(s.startdate), ' ', TIME(s.time)) as schedule_time,
                CONCAT(s.duration, ' min') as duration,
                s.onoff,
                s.weather,
                (
                    SELECT m.idMiscellaneous 
                    FROM miscellaneous m 
                    WHERE m.subject IN ('getconfigrun', 'speedreading')
                    AND m.idMiscellaneous = s.idSchedule
                    LIMIT 1
                ) as misc_id
            FROM schedule s
            WHERE s.onoff = 1
            ORDER BY s.time
        """)
        
        schedules = cursor.fetchall()
        if not schedules:
            logging.warning("No active schedules found")
            return jsonify([])
            
        logging.info(f"Retrieved {len(schedules)} active schedules from database")
        
        # Find the latest date in the miscellaneous table instead of using current date
        cursor.execute("""
            SELECT DATE(MAX(createdat)) as latest_date
            FROM miscellaneous
        """)
        latest_date_result = cursor.fetchone()
        
        if not latest_date_result or not latest_date_result['latest_date']:
            # Fallback to current date if no data found
            current_utc = datetime.now(timezone.utc)
            today = current_utc.date()
            yesterday = today - timedelta(days=1)
            logging.warning("No data found in miscellaneous table, using current date")
        else:
            # Use latest date as "today" and previous date as "yesterday"
            today = latest_date_result['latest_date']
            yesterday = today - timedelta(days=1)
            logging.info(f"Using latest date from database: {today} as 'today' and {yesterday} as 'yesterday'")
        
        result = []
        for schedule in schedules:
            try:
                schedule_id = schedule['idSchedule']
                # Use schedule_id for both cases since they should be the same
                misc_id = schedule_id
                
                # Get flow status using the schedule ID
                yesterday_flow = get_flow_status(misc_id, yesterday)
                today_flow = get_flow_status(misc_id, today)
                
                # Create schedule data object
                schedule_data = {
                    'ID': schedule_id,
                    'schedule_time': schedule['schedule_time'],
                    'duration': schedule['duration'],
                    'yesterday_flow': yesterday_flow,
                    'today_flow': today_flow,
                    'active': schedule['onoff'] == 1,
                    'weather_enabled': schedule['weather'] == 1
                }
                result.append(schedule_data)
                
            except Exception as e:
                logging.error(f"Error processing schedule {schedule.get('idSchedule', 'unknown')}: {str(e)}")
                continue
            
        logging.info(f"Successfully retrieved and processed {len(result)} schedules")
        return jsonify(result)
        
    except Exception as e:
        error_msg = f"Error in get_watering_data: {str(e)}"
        logging.error(error_msg)
        return jsonify({'error': error_msg}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/health')
def health_check():
    """
    Health check endpoint to verify the API is running
    Also checks database connectivity
    """
    try:
        conn = get_db_connection()
        if conn:
            conn.close()
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected',
                'timestamp': datetime.now().isoformat()
            }), 503
    except Exception as e:
        logging.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found', 'path': request.path}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

if __name__ == '__main__':
    try:
        # Verify database connection on startup
        conn = get_db_connection()
        if conn:
            conn.close()
            logging.info("Database connection verified on startup")
        else:
            logging.error("Failed to connect to database on startup")
            
        # Start the Flask app
        port = int(os.getenv('PORT', 5000))
        logging.info(f"Starting Flask app on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        logging.critical(f"Failed to start application: {str(e)}")
        sys.exit(1) 