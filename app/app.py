from flask import Flask, jsonify, render_template
from flask_cors import CORS
import mysql.connector
import os
from datetime import datetime, timedelta
import logging
import csv
from dotenv import load_dotenv
import sys

# Create logs directory if it doesn't exist
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)

# Configure logging first
logging.basicConfig(
    filename=os.path.join(log_dir, 'app.log'),
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables
if not load_dotenv():
    logging.error("No .env file found. Please create one based on .env.example")
    print("Error: No .env file found. Please create one based on .env.example")
    sys.exit(1)

# Verify required environment variables
required_env_vars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
    logging.error(error_msg)
    print(f"Error: {error_msg}")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=3306,
            connect_timeout=10
        )
        if connection.is_connected():
            logging.info("Successfully connected to MySQL database")
            return connection
        else:
            logging.error("Failed to establish database connection")
            return None
    except mysql.connector.Error as e:
        logging.error(f"MySQL connection error: {e}")
        if e.errno == mysql.connector.errorcode.ER_ACCESS_DENIED_ERROR:
            logging.error("Access denied: Check username and password")
        elif e.errno == mysql.connector.errorcode.ER_BAD_DB_ERROR:
            logging.error("Database does not exist")
        else:
            logging.error(f"Error {e.errno}: {e.msg}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error while connecting to database: {str(e)}")
        return None

def parse_log_entry(entry):
    """Parse a log entry and determine its type and status"""
    status = {
        'getconfigrun': False,
        'watering_event': False,
        'error': False,
        'bv_reading': False
    }
    
    if 'getconfigrun:success' in entry.lower():
        status['getconfigrun'] = True
    if 'W0:' in entry or 'W1:' in entry:
        status['watering_event'] = True
    if 'BV:' in entry:
        status['bv_reading'] = True
    if 'E1:' in entry or 'E2:' in entry:
        status['error'] = True
        
    return status

def determine_flow_status(schedule_time, log_entries):
    """Determine flow status (completed, pending, no data) based on log entries"""
    if not log_entries:
        return "no data"
        
    has_config = False
    has_watering = False
    
    for entry in log_entries:
        status = parse_log_entry(entry)
        if status['getconfigrun']:
            has_config = True
        if status['watering_event']:
            has_watering = True
            
    if has_config and has_watering:
        return "completed"
    elif has_config:
        return "pending"
    else:
        return "no data"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/dashboard-data')
def get_dashboard_data():
    conn = None
    cursor = None
    try:
        # Attempt database connection
        conn = get_db_connection()
        if not conn:
            logging.error("Database connection failed in get_dashboard_data")
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor(dictionary=True)
        
        # Get schedule data
        query = """
        SELECT 
            s.idSchedule,
            s.time,
            s.duration,
            s.startdate,
            (SELECT GROUP_CONCAT(CONCAT(subject, ':', reading) SEPARATOR '~')
             FROM miscellaneous m1
             WHERE m1.idMiscellaneous = s.idSchedule
             ORDER BY m1.createdat DESC
             LIMIT 5) as readings
        FROM schedule s
        WHERE s.onoff = 1
        ORDER BY s.time
        """
        
        logging.info("Executing query in get_dashboard_data")
        cursor.execute(query)
        schedules = cursor.fetchall()
        logging.info(f"Retrieved {len(schedules)} schedules from database")
        
        # Process each schedule
        dashboard_data = []
        
        for schedule in schedules:
            try:
                # Format schedule time
                schedule_time = schedule['time'].strftime('%H:%M:%S')
                
                # Determine flow status based on readings
                def determine_status(reading):
                    if reading is None:
                        return "no data"
                    try:
                        reading_data = str(reading).lower()
                        has_config = 'getconfigrun:success' in reading_data
                        has_watering = 'speedreading:' in reading_data and ('w0:' in reading_data or 'w1:' in reading_data)
                        
                        if has_config and has_watering:
                            return "completed"
                        elif has_config:
                            return "pending"
                        return "no data"
                    except Exception as e:
                        logging.error(f"Error processing reading: {str(e)}")
                        return "no data"
                
                readings = schedule.get('readings')
                status = determine_status(readings)
                
                dashboard_data.append({
                    'id': schedule['idSchedule'],
                    'schedule_time': f"{schedule['startdate']} {schedule_time}",
                    'duration': f"{schedule['duration']} min",
                    'yesterday_flow': status,  # Using same status for both since we're showing all data
                    'today_flow': status
                })
            except Exception as e:
                logging.error(f"Error processing schedule {schedule.get('idSchedule', 'unknown')}: {str(e)}")
                continue
        
        logging.info(f"Processed {len(dashboard_data)} records successfully")
        return jsonify(dashboard_data)
        
    except Exception as e:
        logging.error(f"Error in get_dashboard_data: {str(e)}")
        return jsonify({'error': str(e)}), 500
        
    finally:
        try:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
            logging.info("Database connections closed")
        except Exception as e:
            logging.error(f"Error closing database connections: {str(e)}")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port) 