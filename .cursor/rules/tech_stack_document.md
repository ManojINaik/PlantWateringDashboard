# Tech Stack Document: Plant Watering Admin Dashboard

This document outlines the technical details, dependencies, and setup instructions for the Plant Watering Admin Dashboard project.

## Project Overview

This project implements a real-time admin dashboard for monitoring plant watering schedules and flow status. It uses a Flask (Python) backend to interact with a MySQL database and a React frontend (using shadcn/ui) with AJAX for data updates.

## 1. Backend (Flask)

### 1.1. Language and Framework

-   **Python**: Version 3.8 or higher is recommended.  The provided `app.py` code is written in Python.
-   **Flask**: A lightweight WSGI web application framework.  Version 2.0.1 is specified in `requirements.txt`.
-   **Flask-CORS**: Handles Cross-Origin Resource Sharing, allowing the frontend (running on a different port/domain) to make requests to the Flask API. Version 3.0.10 is specified.

### 1.2. Database

-   **MySQL**:  The project uses MySQL as its database.  The `mysql-connector-python` package (version 8.0.26) is required to connect to the database. You will need a MySQL server running and accessible.
-   **Database Setup**:
    -   Create a database named `greenbalconydrip` (or change the name in `.env`).
    -   Import the necessary SQL tables (`schedule` and `miscellaneous`) into your MySQL database. You can use the provided SQL dump files (e.g., `greenbalconydrip_schedule.sql`, `greenbalconydrip_miscellaneous.sql`) in the `Admin_Dashpage/Dump20250215/` or `Admin_Dashpage/New folder (2)/` directory as a starting point.  The `New folder (2)` version appears to be the more recently modified SQL schema.
    - Ensure your MySQL user has the appropriate permissions (SELECT, INSERT, UPDATE, DELETE) on the `greenbalconydrip` database and its tables.

### 1.3. Dependencies

The following Python packages are required.  They are listed in `requirements.txt`:

-   `Flask==2.0.1`
-   `Flask-CORS==3.0.10`
-   `mysql-connector-python==8.0.26`
-   `python-dotenv==0.19.0`  (For loading environment variables from `.env`)
-   `Werkzeug==2.0.3` (A dependency of Flask)

### 1.4. Installation (Backend)

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd plant-watering-admin-dashboard
    ```

2.  **Create a virtual environment (recommended):**

    ```bash
    python3 -m venv venv_new
    ```

3.  **Activate the virtual environment:**

    -   **Linux/macOS:**
        ```bash
        source venv_new/bin/activate
        ```
    -   **Windows:**
        ```bash
        venv_new\Scripts\activate
        ```

4.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

5. **Create a .env file**:
Copy the file .env.example to .env and then change the credential to your credential

    ```
    MYSQL_HOST=localhost
    MYSQL_USER=your_username
    MYSQL_PASSWORD=your_password
    MYSQL_DATABASE=greenbalconydrip
    PORT=5000
    ```

### 1.5. Running the Flask Application

From the project root directory, run:

```bash
python app/app.py
```

This will start the Flask server on port 5000.

