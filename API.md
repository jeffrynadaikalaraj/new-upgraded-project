# AI LifeOS API Documentation

All routes expect a valid JWT `Bearer` token in the `Authorization` header, except `/api/auth/login` and `/api/auth/register`.

## Authentication (`/api/auth`)
- `POST /register`: Register a new user (requires `name`, `email`, `password`)
- `POST /login`: Login and receive JWT token
- `GET /me`: Get current user profile data
- `POST /google`: Authenticate via Google OAuth

## AI Chat (`/api/chat`)
- `GET /history`: Get chat session history (titles and IDs)
- `GET /:id`: Get specific chat session messages
- `POST /`: Send message and receive SSE stream (requires `message` and `chatId`)
- `DELETE /:id`: Delete a chat session

## Goals (`/api/goals`)
- `GET /`: List all user goals
- `POST /`: Create a new goal
- `PUT /:id`: Update a goal (progress, title, etc)
- `DELETE /:id`: Delete a goal

## Habits (`/api/habits`)
- `GET /`: List all habits
- `POST /`: Create a habit
- `PUT /:id`: Update habit details
- `DELETE /:id`: Delete habit
- `POST /:id/complete`: Complete a habit for today
- `POST /:id/uncomplete`: Remove completion for today
- `GET /:id/stats`: Get habit performance statistics

## Planner (`/api/planner`)
- `GET /`: Get daily plan by date
- `POST /`: Create or update a daily plan
- `PUT /:id`: Modify an existing plan

## Documents (`/api/documents`)
- `GET /`: List uploaded documents
- `POST /upload`: Upload a new document (multipart/form-data with `file`)
- `GET /:id`: Get document metadata, extracted text, and AI summary
- `POST /:id/ask`: Query a document using RAG (requires `question`)
- `DELETE /:id`: Delete document and its embeddings

## Analytics & Reports
- `GET /api/analytics`: Fetch aggregated user stats (weekly, monthly, scores)
- `GET /api/reports/latest`: Get the most recent weekly report
- `GET /api/reports`: List past weekly reports
- `POST /api/reports/generate`: Trigger weekly report generation
