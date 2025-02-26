# Plant Watering Admin Dashboard - Application Flow

This document describes the user flow through the Plant Watering Admin Dashboard application.

**1. Landing Page (and Only Page):**

-   The user arrives at the root URL (`/`).  The application directly serves the `index.html` file.  Because of the way `app.py` and the frontend code are structured, everything happens on this single page, dynamically updated via AJAX.  There are no other separate routes/pages in this application.
-   The `index.html` file contains the basic HTML structure, including:
    -   A `<head>` section with meta tags, a title ("Plant Watering Admin Dashboard"), and a link to Tailwind CSS styles.
    -   A `<body>` section with a single `<div>` with the ID "root". This is where the React application will be rendered.
    -   A `<script>` tag that loads the compiled JavaScript code for the React application (`/src/main.tsx`).
-   The `main.tsx` file initializes the React application and renders the main `App` component into the "root" div.
-   The React `App.tsx` renders:
    - Main Heading: "Plant Watering Admin Dashboard"
    - Watering Schedule Table:
        - Table headers: "ID", "Schedule Time", "Duration", "Yesterday Flow", "Today Flow".
        - The table is initially empty, showing a "Loading..." message.
        - Data for the table is fetched immediately after the initial render via an AJAX request to the `/api/watering-data` endpoint.
        - This endpoint is served by the Flask backend (defined in `app/app.py`).
        - The Flask backend queries the `schedule` and `miscellaneous` tables in the MySQL database to determine:
          - Schedule ID (`idSchedule`)
          - Schedule Time (combined `startdate` and `time` from `schedule`)
          - Duration (`duration` from `schedule`)
          - Yesterday's Flow Status (derived from `miscellaneous` table, checking for `getconfigrun` success and watering events (W0/W1))
          - Today's Flow Status (same logic as yesterday, but for today's date)
        - The Flask backend returns the data as JSON.
        - The React component updates its state with the received data, causing the table to re-render with the actual watering schedule information.  Each row displays:
            -   Schedule ID
            -   Schedule Time (concatenated date and time)
            -   Duration (with "min" appended)
            -   Yesterday's Flow: A badge with the status ("completed", "pending", or "no data"), styled with different background colors.
            -   Today's Flow: A badge with the status ("completed", "pending", or "no data"), styled with different background colors.
-   The `App.tsx` component sets up an interval (using `useEffect` and `setInterval`) that refetches the data from `/api/watering-data` every 30 seconds. This ensures the table is updated in real-time.

**2. Data Interaction (Backend - `app/app.py`)**

- **Database Connection:** The Flask application connects to a MySQL database using credentials provided in a `.env` file.  The `get_db_connection` function handles establishing this connection.
- **Data Retrieval:** The `/api/watering-data` endpoint performs the following:
    -   Queries the `schedule` table to get all active (onoff = 1) schedules.
    -   Calculates "yesterday" and "today" dates.
    -   For each schedule:
        -   Calls the `get_flow_status` function to determine the flow status ("completed", "pending", or "no data") for yesterday and today.
        -   `get_flow_status`:
            -   Checks for `getconfigrun` success in the `miscellaneous` table for the given schedule ID and date.
            -   Checks for watering events (W0 or W1) in the `miscellaneous` table for the given schedule ID and date.
            -   Returns the appropriate status string based on the presence/absence of these log entries.
    -   Constructs a JSON response containing an array of schedule data.
- **Error Handling:** The Flask application includes basic error handling for database connection issues and logs errors to `app/logs/app.log`.

**3. User Interaction (Frontend - React)**
    - There are no user interactions other than viewing the real time updated information in the table.

**Simplified Flow Summary:**

1.  User opens the web page.
2.  React app loads and makes an initial AJAX request to `/api/watering-data`.
3.  Flask backend queries the database, processes the data, and returns JSON.
4.  React app updates the table with the data.
5.  Every 30 seconds, steps 2-4 repeat to refresh the data.

There is no routing, separate pages, or user input. The app's sole purpose is to display the real-time data in the table.