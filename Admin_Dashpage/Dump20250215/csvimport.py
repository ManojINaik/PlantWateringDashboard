import csv
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    # Database connection
    conn = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', '182003'),
        database=os.getenv('MYSQL_DATABASE', 'greenbalconydrip')
    )
    cursor = conn.cursor(prepared=True)  # Use prepared statements
    print("Successfully connected to database")

    # Read CSV file
    csv_path = os.path.join(os.path.dirname(__file__), "data_miscellaneous1.csv")
    
    with open(csv_path, 'r') as file:
        csv_reader = csv.reader(file)
        next(csv_reader)  # Skip header row
        records_count = 0
        error_count = 0
        
        # Prepare the SQL statement
        sql = """
        INSERT INTO miscellaneous (idMiscellaneous, subject, reading, createdat) 
        VALUES (?, ?, ?, ?)
        """
        
        # Read and process the file
        for row in csv_reader:
            try:
                if len(row) >= 4:
                    # Clean and prepare the data
                    idMisc = int(row[0].strip())
                    subject = row[1].strip()
                    reading = row[2].strip()
                    createdat = row[3].strip().strip('"')
                    
                    # Execute the prepared statement
                    cursor.execute(sql, (idMisc, subject, reading, createdat))
                    records_count += 1
                    
                    if records_count % 100 == 0:
                        print(f"Processed {records_count} records...")
                        conn.commit()
                else:
                    error_count += 1
                    print(f"Skipping malformed row {records_count + error_count}: {row}")
                    
            except mysql.connector.Error as err:
                error_count += 1
                if err.errno == 1062:  # Duplicate entry
                    print(f"Skipping duplicate entry for ID {row[0]}")
                else:
                    print(f"MySQL Error for row {row}:")
                    print(f"Error details: {err}")
            except Exception as e:
                error_count += 1
                print(f"Error processing row: {row}")
                print(f"Error details: {str(e)}")

        # Commit any remaining records
        conn.commit()
        print(f"Import completed:")
        print(f"- Successfully imported: {records_count} records")
        print(f"- Errors/Skipped: {error_count} records")
        print(f"- Total processed: {records_count + error_count} records")

except Exception as e:
    print(f"Fatal error: {str(e)}")
    if 'conn' in locals() and conn.is_connected():
        conn.rollback()

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals() and conn.is_connected():
        conn.close()
        print("Database connection closed")
