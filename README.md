# Plant Watering Admin Dashboard

A real-time admin dashboard for monitoring plant watering schedules and flow status. The dashboard displays schedule information and watering flow status for both yesterday and today.

## Features

- Real-time data updates every 30 seconds
- Display of schedule IDs, times, and durations
- Status tracking for yesterday's and today's watering flows
- Color-coded status indicators (completed, pending, no data)
- Responsive design with scrollable table

## Prerequisites

- Python 3.8 or higher
- MySQL Server
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd plant-watering-admin-dashboard
```

2. Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Configure the environment variables:
   - Copy the `.env.example` file to `.env`
   - Update the database credentials and other settings in `.env`

## Usage

1. Start the Flask application:
```bash
python app/app.py
```

2. Open a web browser and navigate to:
```
http://localhost:5000
```

The dashboard will automatically refresh every 30 seconds to show the latest data.

## Data Structure

The dashboard processes the following data:

- Schedule information from MySQL database
- Log entries with various types:
  - getconfigrun: Configuration retrieval status
  - speedreading: Sensor and event data
  - W0/W1: Watering stop/start events
  - BV: Battery voltage readings
  - E1/E2: Error codes

## Flow Status Definitions

- **Completed**: A successful configuration retrieval followed by a watering event
- **Pending**: A successful configuration retrieval without a watering event
- **No Data**: No log entries found for the scheduled period

## Troubleshooting

Check the application logs in `app/logs/app.log` for detailed error messages and debugging information.

## License

[Your License Here] 