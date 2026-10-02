from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import json
import os
from .schemas import UserProfile, ChatRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Make the path robust by resolving it relative to the directory of main.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
schmes_file_path = os.path.join(BASE_DIR, "data", "schemes.json")

# Load schemes data
with open(schmes_file_path, "r") as f:
    schemes = json.load(f)


@app.get("/")
def home():
    return {"message": "Government Scheme Backend Running"}

@app.get("/schemes")
def get_schemes():
    return schemes

def get_eligible_schemes(user: UserProfile) -> list:
    eligible_schemes = []

    for scheme in schemes:

        # Age check
        if scheme["min_age"] is not None:
            if user.age < scheme["min_age"]:
                continue

        # Income check (only if max_income is not null)
        if scheme["max_income"] is not None:
            if user.income > scheme["max_income"]:
                continue

        # State check
        if scheme["state"] != "All" and scheme["state"].lower() != user.state.lower():
            continue

        # Category check (string, not list)
        if scheme["category"] != "All" and scheme["category"].lower() != user.category.lower():
            continue

        eligible_schemes.append(scheme)

    return eligible_schemes

@app.post("/check-eligibility")
def check_eligibility(user: UserProfile):
    eligible_schemes = get_eligible_schemes(user)
    return {
        "eligible_schemes": eligible_schemes
    }

@app.post("/ask")
def ask_question(chat: ChatRequest):
    q = chat.question.lower()

    # Simple extraction with default values
    extracted_age = 25
    extracted_income = 50000
    extracted_state = "Maharashtra"
    extracted_category = "General"

    if "student" in q:
        extracted_age = 20
        extracted_category = "Student"
    
    if "women" in q or "woman" in q or "girl" in q:
        extracted_category = "Women"
        
    if "farmer" in q or "farm" in q:
        extracted_category = "Farmer"

    user_profile = UserProfile(
        name="Chat User",
        age=extracted_age,
        income=extracted_income,
        state=extracted_state,
        category=extracted_category
    )

    eligible = get_eligible_schemes(user_profile)

    if eligible:
        scheme_names = [s["name"] for s in eligible]
        names_str = ", ".join(scheme_names)
        return {"reply": f"Based on your question, you may be eligible for these schemes: {names_str}"}
    else:
        return {"reply": "Sorry, no schemes found for your profile."}