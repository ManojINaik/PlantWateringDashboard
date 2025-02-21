# Plant Watering Admin Dashboard

A modern React-based admin dashboard for managing plant watering schedules and monitoring system data. The dashboard provides real-time monitoring of water flow, battery voltage, and scheduling capabilities.

## Features

### 1. Real-time Monitoring
- Water flow data visualization
- Battery voltage tracking
- System status monitoring
- Detailed watering event tracking (start/stop)

### 2. Schedule Management
- View and manage watering schedules
- Sort by multiple parameters
- Advanced search functionality
- Status tracking (Active/Inactive/Pending)

### 3. User Interface
- Modern Material-UI based design
- Responsive layout
- Interactive data tables
- Real-time data updates
- Advanced filtering and sorting
- Search functionality across all fields

## Data Format

### Watering Events
The system tracks two types of watering events:

1. **Watering Start (w1)**
```
epochtime:w1:milliseconds_elapsed:flow_reading~epochtime:battery_voltage~
```
Example:
```
1645789200:w1:1500:2.5~1645789200:3.8~
```
- `epochtime`: Unix timestamp when the event occurred
- `w1`: Indicates watering start
- `milliseconds_elapsed`: Time elapsed since water start
- `flow_reading`: Flow rate before opening (L/min)
- `battery_voltage`: Battery voltage reading (V)

2. **Watering Stop (w0)**
```
epochtime:w0:time_elapsed:flow_reading:milliseconds_after_closing:final_reading~epochtime:battery_voltage~
```
Example:
```
1645789500:w0:300000:2.5:1500:0.0~1645789500:3.7~
```
- `epochtime`: Unix timestamp when the event occurred
- `w0`: Indicates watering stop
- `time_elapsed`: Total watering duration (ms)
- `flow_reading`: Flow rate before closing (L/min)
- `milliseconds_after_closing`: Time elapsed after valve closed
- `final_reading`: Final flow rate reading (L/min)
- `battery_voltage`: Battery voltage reading (V)

## Technology Stack

### Frontend
- React
- TypeScript
- Material-UI (MUI)
- Recharts for data visualization
- date-fns for date formatting

### Backend
- Node.js/Express
- MySQL Database
- RESTful API

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v8.0 or higher)

## Project Setup

### 1. Database Setup

```sql
-- Create the database
CREATE DATABASE plant_watering;
USE plant_watering;

-- Create schedule table
CREATE TABLE schedule (
    idSchedule INT PRIMARY KEY AUTO_INCREMENT,
    startdate DATETIME NOT NULL,
    duration INT NOT NULL,
    time TIME NOT NULL,
    onoff TINYINT NULL
);

-- Create sensor_data table
CREATE TABLE sensor_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp DATETIME NOT NULL,
    flowReading FLOAT NULL,
    finalFlowReading FLOAT NULL,
    batteryVoltage FLOAT NULL,
    timeElapsed INT NULL,
    wateringStatus VARCHAR(10) NULL
);
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

Add the following to your `.env` file:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=plant_watering
PORT=5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
touch .env
```

Add the following to your `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
```

### Start the Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Schedule Management
- GET `/api/schedule` - Get all schedules
- POST `/api/schedule` - Create new schedule
- PUT `/api/schedule/:id` - Update schedule
- DELETE `/api/schedule/:id` - Delete schedule

### Sensor Data
- GET `/api/sensor-data` - Get sensor readings
- GET `/api/sensor-data/latest` - Get latest sensor reading
- POST `/api/sensor-data` - Record new sensor reading

## Project Structure

```
plant-watering-admin-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SensorDataChart.tsx
│   │   │   ├── BatteryVoltageChart.tsx
│   │   │   ├── ScheduleTable.tsx
│   │   │   └── UserDataTable.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── index.js
│   └── package.json
└── README.md
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Follow component-based architecture
- Implement proper error handling

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main

## Troubleshooting

### Common Issues

1. Database Connection
```bash
# Check MySQL service
sudo service mysql status

# Verify database credentials
mysql -u your_username -p
```

2. Backend API
```bash
# Check logs
npm run dev

# Verify API endpoints
curl http://localhost:5000/api/schedule
```

3. Frontend
```bash
# Clear npm cache
npm clean-cache --force

# Rebuild node modules
rm -rf node_modules
npm install
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 