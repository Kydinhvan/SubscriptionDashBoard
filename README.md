# GIC InfraOps Dashboard

A full-stack infrastructure operations dashboard and portfolio project for GIC internship applications.

## Tech Stack
- **Frontend:** React (TypeScript, Vite)
- **Backend:** .NET 8 Web API (C#)
- **Database:** PostgreSQL
- **DevOps:** Docker Compose, GitHub Actions (planned), AWS-ready

## Features
- Infrastructure automation simulation (AWS EC2/S3)
- ETL data pipeline (public API to DB, dashboard visualization)
- Personal portfolio section

## Getting Started

### Prerequisites
- Docker & Docker Compose
- .NET 8+ SDK (for backend local dev)
- Node.js & npm (for frontend local dev)

### Local Development
To run all services together:
```sh
docker-compose up --build
```

Or run individually:
- Backend: `cd infraops-backend && dotnet run`
- Frontend: `cd infraops-frontend && npm run dev`

