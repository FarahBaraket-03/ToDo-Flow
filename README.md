# 📝 TodoApp - Modern Task Management Application

A full-stack todo application inspired by Todoist, built with React, Node.js, PostgreSQL, and AWS integration. Organize your tasks, manage projects, and boost your productivity.

![TodoApp Preview](https://img.shields.io/badge/Status-Ready-success)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## ✨ Features

### 🎯 Core Features
- **Task Management** - Create, edit, delete, and organize tasks
- **Project Organization** - Group tasks into custom projects
- **Priority Levels** - Set task priorities (low, medium, high, urgent)
- **Due Dates** - Schedule tasks with calendar integration
- **Task Completion** - Mark tasks as complete with visual feedback
- **Search & Filter** - Quickly find tasks by status, project, or date

### 👤 User Features
- **Authentication** - Secure JWT-based authentication
- **User Profiles** - Personalized user accounts
- **Dashboard** - Visual overview of your tasks and statistics

### 🎨 UI/UX
- **Modern Design** - Clean, intuitive Todoist-inspired interface
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark Mode Ready** - Comfortable viewing experience
- **Smooth Animations** - Polished interactions with Framer Motion

### ☁️ AWS Integration
- **S3 Storage** - File attachments support
- **RDS Database** - Production-ready PostgreSQL hosting
- **Scalable Architecture** - Built for cloud deployment

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Express API    │────▶│   PostgreSQL    │
│   (Port 5173)   │     │   (Port 5000)   │     │   (Port 5432)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                         │
        │                       │                         │
        └───────────────────────┴─────────────────────────┘
                          AWS Cloud Services
                     (S3, RDS, EC2/ECS, CloudFront)
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git**
- **Docker** (optional, for containerized setup)

### Option 1: Manual Setup

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "projet aws"
```

#### 2. Setup Database
```bash
# Start PostgreSQL service
# Create database
createdb todo_db

# Run schema
psql -d todo_db -f database/schema.sql
```

#### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start backend server
npm run dev
```

#### 4. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 5. Access the application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

### Option 2: Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services Available:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- pgAdmin: http://localhost:5050 

## 📁 Project Structure

```
todo-app-aws/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── config/            # Database & app configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth & error handling
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Validation & helpers
│   │   └── server.js          # Entry point
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── Dockerfile
│
├── database/
│   └── schema.sql             # Database schema
│
├── docker-compose.yml         # Docker orchestration
└── README.md                  # This file
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=7d

# AWS (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create `frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/toggle` | Toggle completion |
| GET | `/api/tasks/stats` | Get task statistics |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/stats` | Get project stats |

## 🎨 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **date-fns** - Date utilities
- **React Hot Toast** - Notifications

### Backend
- **Node.js 18** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **AWS SDK** - Cloud integration

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL 15** - Database
- **pgAdmin** - Database management

## 🔐 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Configured origins
- **Helmet** - Security headers
- **Input Validation** - express-validator
- **SQL Injection Prevention** - Sequelize ORM
- **XSS Protection** - Content sanitization

## 🚀 Deployment

### AWS Deployment Steps

1. **Setup RDS PostgreSQL**
   - Create RDS PostgreSQL instance
   - Configure security groups
   - Update connection string

2. **Setup S3 Bucket**
   - Create S3 bucket for file storage
   - Configure CORS policy
   - Set up IAM credentials

3. **Deploy Backend**
   - Use AWS EC2, ECS, or Elastic Beanstalk
   - Set environment variables
   - Configure load balancer

4. **Deploy Frontend**
   - Build: `npm run build`
   - Deploy to S3 + CloudFront
   - Or use Vercel/Netlify

5. **Configure Domain**
   - Set up Route 53
   - Configure SSL certificates
   - Update CORS settings

## 📊 Database Schema

```sql
User
├── id (UUID)
├── name
├── email (unique)
├── password (hashed)
├── avatar
└── timestamps

Project
├── id (UUID)
├── name
├── description
├── color
├── icon
├── user_id (FK)
└── timestamps

Task
├── id (UUID)
├── title
├── description
├── priority
├── status
├── due_date
├── user_id (FK)
├── project_id (FK)
└── timestamps
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📝 Development

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ by [Your Name]

## 🙏 Acknowledgments

- Design inspired by [Todoist](https://todoist.com)
- Icons from [Lucide](https://lucide.dev)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Happy Task Managing! 🎉**
