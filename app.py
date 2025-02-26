from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
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
    
    Cases:
    1. Normal watering: getconfigrun success followed by W0/W1 in speedreading -> 'completed'
    2. Direct speedreading with no getconfigrun but with W0/W1 -> 'completed'
    3. getconfigrun success but no W0/W1 in speedreading -> 'pending'
    4. No getconfigrun success and no W0/W1 in speedreading -> 'no data'
    5. Speedreading with E2 parameter (error) but with W0/W1 -> 'completed'
    """
    conn = get_db_connection()
    if not conn:
        logging.error(f"Failed to connect to database in get_flow_status for schedule_id {schedule_id}")
        return 'no data'
        
    cursor = conn.cursor(dictionary=True)
    
    try:
        logging.info(f"Checking flow status for schedule_id {schedule_id} on date {date}")
        
        # Check for getconfigrun success
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
        
        # Check for watering events in speedreading entries
        cursor.execute("""
            SELECT reading
            FROM miscellaneous
            WHERE idMiscellaneous = %s
            AND subject = 'speedreading'
            AND DATE(createdat) = %s
        """, (schedule_id, date))
        
        speedreading_entries = cursor.fetchall()
        logging.info(f"Found {len(speedreading_entries)} speedreading entries for schedule {schedule_id} on {date}")
        
        # Parse speedreading entries to find W0 or W1
        has_watering_event = False
        for entry in speedreading_entries:
            if parse_reading_data(entry['reading']):
                has_watering_event = True
                break
        
        logging.info(f"Schedule {schedule_id} on {date}: has watering event = {has_watering_event}")
        
        # Determine status based on config and watering events
        if has_config_success:
            # Case 1 & 3: getconfigrun success exists
            status = 'completed' if has_watering_event else 'pending'
        else:
            # Case 2 & 4: No getconfigrun success
            if has_watering_event:
                # Case 2: Direct speedreading with watering events
                status = 'completed'
            else:
                # Case 4: No getconfigrun and no watering events
                status = 'no data'
        
        logging.info(f"Final status for schedule {schedule_id} on {date}: {status}")
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
        
        # Get all active schedules
        cursor.execute("""
            SELECT 
                idSchedule,
                CONCAT(DATE(startdate), ' ', TIME(time)) as schedule_time,
                CONCAT(duration, ' min') as duration,
                onoff,
                weather
            FROM schedule
            WHERE onoff = 1
            ORDER BY time
        """)
        
        schedules = cursor.fetchall()
        logging.info(f"Retrieved {len(schedules)} active schedules from database")
        
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        result = []
        for schedule in schedules:
            try:
                schedule_id = schedule['idSchedule']
                
                # Get flow status for yesterday and today
                yesterday_flow = get_flow_status(schedule_id, yesterday)
                today_flow = get_flow_status(schedule_id, today)
                
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
                # Continue with next schedule instead of failing the entire request
                continue
            
        logging.info(f"Successfully retrieved and processed {len(result)} schedules")
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in get_watering_data: {str(e)}")
        return jsonify({'error': str(e)}), 500
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