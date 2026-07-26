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
- Docker and Docker Compose (Running on other platforms should be added later)


## Installation on linux

```bash
# Prerequsite: Installed docker, for help see https://docs.docker.com/engine/install/ubuntu/

sudo apt update
sudo apt upgrade

sudo apt install python3

sudo apt install ca-certificates curl gnupg
# If the folder does not already exist, run: sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=22 # Switch to 24 if the latest TLS version is desired
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt update
sudo apt install nodejs
node --version
npm --version
sudo apt install build-essential
sudo apt update

# Prerequisite: able to clone by using ssh: for help see https://phoenixnap.com/kb/git-clone-ssh
git clone git@github.com:arneHildrum/dinnerofchoose.git
cd dinnerofchoose
docker compose up --build
```

Then open `http://localhost:4173`

## Project structure

- `frontend/` — React application
- `backend/` — Python FastAPI backend
- `dishes/` — Initial dish JSON documents loaded into the backend database on startup

## Backend behavior

On every `docker compose up`, the backend starts with an empty TinyDB database and imports all dish JSON files from `./dishes`.
