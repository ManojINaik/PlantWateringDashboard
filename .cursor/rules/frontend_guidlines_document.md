# Plant Watering Dashboard Documentation

This document outlines the guidelines and specifications for both the backend and frontend development of the Plant Watering Dashboard application.  It's divided into two main sections:

1.  **Backend Guidelines:** Covers database interactions, API design, data processing, and error handling.
2.  **Frontend Guidelines:**  Covers UI/UX design, styling, components, and overall user experience.

---

## Backend Guidelines

### 1. System Overview and Context

The plant watering system is managed by UNO devices (e.g., Arduino UNOs) which send log data to a MySQL database.  This data represents the status and operations of the watering process. The backend, built with Flask, interacts with this database to provide data to the frontend.

### 2. Database Configuration

The application uses a MySQL database. The following environment variables *must* be defined for successful connection:

*   `MYSQL_HOST`: Database host (e.g., `localhost`, `your_db_host.com`).
*   `MYSQL_USER`: Database username.
*   `MYSQL_PASSWORD`: Database password.
*   `MYSQL_DATABASE`: Name of the database (e.g., `greenbalconydrip`).

A `.env` file (based on `.env.example`) should be used to manage these variables.

### 3. Database Schema

The application primarily uses two tables:

*   **`schedule`**: Contains information about scheduled watering events.
    *   `idSchedule` (INT, Primary Key): Unique identifier for the schedule (linked to `logincredential.usernameid`).
    *   `startdate` (DATE): The date the schedule starts.
    *   `duration` (INT): Duration of watering in minutes.
    *   `time` (TIME):  The scheduled time for watering.
    *   `schdchange` (INT):  Schedule change count (not directly used in the dashboard).
    *   `onoff` (INT): Flag indicating if the schedule is active (1) or inactive (0).
    *   `weather` (INT):  Weather condition (not directly used in the dashboard).

*   **`miscellaneous`**: Contains log entries related to system events and status.
    *   `idMiscellaneous` (INT): Identifier, which refers to schedule id.
    *   `createdat` (DATETIME): Timestamp of the log entry.
    *   `subject` (VARCHAR): Type of log entry (e.g., 'getconfigrun', 'speedreading', 'W0', 'W1', 'BV', 'E1', 'E2').
    *   `reading` (VARCHAR): The value or data associated with the log entry (e.g., 'success', numerical values).

### 4. API Endpoint

The Flask backend exposes a single API endpoint:

*   **`/api/watering-data` (GET):**  Returns a JSON array of watering schedule data, including flow status for yesterday and today.

    *   **Response Format:**
        ```json
        [
            {
                "ID": 610,
                "schedule_time": "2025-01-01 00:33:27",
                "duration": "30 min",
                "yesterday_flow": "completed",
                "today_flow": "pending"
            },
            {
                "ID": 612,
                "schedule_time": "2025-01-02 10:15:00",
                "duration": "15 min",
                "yesterday_flow": "no data",
                "today_flow": "completed"
            },
            ...
        ]
        ```
     *  **Flow Status Logic:**
        1.  **`get_flow_status(schedule_id, date)` function:**
            *   Counts `miscellaneous` entries where `idMiscellaneous` matches `schedule_id`, `subject` is 'getconfigrun', `reading` is 'success', and the date part of `createdat` matches the provided `date`.
            *   If the count is 0, it returns `'no data'`.
            *   Counts `miscellaneous` entries where `idMiscellaneous` matches `schedule_id`, `subject` is 'W0' or 'W1', and the date part of `createdat` matches the provided `date`.
            *   If the count is > 0, it returns `'completed'`.  Otherwise, it returns `'pending'`.

        2.  **`get_watering_data()` function:**
            *   Retrieves active schedules from the `schedule` table (where `onoff` = 1), ordered by `time`.
            *   For each schedule, calculates the flow status for yesterday and today using `get_flow_status()`.
            *   Constructs a dictionary for each schedule with `ID`, `schedule_time`, `duration`, `yesterday_flow`, and `today_flow`.
            *   Returns a JSON array of these dictionaries.

### 5. Error Handling

*   **Database Connection Errors:** The `get_db_connection()` function handles connection errors, logging them to `app/logs/app.log` and returning `None`.  The API endpoint handles a failed connection by returning a 500 error with a JSON message.
*   **Missing Environment Variables:** The application checks for required environment variables and exits with an error message (both printed to the console and logged) if any are missing.
*   **Unexpected Errors:**  A general `try...except` block in the API endpoint catches unexpected exceptions, logs them, and returns a 500 error with the error message.
* **Detailed Logging**: The app.log provides timestamps, log levels (INFO, ERROR), and specific messages about database connections, query execution, data retrieval, and any errors encountered.

### 6. Code Style and Best Practices

*   **Clear Function Definitions:**  Use descriptive function names and docstrings to explain the purpose, parameters, and return values of each function.
*   **Database Connection Management:** Use a `get_db_connection()` function to establish and return database connections, ensuring connections are closed in `finally` blocks.
*   **Error Handling:** Implement `try...except...finally` blocks for database operations and API endpoint logic to handle potential errors gracefully.
*   **Environment Variables:** Use the `python-dotenv` package to manage environment variables from a `.env` file.
*   **Logging:** Utilize the `logging` module to log important events and errors to `app/logs/app.log`.
*   **Comments:** Include comments to explain complex logic, particularly the flow status determination.
* **Type Hints**: All the codebase should follow type hints.

### 7. Running the Backend

1.  **Install Dependencies:** `pip install -r requirements.txt` (within a virtual environment is recommended).
2.  **Configure Environment Variables:** Create a `.env` file and set the required database connection variables.
3.  **Run the Flask Application:** `python app/app.py`
4.  The API will be accessible at `http://localhost:5000/api/watering-data`.  The main page (`/`) serves the `index.html` template.

---

## Frontend Guidelines

### 1. UI/UX Overview

The frontend is a single-page application (SPA) built using React and the shadcn/ui component library.  The primary goal is to provide a clear, real-time dashboard for monitoring plant watering schedules. The design emphasizes:

*   **Readability:** Easy-to-read table with clear data presentation.
*   **Real-time Updates:**  Data refreshes every 30 seconds to reflect the latest status.
*   **Status Indication:**  Color-coded badges for immediate visual feedback on flow status (completed, pending, no data).
*   **Responsiveness:** The table should adapt to different screen sizes.

### 2. Component Structure

The main components are:

*   **`App.tsx` (or `page.tsx` in Next.js):**  The main application component that fetches data and renders the `WateringTable`.
*   **`WateringTable.tsx`:** A reusable component that displays the watering schedule data in a table format.  It includes:
    *   **`Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`:**  shadcn/ui components for structuring the table.
    *   **`Badge`:**  A shadcn/ui component used to display the flow status (completed, pending, no data) with distinct colors.

### 3. Styling and Design Principles

*   **Minimalist Design:** Clean, uncluttered layout with a focus on the data.
*   **Consistent Spacing:**  Use consistent padding and margins throughout the application.
*   **Readable Typography:**  Choose a font that is easy to read, even at small sizes.
*   **Accessibility:** Ensure sufficient contrast between text and background colors.

### 4. Color Palette

*   **Primary:**  `hsl(var(--primary))`  (used for main elements, buttons) - Defined in `globals.css`.  Likely a shade of green to match the "plant" theme.
*   **Primary Foreground:** `hsl(var(--primary-foreground))` (text color on primary background).
*   **Secondary:** `hsl(var(--secondary))` (used for less prominent elements).
*   **Secondary Foreground:** `hsl(var(--secondary-foreground))`.
*   **Background:** `hsl(var(--background))` (main background color).
*   **Foreground:** `hsl(var(--foreground))` (main text color).
*   **Border:** `hsl(var(--border))` (used for table borders, etc.).
*   **Muted:** `hsl(var(--muted))` (used for less important text or backgrounds).
*   **Muted Foreground:** `hsl(var(--muted-foreground))`.
*   **Accent:** `hsl(var(--accent))` (used for highlights).
*   **Accent Foreground:** `hsl(var(--accent-foreground))`.
*   **Destructive:** `hsl(var(--destructive))` (used for error messages or critical actions).
*   **Destructive Foreground:** `hsl(var(--destructive-foreground))`.
*   **Ring:** `hsl(var(--ring))` (used for focus rings).

**Status Badges:**

*   **Completed:** `bg-green-100 text-green-800` (Green background, dark green text).  Consider shades like `#e6ffe6` and `#1b5e20`.
*   **Pending:** `bg-yellow-100 text-yellow-800` (Yellow background, dark yellow text). Consider shades like `#ffffe0` and `#b8860b`.
*   **No Data:** `bg-gray-100 text-gray-800` (Light gray background, dark gray text). Consider shades like `#f5f5f5` and `#424242`.

### 5. Fonts

*   **Primary Font:**  `Inter` (as defined in `layout.tsx`). A sans-serif font known for its readability.
*   **Fallback Fonts:** Consider adding fallback fonts in case `Inter` is not available: `sans-serif`.

    Example CSS (within a global stylesheet or component):

    ```css
    body {
      font-family: "Inter", sans-serif;
    }
    ```

### 6. Icons

*   The frontend utilizes the `lucide-react` library for icons.
*   Current icons in the project include:
    *  Leaf
    *  Droplets
    *  Clock
    * ChevronDown
    * ChevronUp
    * Search
    * Filter
    * Bell
*  Consider an alternative for when the dashboard has no data, a visual representation of "No Data" would help

### 7. Data Fetching and Updating

*   The frontend uses `fetch` (or `axios`) to retrieve data from the `/api/watering-data` endpoint.
*   Data is fetched initially when the component mounts (`useEffect` hook).
*   Data is refreshed every 30 seconds using `setInterval`.
*   The `fetchData` function handles errors by logging them to the console.
*   A loading state is implemented (`loading` state variable) to display a "Loading..." message while fetching data.

### 8. Table Structure

The `WateringTable` component renders a table with the following columns:

| Column Header   | Description                                      | Data Source                 |
| --------------- | ------------------------------------------------ | --------------------------- |
| ID              | Schedule ID                                      | `row.ID`                    |
| Schedule Time   | Date and time of the scheduled watering event    | `row.schedule_time`         |
| Duration        | Duration of the watering event (in minutes)     | `row.duration`              |
| Yesterday Flow  | Status of watering for yesterday                | `row.yesterday_flow`        |
| Today Flow      | Status of watering for today                    | `row.today_flow`           |

Each row in the table represents a single watering schedule. The "Yesterday Flow" and "Today Flow" columns display the status using color-coded badges.

### 9. Responsiveness

*   The table should be horizontally scrollable on smaller screens to accommodate all columns. This is handled by wrapping the `Table` component in a `div` with `overflow-x: auto`.
*   Consider using media queries (or a responsive CSS framework) to adjust font sizes and spacing for optimal viewing on different devices.

### 10. Error Handling (Frontend)

*   The `fetchData` function includes a `try...catch` block to handle errors during data fetching.  Errors are logged to the console.
*   Consider displaying a user-friendly error message on the UI if data fetching fails.  For example, you could add a state variable like `error` and conditionally render an error message based on its value.

### 11. Code Style and Best Practices

*   **Consistent Formatting:** Use a consistent code style (e.g., Prettier, ESLint) to ensure readability.
*   **Component Reusability:**  Design components (like `WateringTable`) to be reusable.
*   **Descriptive Naming:** Use descriptive variable and function names.
*   **Comments:**  Add comments to explain complex logic or non-obvious code.
*   **Type Safety:** Use TypeScript for type checking and improved code maintainability.
* **Loading states**: Use a loading state to improve UX

### 12. Accessibility (a11y)

*   **Semantic HTML:** Use semantic HTML elements (e.g., `<table>`, `<thead>`, `<th>`, `<tbody>`, `<tr>`, `<td>`) for the table structure.
*   **ARIA Attributes:** Consider using ARIA attributes (if needed) to enhance accessibility for screen readers.
*   **Keyboard Navigation:** Ensure that the table and its contents are navigable using the keyboard.
*   **Contrast**: Ensure colors used follow accessibility guidelines (WCAG)

### 13. Additional Considerations

*   **User Authentication:**  The current implementation does not include user authentication. If required, this would need to be implemented on both the backend (Flask) and frontend (React).
*   **Data Validation:**  While the backend performs some data validation (e.g., checking environment variables), consider adding frontend validation for user inputs (if any) to prevent errors.
* **Mobile first approach**: When making a responsive design, try to implement first for mobile
*   **Testing:** Implement unit and integration tests for both the backend and frontend to ensure code quality and prevent regressions.

This comprehensive document provides a solid foundation for developing and maintaining the Plant Watering Dashboard. By adhering to these guidelines, we can ensure a consistent, robust, and user-friendly application.