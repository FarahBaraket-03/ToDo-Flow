# Todo App - Backend API

RESTful API for the Todo App built with Express.js, PostgreSQL, and AWS integration.

## Features

- 🔐 JWT Authentication
- 📝 Task Management (CRUD)
- 📁 Project Organization
- 🗄️ PostgreSQL Database
- ☁️ AWS Integration (S3 for file storage)
- 🛡️ Security with Helmet & CORS
- ✅ Input Validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Cloud**: AWS (S3, RDS)
- **Validation**: express-validator

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- AWS Account (for S3 storage)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Database Schema

See `database/schema.sql` for full schema definition.

## Security

- Passwords hashed with bcrypt
- JWT for stateless authentication
- CORS protection
- Helmet security headers
- Input validation and sanitization
