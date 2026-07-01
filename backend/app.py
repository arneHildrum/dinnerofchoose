from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tinydb import TinyDB
from pathlib import Path
from typing import Annotated, List, Optional
import json
import random

DATA_DIR = Path("/app/dishes")
DB_PATH = Path("/app/data/db.json")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

db = TinyDB(DB_PATH)

class Dish(BaseModel):
    id: str
    name: str
    ingredients: List[str]
    steps: List[str]

app = FastAPI(title="Dinnerofchoose API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if True else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalize_text(value: Optional[str]) -> str:
    if value is None:
        return ""
    return value.strip().lower()


def load_dishes() -> List[dict]:
    db.truncate()
    dishes = []

    if not DATA_DIR.exists():
        return dishes

    for file_path in sorted(DATA_DIR.glob("*.json")):
        try:
            document = json.loads(file_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue

        document["id"] = str(document.get("id", file_path.stem))
        document["name"] = str(document.get("name", "Unnamed Dish")).strip()
        document["ingredients"] = [str(i).strip() for i in document.get("ingredients", []) if str(i).strip()]
        document["steps"] = [str(step).strip() for step in document.get("steps", []) if str(step).strip()]

        if document["name"] and document["ingredients"] and document["steps"]:
            dishes.append(document)

    if dishes:
        db.insert_multiple(dishes)

    return dishes


@app.on_event("startup")
def startup_event():
    load_dishes()


@app.get("/api/dishes")
def get_dishes(
    search: Annotated[Optional[str], Query(description="Search text for dish name or ingredient")] = None,
    ingredients: Annotated[Optional[str], Query(description="Comma-separated ingredient filter")] = None,
):
    dishes = db.all()

    if ingredients:
        required = [part.strip().lower() for part in ingredients.split(",") if part.strip()]
        if required:
            filtered = []
            for dish in dishes:
                text_ingredients = [ingredient.lower() for ingredient in dish.get("ingredients", [])]
                if all(any(req in ingredient for ingredient in text_ingredients) for req in required):
                    filtered.append(dish)
            dishes = filtered

    if search:
        search_lower = normalize_text(search)
        results = []
        for dish in dishes:
            name_match = search_lower in dish.get("name", "").lower()
            ingredients_match = any(search_lower in ingredient.lower() for ingredient in dish.get("ingredients", []))
            if name_match or ingredients_match:
                results.append(dish)
        dishes = results

    return {"dishes": dishes}


@app.get("/api/random")
def get_random_dish(
    ingredients: Annotated[Optional[str], Query(description="Comma-separated ingredient filter")] = None,
):
    dishes = get_dishes(ingredients=ingredients).get("dishes", [])
    if not dishes:
        raise HTTPException(status_code=404, detail="No matching dishes found")
    return {"dish": random.choice(dishes)}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "count": len(db)}
