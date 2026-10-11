
# University Research Opportunity Portal

## 1. Project Overview

The University Research Opportunity Portal is a web application that allows users to manage university research opportunities. Users can create, view, update, close, and delete research opportunities.

The application uses a REST API built with FastAPI, a MySQL database for persistent storage, and a frontend built with HTML, CSS, and JavaScript.

## 2. Technologies Used

- Python
- FastAPI
- Uvicorn
- MySQL
- MySQL Connector for Python
- HTML
- CSS
- JavaScript
- Postman for API testing

## 3. Features

- Create research opportunities
- Retrieve all opportunities
- Retrieve an opportunity by ID
- Update opportunity details
- Close an opportunity by changing its status to `Closed`
- Delete an opportunity
- Validate required fields and input values
- Return appropriate HTTP status codes for successful requests and errors
- Display opportunities retrieved from the API and database

## 4. Project Structure

```text
University-Research-Opportunity-Portal/
├── backend/
│   ├── main.py
│   ├── database.py
│   └── test_db.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── postman/
│   └── University-Research-Opportunity-Portal-API-Tests.json
├── database.sql
├── .env
├── .gitignore
└── README.md
```

## 5. Prerequisites

Install the following software before running the project:

- Python
- MySQL Server
- Visual Studio Code
- A modern web browser

Postman is recommended for testing the API.

## 6. Database Setup

1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `database.sql`.
3. Execute the SQL script to create the database and table.

The database is named `research_opportunity_portal`, and the table is named `opportunities`.

## 7. Environment Configuration

Create a `.env` file in the project root with the following settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=research_opportunity_portal
```

Replace `your_mysql_password` with your own local MySQL password. Do not commit real credentials to GitHub.

## 8. Install Python Dependencies

Open PowerShell in the project root and run:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install fastapi uvicorn mysql-connector-python python-dotenv
```

If PowerShell blocks virtual-environment activation, use the Python executable from your existing virtual environment instead.

## 9. Run the Backend

From the project root, run:

```powershell
python -m uvicorn main:app --reload --app-dir backend
```

The API will be available at:

`http://127.0.0.1:8000`

Interactive API documentation is available at:

`http://127.0.0.1:8000/docs`

## 10. Run the Frontend

Open `frontend/index.html` using the VS Code Live Server extension.

The frontend communicates with the FastAPI backend at `http://127.0.0.1:8000`.

Keep the backend running while using the website.

## 11. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/opportunities` | Create an opportunity |
| GET | `/api/opportunities` | Retrieve all opportunities |
| GET | `/api/opportunities/{opportunity_id}` | Retrieve one opportunity |
| PUT | `/api/opportunities/{opportunity_id}` | Update an opportunity |
| DELETE | `/api/opportunities/{opportunity_id}` | Delete an opportunity |

## 12. HTTP Status Codes

- `200 OK`: A request completed successfully.
- `201 Created`: An opportunity was created successfully.
- `400 Bad Request`: The request contains invalid data.
- `404 Not Found`: The requested opportunity does not exist.
- `500 Internal Server Error`: An unexpected server-side error occurred.

## 13. API Testing

The exported Postman collection is stored in the `postman` folder. Import the JSON file into Postman to run the saved API requests.

The tests cover retrieving, creating, updating, closing, and deleting opportunities, as well as invalid requests and missing records.

## 14. Security Notes

- Keep `.env` out of version control.
- Do not publish database passwords or other secrets.
- Use sample data for demonstrations.
