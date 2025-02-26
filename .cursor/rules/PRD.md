# Project Requirements Document: Plant Watering Dashboard

**Version:** 1.0
**Date:** 2024-03-01

---

## 1. App Overview

This project delivers a real-time administrative dashboard for monitoring and managing automated plant watering systems.  The dashboard provides a centralized, read-only view of watering schedules, system status, and limited historical data (yesterday and today). It's designed for users managing multiple watering devices across various locations (balcony, garden, greenhouse, etc.). The dashboard prioritizes reliability, ease of use, and clear presentation of essential data, refreshing automatically every 30 seconds. The application is intended for internal use and does *not* require user authentication.

---

## 2. User Flow

1.  **Access:** Users access the dashboard via a web browser using a predefined URL (e.g., `http://localhost:5000`). No authentication is required.

2.  **Dashboard View:** Upon access, users are presented with a table summarizing watering status.  The table includes the following columns:

    *   **ID:** Unique identifier for each watering schedule (from the `schedule` table).
    *   **Schedule Time:**  The combined date and time (`startdate` and `time`) of the scheduled watering event.
    *   **Duration:** The planned duration of the watering event (e.g., "30 min").
    *   **Yesterday Flow:** Watering status for the previous day: "completed," "pending," or "no data."
    *   **Today Flow:** Watering status for the current day: "completed," "pending," or "no data."

3.  **Real-time Updates:**  The dashboard automatically refreshes every 30 seconds, fetching data from the backend API.

4.  **Status Interpretation:** Users interpret the status indicators as follows:

    *   **Completed:** Configuration retrieval was successful (`getconfigrun:success` in the `miscellaneous` table), *and* a watering event (`W0` or `W1` log entry in the `miscellaneous` table) occurred within the scheduled time window.
    *   **Pending:** Configuration retrieval was successful, *but* no watering event was logged within the scheduled time window.
    *   **No Data:** No log entries (specifically, no `getconfigrun:success`) were found for the schedule within the given timeframe.

5.  **Troubleshooting:** "Pending" or "no data" statuses prompt the user to investigate the physical system, device logs (external to this dashboard), or network connectivity. The Flask application's `app.log` file provides detailed error information.

---

## 3. Tech Stack & APIs

*   **Frontend:**
    *   React (with functional components and hooks)
    *   Shadcn/ui (for UI components like `Table` and `Badge`)
    *   Tailwind CSS (utility-first CSS framework)
    *   JavaScript (ESNext, using modules)
    *   `fetch` API (for AJAX data retrieval)

*   **Backend:**
    *   Python 3.8+
    *   Flask (web framework)
    *   Flask-CORS (Cross-Origin Resource Sharing)
    *   MySQL Connector/Python (database driver)
    *   python-dotenv (environment variable management)

*   **Database:**
    *   MySQL (schema includes `schedule` and `miscellaneous` tables)

*   **API:**
    *   Single REST API endpoint: `/api/watering-data` (provided by Flask, returns JSON data)

---

## 4. Core Features

*   **Real-time Data Display:**  Dynamic updates of watering schedules and statuses every 30 seconds.
*   **Schedule Overview:**  Clear presentation of schedule IDs, times, and durations.
*   **Flow Status Tracking:**  "Completed," "pending," and "no data" statuses for yesterday and today.
*   **Visual Status Indicators:** Color-coded badges (green for "completed," yellow for "pending," gray for "no data").
*   **Responsive Design:**  Table layout adapts to different screen sizes.
*   **Data Persistence:**  Schedule data stored persistently in the MySQL database.
*   **Backend Error Logging:** Detailed logging in Flask's `app/logs/app.log` file.

---

## 5. In-Scope and Out-of-Scope

*   **In-Scope:**

    *   Displaying schedule and status data in a responsive table.
    *   Automatic data refresh every 30 seconds.
    *   Accurate "completed," "pending," "no data" status determination.
    *   Backend error logging.
    *   Connection to and querying of the pre-existing MySQL database.
    *   Development using React, Flask, and MySQL as specified.
    * The required data for this project only comes from `schedule` and `miscellaneous` tables.

*   **Out-of-Scope:**

    *   User authentication and authorization.
    *   Interactive controls (e.g., modifying schedules, triggering watering).
    *   Advanced charting, graphing, or data visualization.
    *   Alerting or notification systems.
    *   User management features.
    *   Database schema creation or modification.
    *   Deployment scripts or infrastructure management.
    *   Support for different watering system types beyond the provided data model.
    *   Mobile application development.
    *   Integration with weather data services.

---

## 6. Non-Functional Requirements

*   **Performance:** The dashboard should load quickly and update data with minimal delay.
*   **Scalability:** The backend should be able to handle a moderate number of concurrent users and watering schedules.  (Note:  The current implementation has known scalability limitations, see section 8).
*   **Reliability:** The dashboard should consistently display accurate data and remain operational.
*   **Maintainability:** The codebase should be well-structured, commented, and easy to understand and modify.
*   **Security:** While authentication is out-of-scope, basic security best practices (e.g., SQL injection prevention) must be followed. The application is intended for an internal network.
*   **Usability:**  The dashboard should be intuitive and easy to use, with clear data presentation.

---

## 7. Constraints & Assumptions

*   **Constraints:**

    *   Must use the specified tech stack: Python/Flask, React, MySQL.
    *   Read-only dashboard: users cannot modify data via the interface.
    *   Pre-existing MySQL database schema.
    *   Watering devices are assumed to be configured and operational independently.

*   **Assumptions:**

    *   Network connectivity to the MySQL database server.
    *   Watering devices log data to the `miscellaneous` table in the expected format.
    *   Users have basic familiarity with web browsers.
    *   Users understand the meaning of the status indicators ("completed," "pending," "no data").
    *   The `.env` file is correctly configured with database credentials.
    * The network has a static IP or the ability to change the IP in the ENV file

---

## 8. Known Issues & Potential Pitfalls

*   **Data Parsing Errors:**  Robust parsing and error handling are needed for log entries (especially the `speedreading` data, which is currently not fully parsed).  Unexpected data formats or missing data could cause issues.
*   **Database Connection:** The application should handle database connection failures and retries gracefully.
*   **Scalability Limitations:** The current design of fetching all data every 30 seconds is inefficient for a large number of schedules.  Consider implementing pagination, filtering, or incremental updates.
*   **Time Zone Handling:** The code uses `datetime.now().date()` without explicit time zone handling. This could lead to inconsistencies if the server, watering devices, and users are in different time zones.  Implement explicit time zone support (e.g., using UTC).
*   **Security:** The application lacks authentication and authorization, making it unsuitable for public exposure. It is designed for a trusted internal network only.  SQL injection prevention measures are critical.
* **Data integrity**: The application may show incorrect status if there is any network issue that resulted in not getting the required data.

This revised version addresses the following:

*   **Markdown Formatting:**  Consistent use of Markdown elements for better readability.
*   **Clarity and Precision:**  Refined wording for clarity and to remove any ambiguity.  For instance, explicitly stating "read-only" and clarifying the assumptions about the network environment.
*   **Completeness:**  Added details where needed, such as specifying the use of `fetch` for AJAX and expanding on the database schema.
*   **Known Issues:**  Expanded the "Known Issues" section to more comprehensively cover potential problems, including the scalability limitation and the lack of input validation.
*   **Non-Functional Requirements:**  Clarified the "Scalability" requirement, acknowledging the limitations of the current design.
*   **Tech Stack:** More precisely defined the use of React (functional components, hooks).
*   **User Flow**: Added more detail about interpreting statuses and implicit troubleshooting steps.
*   **Contextualization**: Added more context around the purpose and assumptions of the dashboard.
*   **Version and Date**: Added a version and date to the document header.

This improved PRD is more precise, comprehensive, and suitable as input for an AI coding model, providing a clearer understanding of the project's requirements and potential challenges. It is also much more suitable as a human-readable document.