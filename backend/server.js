const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'greenbalconydrip',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to MySQL database');
  connection.release();
});

// Parse reading data
const parseReading = (reading) => {
  if (!reading) return null;

  try {
    // Split multiple readings if present
    const readings = reading.split('~').filter(Boolean);
    let result = {
      timestamp: null,
      batteryVoltage: null,
      flowReading: null,
      finalFlowReading: null,
      timeElapsed: null,
      wateringStatus: null
    };

    // Process each reading segment
    readings.forEach(segment => {
      const parts = segment.split(':');
      if (parts.length < 2) {
        console.warn('Invalid segment format:', segment);
        return;
      }

      const timestamp = parseInt(parts[0]);
      if (isNaN(timestamp)) {
        console.warn('Invalid timestamp:', parts[0]);
        return;
      }

      const type = parts[1];

      // Update timestamp if not set
      if (!result.timestamp) {
        result.timestamp = timestamp;
      }

      // Parse based on reading type
      switch (type) {
        case 'BV': // Battery voltage
          if (parts[2]) {
            const rawValue = parseInt(parts[2]);
            if (!isNaN(rawValue)) {
              // Convert raw value to voltage (assuming 12-bit ADC with 3.3V reference)
              // For values around 2500-2600, this should give us ~3.7V
              const voltage = (rawValue / 4095) * 3.3 * 2;
              if (voltage >= 2.5 && voltage <= 4.5) { // Valid LiPo voltage range
                result.batteryVoltage = voltage;
              } else {
                console.warn('Battery voltage out of range:', voltage);
              }
            } else {
              console.warn('Invalid battery voltage value:', parts[2]);
            }
          }
          break;

        case 'W0': // Watering start
          if (parts.length >= 4) {
            result.wateringStatus = 'start';
            const elapsed = parseInt(parts[2]);
            if (!isNaN(elapsed) && elapsed >= 0) {
              result.timeElapsed = elapsed;
            } else {
              console.warn('Invalid time elapsed value:', parts[2]);
            }

            const flow = parseInt(parts[3]);
            if (!isNaN(flow) && flow >= 0) {
              result.flowReading = flow;
            } else {
              console.warn('Invalid flow reading:', parts[3]);
            }
          } else {
            console.warn('Invalid W0 format:', segment);
          }
          break;

        case 'W1': // Watering stop
          if (parts.length >= 4) {
            result.wateringStatus = 'stop';
            const elapsed = parseInt(parts[2]);
            if (!isNaN(elapsed) && elapsed >= 0) {
              result.timeElapsed = elapsed;
            } else {
              console.warn('Invalid time elapsed value:', parts[2]);
            }

            const flow = parseInt(parts[3]);
            if (!isNaN(flow) && flow >= 0) {
              result.finalFlowReading = flow;
            } else {
              console.warn('Invalid final flow reading:', parts[3]);
            }
          } else {
            console.warn('Invalid W1 format:', segment);
          }
          break;

        case 'E1': // Error or event
          if (parts.length >= 3) {
            const elapsed = parseInt(parts[2]);
            if (!isNaN(elapsed) && elapsed >= 0) {
              result.timeElapsed = elapsed;
            } else {
              console.warn('Invalid time elapsed value:', parts[2]);
            }
          } else {
            console.warn('Invalid E1 format:', segment);
          }
          break;

        default:
          console.warn('Unknown reading type:', type);
          break;
      }
    });

    // Only return if we have any valid data
    if (result.timestamp && (
      result.batteryVoltage !== null ||
      result.flowReading !== null ||
      result.finalFlowReading !== null ||
      result.timeElapsed !== null
    )) {
      // Debug log with more detail
      console.log('Parsed result:', {
        ...result,
        rawReading: reading,
        batteryVoltageRaw: result.batteryVoltage ? result.batteryVoltage.toFixed(2) + 'V' : 'null',
        flowReadingRaw: result.flowReading ? result.flowReading + ' L/min' : 'null',
        finalFlowReadingRaw: result.finalFlowReading ? result.finalFlowReading + ' L/min' : 'null',
        timeElapsedRaw: result.timeElapsed ? result.timeElapsed + ' ms' : 'null'
      });
      return result;
    }

    console.warn('No valid data in reading:', reading);
    return null;
  } catch (error) {
    console.error('Error parsing reading:', error, 'Raw reading:', reading);
    return null;
  }
};

// API Routes
app.get('/api/sensor-data', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      'SELECT idMiscellaneous, subject, reading, createdat FROM miscellaneous WHERE subject = "speedreading" ORDER BY createdat DESC LIMIT 100'
    );

    if (!rows || rows.length === 0) {
      console.warn('No rows found in database');
      return res.json([]);
    }

    console.log('Sample row:', rows[0]); // Debug log

    const processedData = rows.map(row => {
      const parsed = parseReading(row.reading);
      if (!parsed) return null;

      return {
        id: row.idMiscellaneous,
        timestamp: parsed.timestamp,
        batteryVoltage: parsed.batteryVoltage,
        flowReading: parsed.flowReading,
        finalFlowReading: parsed.finalFlowReading,
        timeElapsed: parsed.timeElapsed,
        wateringStatus: parsed.wateringStatus
      };
    }).filter(Boolean); // Remove null entries

    console.log('Total processed rows:', processedData.length); // Debug log
    if (processedData.length > 0) {
      console.log('Sample processed row:', processedData[0]); // Debug log
    } else {
      console.warn('No valid data after processing');
    }

    res.json(processedData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      'SELECT idSchedule, startdate, duration, time, onoff FROM schedule ORDER BY startdate DESC, time DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});