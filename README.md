# 🗳️ Online Election System

A comprehensive online election system built with Node.js, Express, TypeScript, Prisma, and Supabase, following the Layered Architecture pattern.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)

## ✨ Features

### Admin Features

- Create electoral constituencies
- Promote voters to Election Commissioner (EC) role

### EC (Election Commissioner) Features

- Create political parties
- Register candidates with party affiliation
- Close voting polls for constituencies

### Voter Features

- View ballot (candidates in their constituency)
- Cast votes for candidates
- Change votes before poll closes (using upsert)

### Public Features

- View constituency results (with privacy controls)
- View party overview with elected MPs count

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma (v7+)
- **Database:** PostgreSQL (Supabase)
- **Architecture:** Layered Architecture (Controller → Service → Repository)

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│       Controllers Layer             │
│  Handle HTTP requests/responses     │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        Services Layer               │
│  Business logic & validations       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Repositories Layer             │
│  Direct database interactions       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│    Database (Supabase/PostgreSQL)   │
└─────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (Supabase recommended)

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd final-project-713
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=3001
NODE_ENV=development
```

**Note**: The backend API runs on port 3001 to avoid conflicts with the frontend development server (which runs on port 3000).

4. Generate Prisma Client

```bash
npx prisma generate
```

5. Run database migrations

```bash
npx prisma migrate dev --name init
```

6. Start the development server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

**API Documentation**: Visit `http://localhost:3001/api-docs` for Swagger documentation

## 📚 API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Quick Reference

| Endpoint                         | Method | Description         |
| -------------------------------- | ------ | ------------------- |
| `/api/admin/constituency`        | POST   | Create constituency |
| `/api/admin/promote-ec/:userId`  | PATCH  | Promote user to EC  |
| `/api/auth/register`             | POST   | Register new user   |
| `/api/election/party`            | POST   | Create party        |
| `/api/election/candidate`        | POST   | Add candidate       |
| `/api/election/close/:id`        | PATCH  | Close poll          |
| `/api/votes/ballot/:userId`      | GET    | Get ballot          |
| `/api/votes`                     | POST   | Cast vote           |
| `/api/election/constituency/:id` | GET    | View results        |
| `/api/election/party-overview`   | GET    | View parties        |

## 📁 Project Structure

```
src/
├── controllers/         # HTTP request handlers
│   ├── admin.controller.ts
│   ├── auth.controller.ts
│   ├── election.controller.ts
│   └── vote.controller.ts
├── services/           # Business logic layer
│   ├── admin.service.ts
│   ├── auth.service.ts
│   ├── election.service.ts
│   └── vote.service.ts
├── repositories/       # Database access layer
│   ├── user.repository.ts
│   ├── election.repository.ts
│   └── vote.repository.ts
├── routes/            # API route definitions
│   ├── admin.routes.ts
│   ├── auth.routes.ts
│   ├── election.routes.ts
│   └── vote.routes.ts
├── lib/
│   └── prisma.ts     # Prisma client instance
└── server.ts          # Express app setup

prisma/
└── schema.prisma      # Database schema

docs/
├── API_DOCUMENTATION.md
├── TESTING_GUIDE.md
└── IMPLEMENTATION_SUMMARY.md
```

## 🧪 Testing

Detailed testing instructions are available in [TESTING_GUIDE.md](TESTING_GUIDE.md)

### Quick Test Flow

1. **Admin** creates constituencies
2. **Users** register as voters
3. **Admin** promotes user to EC
4. **EC** creates parties and adds candidates
5. **Voters** view ballots and cast votes
6. **EC** closes polls
7. **Public** views results

### Test with cURL

```bash
# Health check
curl http://localhost:3001

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nationalId": "1234567890001",
    "name": "John",
    "surname": "Doe",
    "address": "123 Main St",
    "province": "Bangkok",
    "districtNumber": 1
  }'
```

## 🔑 Key Features & Validations

### Vote Casting

- ✅ Validates constituency is open
- ✅ Validates candidate belongs to user's constituency
- ✅ Allows vote changes via upsert (before poll closes)
- ✅ Prevents voting after poll closes

### Results Display

- **Open Poll**: Shows candidates, hides vote counts
- **Closed Poll**: Shows candidates with actual vote counts

### Party Overview

- Counts elected MPs only from closed constituencies
- Winner in each constituency = candidate with most votes
- Each constituency contributes max 1 MP per party

## 📝 Database Schema

### Core Models

- **Constituency**: Electoral districts (province + districtNumber)
- **Party**: Political parties with policies
- **User**: Voters/EC/Admin with role-based access
- **Candidate**: Candidates linked to party and constituency
- **Vote**: One vote per user (unique constraint)

### Relationships

- User → Constituency (many-to-one)
- User → Vote (one-to-one)
- Candidate → Party (many-to-one)
- Candidate → Constituency (many-to-one)
- Vote → User (many-to-one)
- Vote → Candidate (many-to-one)

## 🔒 Security Considerations

**Note:** This implementation focuses on business logic. For production, consider adding:

- Authentication (JWT tokens)
- Authorization middleware (role-based access control)
- Input validation (express-validator)
- Rate limiting
- HTTPS/TLS
- SQL injection protection (already handled by Prisma)
- XSS protection
- CORS configuration

## 🤝 Contributing

This is a university project. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js community
- Prisma team
- Supabase team
- TypeScript community

---

For detailed information, see:

- [API Documentation](API_DOCUMENTATION.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
