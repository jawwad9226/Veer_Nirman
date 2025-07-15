from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
import os

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase app (singleton)
if not firebase_admin._apps:
    cred_path = os.getenv('FIREBASE_CREDENTIALS_JSON', 'firebase-adminsdk.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
db = firestore.client()

router = APIRouter()

class QuizAnalyticsIn(BaseModel):
    user_id: str
    quiz_id: str
    topic: str
    difficulty: str
    score: float
    total_questions: int
    correct_answers: int
    wrong_answers: int
    timestamp: str

@router.post('/analytics/quiz')
async def save_quiz_analytics(data: QuizAnalyticsIn, request: Request):
    try:
        # Optionally, get user from auth here
        doc_ref = db.collection('quiz_analytics').document()
        doc_ref.set(data.dict())
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save analytics: {e}")

@router.get('/analytics/quiz')
async def get_user_analytics(user_id: str):
    try:
        docs = db.collection('quiz_analytics').where('user_id', '==', user_id).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {e}")

@router.get('/analytics/quiz/overview')
async def get_all_analytics():
    try:
        docs = db.collection('quiz_analytics').stream()
        analytics = [doc.to_dict() for doc in docs]
        if not analytics:
            return {
                "total_quizzes": 0,
                "average_score": 0,
                "best_score": 0,
                "worst_score": 0,
                "favorite_topic": None,
                "strength_areas": [],
                "improvement_areas": [],
                "recent_trend": "No data",
                "total_time_spent": 0
            }

        total_quizzes = len(analytics)
        scores = [a.get('score', 0) for a in analytics]
        average_score = round(sum(scores) / total_quizzes, 2) if total_quizzes else 0
        best_score = max(scores) if scores else 0
        worst_score = min(scores) if scores else 0

        # Favorite topic
        from collections import Counter
        topics = [a.get('topic') for a in analytics if a.get('topic')]
        topic_counts = Counter(topics)
        favorite_topic = topic_counts.most_common(1)[0][0] if topic_counts else None

        # Strength/improvement areas (top 2 topics by avg score)
        topic_scores = {}
        for a in analytics:
            t = a.get('topic')
            if t:
                topic_scores.setdefault(t, []).append(a.get('score', 0))
        topic_avg = {t: sum(v)/len(v) for t, v in topic_scores.items()}
        sorted_topics = sorted(topic_avg.items(), key=lambda x: x[1], reverse=True)
        strength_areas = [t for t, _ in sorted_topics[:2]]
        improvement_areas = [t for t, _ in sorted_topics[-2:]]

        # Recent trend (last 5 quizzes)
        analytics_sorted = sorted(analytics, key=lambda a: a.get('timestamp', ''), reverse=True)
        recent_scores = [a.get('score', 0) for a in analytics_sorted[:5]]
        if len(recent_scores) >= 2:
            trend = recent_scores[0] - recent_scores[-1]
            if trend > 0:
                recent_trend = f"Improving (+{trend})"
            elif trend < 0:
                recent_trend = f"Declining ({trend})"
            else:
                recent_trend = "Stable"
        else:
            recent_trend = "No trend"

        # Total time spent (if available)
        total_time_spent = sum(a.get('duration_seconds', 0) for a in analytics)

        return {
            "total_quizzes": total_quizzes,
            "average_score": average_score,
            "best_score": best_score,
            "worst_score": worst_score,
            "favorite_topic": favorite_topic,
            "strength_areas": strength_areas,
            "improvement_areas": improvement_areas,
            "recent_trend": recent_trend,
            "total_time_spent": total_time_spent
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {e}")
