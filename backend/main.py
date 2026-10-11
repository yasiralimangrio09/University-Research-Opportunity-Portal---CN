
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import date
from database import get_db_connection

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Invalid request data. Please check the required fields and their values."
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Opportunity(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    research_area: str = Field(min_length=1, max_length=100)
    faculty_name: str = Field(min_length=1, max_length=100)
    department: str = Field(min_length=1, max_length=100)
    required_skills: str = Field(min_length=1)
    available_positions: int = Field(gt=0)
    application_deadline: date
    status: str = "Open"


@app.get("/")
def home():
    return {"message": "Research Opportunity Portal API is running"}


@app.post("/api/opportunities", status_code=201)
def create_opportunity(opportunity: Opportunity):
    if opportunity.status not in ["Open", "Closed"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be Open or Closed"
        )

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO opportunities
            (title, description, research_area, faculty_name,
             department, required_skills, available_positions,
             application_deadline, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            opportunity.title,
            opportunity.description,
            opportunity.research_area,
            opportunity.faculty_name,
            opportunity.department,
            opportunity.required_skills,
            opportunity.available_positions,
            opportunity.application_deadline,
            opportunity.status
        )

        cursor.execute(query, values)
        connection.commit()

        new_id = cursor.lastrowid

        return {
            "message": "Research opportunity created successfully",
            "id": new_id,
            **opportunity.model_dump(mode="json")
        }

    except Exception as error:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not create research opportunity"
        ) from error

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.get("/api/opportunities")
def get_opportunities():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM opportunities")
        opportunities = cursor.fetchall()

        return opportunities

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve research opportunities"
        ) from error

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.get("/api/opportunities/{opportunity_id}")
def get_opportunity(opportunity_id: int):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM opportunities WHERE id = %s",
            (opportunity_id,)
        )

        opportunity = cursor.fetchone()

        if opportunity is None:
            raise HTTPException(
                status_code=404,
                detail="Research opportunity not found"
            )

        return opportunity

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve research opportunity"
        ) from error

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.put("/api/opportunities/{opportunity_id}")
def update_opportunity(opportunity_id: int, opportunity: Opportunity):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT id FROM opportunities WHERE id = %s",
            (opportunity_id,)
        )

        existing = cursor.fetchone()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Research opportunity not found"
            )

        query = """
            UPDATE opportunities
            SET title = %s,
                description = %s,
                research_area = %s,
                faculty_name = %s,
                department = %s,
                required_skills = %s,
                available_positions = %s,
                application_deadline = %s,
                status = %s
            WHERE id = %s
        """

        values = (
            opportunity.title,
            opportunity.description,
            opportunity.research_area,
            opportunity.faculty_name,
            opportunity.department,
            opportunity.required_skills,
            opportunity.available_positions,
            opportunity.application_deadline,
            opportunity.status,
            opportunity_id
        )

        cursor.execute(query, values)
        connection.commit()

        return {
            "message": "Research opportunity updated successfully",
            "id": opportunity_id,
            **opportunity.model_dump(mode="json")
        }

    except HTTPException:
        raise

    except Exception as error:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not update research opportunity"
        ) from error

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.delete("/api/opportunities/{opportunity_id}")
def delete_opportunity(opportunity_id: int):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM opportunities WHERE id = %s",
            (opportunity_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Research opportunity not found"
            )

        connection.commit()

        return {
            "message": "Research opportunity deleted successfully",
            "id": opportunity_id
        }

    except HTTPException:
        raise

    except Exception as error:
        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not delete research opportunity"
        ) from error

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
