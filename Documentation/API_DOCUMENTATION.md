# NCC ABYAS Quiz API Documentation

## Overview

The NCC ABYAS Quiz API provides AI-powered quiz generation, submission, history tracking, and analytics for National Cadet Corps (NCC) training.

## Base URL

```text
http://localhost:8000/api
```

## Endpoints

### 1. Get Quiz Topics

**GET** `/topics`

Returns available quiz topics.

**Response:**

```json
{
  "topics": [
    "NCC General",
    "National Integration", 
    "Drill",
    "Weapon Training",
    "Map Reading",
    "Field Craft Battle Craft",
    "Civil Defence",
    "First Aid",
    "Leadership",
    "Social Service"
  ]
}
```

### 2. Generate Quiz

**POST** `/generate`

Generates AI-powered quiz questions using Google Gemini.

**Request Body:**

```json
{
  "topic": "NCC General",
  "difficulty": "Easy",
  "numQuestions": 3
}
```

**Parameters:**

- `topic`: One of the available topics from `/topics`
- `difficulty`: "Easy", "Medium", or "Hard"
- `numQuestions`: 1-10 (clamped based on difficulty)

**Response:**

```json
{
  "questions": [
    {
      "id": "ncc_general_1",
      "question": "What does NCC stand for?",
      "options": {
        "A": "National Cadet Corps",
        "B": "National Civil Corps",
        "C": "National Cadet Committee",
        "D": "National Community Corps"
      },
      "answer": "A",
      "explanation": "NCC stands for National Cadet Corps...",
      "topic": "NCC General",
      "difficulty": "Easy",
      "created_at": "2025-07-04T14:38:07.901637"
    }
  ],
  "metadata": {
    "quiz_id": "NCC General_Easy_1751620087.901712",
    "topic": "NCC General",
    "difficulty": "Easy",
    "generated_at": "2025-07-04T14:38:07.901729",
    "total_questions": 3,
    "ai_generated": true
  }
}
```

### 3. Submit Quiz

**POST** `/submit`

Submits quiz answers and returns detailed results.

**Request Body:**

```json
{
  "quiz_id": "NCC General_Easy_1751620087.901712",
  "answers": ["A", "B", "A"],
  "topic": "NCC General",
  "difficulty": "Easy",
  "start_time": "2025-07-04T14:38:00Z",
  "end_time": "2025-07-04T14:40:00Z"
}
```

**Parameters:**

- `quiz_id`: ID returned from `/generate` endpoint
- `answers`: Array of selected answers (A, B, C, D)
- `topic`: Quiz topic
- `difficulty`: Quiz difficulty
- `start_time` (optional): ISO timestamp when quiz started
- `end_time` (optional): ISO timestamp when quiz ended

**Response:**

```json
{
  "score": 100.0,
  "correct_answers": 3,
  "wrong_answers": 0,
  "total_questions": 3,
  "duration_seconds": 120.0,
  "wrong_questions": [],
  "difficulty": "Easy",
  "topic": "NCC General",
  "submitted_at": "2025-07-04T14:38:17.369887"
}
```

### 4. Get Quiz History

**GET** `/history`

Returns user's quiz history.

**Query Parameters:**

- `user_id` (optional): Filter by user ID
- `limit` (optional): Number of entries to return (default: 10)

**Response:**

```json
{
  "history": [
    {
      "id": "quiz_1751620087",
      "topic": "NCC General",
      "difficulty": "Easy",
      "score": 100.0,
      "completed_at": "2025-07-04T14:38:17.369887",
      "duration_seconds": 120.0
    }
  ],
  "total_count": 1,
  "page_size": 10
}
```

### 5. Bookmark Question

**POST** `/bookmark`

Bookmarks a question for later review.

**Request Body:**

```json
{
  "question_id": "ncc_general_1",
  "question": "What does NCC stand for?",
  "answer": "A",
  "explanation": "NCC stands for National Cadet Corps...",
  "topic": "NCC General",
  "user_id": "user123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Question bookmarked successfully",
  "bookmark_id": "bookmark_ncc_general_1_user123"
}
```

### 6. Get Analytics

**GET** `/analytics`

Returns user's quiz performance analytics.

**Query Parameters:**

- `user_id` (optional): Filter by user ID

**Response:**

```json
{
  "total_quizzes": 15,
  "average_score": 78.5,
  "best_score": 95.0,
  "worst_score": 45.0,
  "favorite_topic": "NCC General",
  "strength_areas": ["Leadership", "Social Service"],
  "improvement_areas": ["Weapon Training", "Map Reading"],
  "recent_trend": "improving",
  "total_time_spent": 2400
}
```

## Features

### AI-Powered Question Generation

- Uses Google Gemini AI for intelligent question generation
- Adaptive difficulty levels with contextual questions
- Sophisticated prompt engineering for high-quality questions
- Automatic fallback to mock questions if AI service fails

### Question Validation

- Validates answers against stored quiz sessions
- Provides detailed explanations for wrong answers
- Tracks question-level performance

### Analytics & Insights

- Performance tracking across topics and difficulties
- Trend analysis (improving, declining, stable)
- Strength and weakness identification
- Time spent tracking

### Data Persistence

- File-based storage for quiz history and bookmarks
- Session management for quiz validation
- Automatic data loading on startup

## Error Handling

- Comprehensive error messages for invalid requests
- Graceful fallback for AI service failures
- Input validation with detailed error responses

## Configuration

Create a `.env` file with:

```env
GEMINI_API_KEY=your_api_key_here
```

## Installation

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Testing

Use the provided test script:

```bash
./test_quiz_api.sh
```

## Architecture

- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation and serialization
- **Google Gemini**: AI-powered question generation
- **File-based storage**: JSON files for persistence (easily upgradeable to database)

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- Advanced analytics dashboard
- Question difficulty adaptation based on performance
- Collaborative features (study groups, peer reviews)
- Mobile app integration
- Offline mode support
