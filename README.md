# Dinner of Choose

A React frontend and Python backend web application for choosing dishes by search, ingredients, and random selection.

## Features

- Search dishes by name or ingredient
- Add required ingredients to filter results
- Display dish details with expandable ingredient and cooking steps sections
- Pick a random dish from the repository database
- Loads dishes from JSON document files on container startup
- Runs in Docker containers launched by `docker-compose`

## Requirements

- Node.js 22.x
- Python 3.13.x
- Docker and Docker Compose

## Run locally with Docker

```bash
docker compose up --build
```

Then open `http://localhost:4173`

## Project structure

- `frontend/` — React application
- `backend/` — Python FastAPI backend
- `dishes/` — Initial dish JSON documents loaded into the backend database on startup

## Backend behavior

On every `docker compose up`, the backend starts with an empty TinyDB database and imports all dish JSON files from `./dishes`.
