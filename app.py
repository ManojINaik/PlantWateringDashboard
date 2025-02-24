from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

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
    return mysql.connector.connect(**db_config)

def get_flow_status(schedule_id, date):
    """
    Determine flow status for a specific schedule and date
    Returns: 'completed', 'pending', or 'no data'
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
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
        
        if config_result['config_count'] == 0:
            return 'no data'
            
        # Check for watering events (W0 or W1)
        cursor.execute("""
            SELECT COUNT(*) as water_count
            FROM miscellaneous
            WHERE idMiscellaneous = %s
            AND subject IN ('W0', 'W1')
            AND DATE(createdat) = %s
        """, (schedule_id, date))
        
        water_result = cursor.fetchone()
        
        return 'completed' if water_result['water_count'] > 0 else 'pending'
        
    finally:
        cursor.close()
        conn.close()

@app.route('/api/watering-data')
def get_watering_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get all active schedules
        cursor.execute("""
            SELECT 
                idSchedule,
                CONCAT(DATE(startdate), ' ', TIME(time)) as schedule_time,
                CONCAT(duration, ' min') as duration
            FROM schedule
            WHERE onoff = 1
            ORDER BY time
        """)
        
        schedules = cursor.fetchall()
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        result = []
        for schedule in schedules:
            schedule_data = {
                'ID': schedule['idSchedule'],
                'schedule_time': schedule['schedule_time'],
                'duration': schedule['duration'],
                'yesterday_flow': get_flow_status(schedule['idSchedule'], yesterday),
                'today_flow': get_flow_status(schedule['idSchedule'], today)
            }
            result.append(schedule_data)
            
        return jsonify(result)
        
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 