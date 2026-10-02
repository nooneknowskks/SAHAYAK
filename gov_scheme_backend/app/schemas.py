from pydantic import BaseModel
from typing import List, Optional

class Scheme(BaseModel):
    id: str
    name: str
    state: str
    min_age: int
    max_income: Optional[int]
    category: str
    documents: List[str]
    benefits: str
    apply_link: str

class UserProfile(BaseModel):
    name: str
    age: int
    income: int
    state: str
    category: str

class ChatRequest(BaseModel):
    question: str