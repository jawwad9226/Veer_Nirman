from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import random
from app_models import (
    ProgressSummary, TopicPerformance, LearningRecommendation,
    ProgressAnalyticsResponse, ProgressFilterRequest, Achievement,
    QuizResultRecord, VideoProgressRecord, StudySessionRecord
)

router = APIRouter()

# Mock data storage (replace with actual database in production)
class ProgressDataStore:
    def __init__(self):
        self.quiz_results = self._generate_mock_quiz_data()
        self.video_progress = self._generate_mock_video_data()
        self.study_sessions = self._generate_mock_study_sessions()
        self.achievements = self._generate_mock_achievements()
    
    def _generate_mock_quiz_data(self) -> List[Dict]:
        """Generate mock quiz results for demonstration"""
        topics = ["NCC General", "Leadership", "Drill", "Weapon Training", "Map Reading", "First Aid"]
        difficulties = ["Easy", "Medium", "Hard"]
        results = []
        
        for i in range(30):  # 30 mock quiz results
            base_date = datetime.now() - timedelta(days=30)
            result = {
                "id": f"quiz_{i+1}",
                "topic": random.choice(topics),
                "difficulty": random.choice(difficulties),
                "score": round(random.uniform(60, 95), 1),
                "total_questions": random.choice([3, 5, 8]),
                "correct_answers": 0,  # Will be calculated
                "time_spent": random.randint(300, 900),  # 5-15 minutes
                "completed_at": base_date + timedelta(days=i, hours=random.randint(8, 20)),
                "custom_topic": None
            }
            result["correct_answers"] = round(result["total_questions"] * result["score"] / 100)
            results.append(result)
        
        return results
    
    def _generate_mock_video_data(self) -> List[Dict]:
        """Generate mock video progress data"""
        videos = [
            {"id": "video_1", "title": "NCC History and Formation", "category": "General", "duration": 1200},
            {"id": "video_2", "title": "Leadership Principles", "category": "Leadership", "duration": 900},
            {"id": "video_3", "title": "Basic Drill Movements", "category": "Drill", "duration": 1500},
            {"id": "video_4", "title": "Weapon Safety", "category": "Weapons", "duration": 800},
            {"id": "video_5", "title": "Map Reading Basics", "category": "Navigation", "duration": 1100},
        ]
        
        progress = []
        for i, video in enumerate(videos):
            watch_time = random.randint(int(video["duration"] * 0.3), video["duration"])
            progress.append({
                "video_id": video["id"],
                "video_title": video["title"],
                "category": video["category"],
                "watch_time": watch_time,
                "total_duration": video["duration"],
                "completed": watch_time >= video["duration"] * 0.9,
                "last_watched": datetime.now() - timedelta(days=random.randint(1, 15))
            })
        
        return progress
    
    def _generate_mock_study_sessions(self) -> List[Dict]:
        """Generate mock study session data"""
        sessions = []
        for i in range(20):
            activity_type = random.choice(["quiz", "video", "syllabus"])
            duration = random.randint(600, 3600)  # 10-60 minutes
            start_time = datetime.now() - timedelta(days=random.randint(1, 30), hours=random.randint(8, 20))
            
            sessions.append({
                "session_id": f"session_{i+1}",
                "activity_type": activity_type,
                "duration": duration,
                "started_at": start_time,
                "ended_at": start_time + timedelta(seconds=duration)
            })
        
        return sessions
    
    def _generate_mock_achievements(self) -> List[Dict]:
        """Generate mock achievements/badges"""
        return [
            {
                "id": "first_quiz",
                "title": "First Steps",
                "description": "Complete your first quiz",
                "icon": "🎯",
                "earned_at": datetime.now() - timedelta(days=25),
                "progress": 1.0,
                "target": 1,
                "current": 1
            },
            {
                "id": "quiz_master",
                "title": "Quiz Master",
                "description": "Complete 50 quizzes",
                "icon": "🏆",
                "earned_at": None,
                "progress": 0.6,
                "target": 50,
                "current": 30
            },
            {
                "id": "video_watcher",
                "title": "Knowledge Seeker",
                "description": "Watch 10 videos completely",
                "icon": "📺",
                "earned_at": datetime.now() - timedelta(days=10),
                "progress": 1.0,
                "target": 10,
                "current": 12
            },
            {
                "id": "streak_week",
                "title": "Weekly Warrior",
                "description": "Study for 7 consecutive days",
                "icon": "🔥",
                "earned_at": None,
                "progress": 0.4,
                "target": 7,
                "current": 3
            }
        ]

# Initialize data store
data_store = ProgressDataStore()

@router.get("/summary", response_model=ProgressSummary)
async def get_progress_summary():
    """Get overall progress summary statistics"""
    quiz_scores = [q["score"] for q in data_store.quiz_results]
    video_completed = sum(1 for v in data_store.video_progress if v["completed"])
    total_study_time = sum(s["duration"] for s in data_store.study_sessions)
    
    return ProgressSummary(
        total_quizzes=len(data_store.quiz_results),
        average_score=round(sum(quiz_scores) / len(quiz_scores), 1) if quiz_scores else 0,
        best_score=max(quiz_scores) if quiz_scores else 0,
        worst_score=min(quiz_scores) if quiz_scores else 0,
        total_study_time=total_study_time,
        completed_videos=video_completed,
        total_videos=len(data_store.video_progress),
        bookmarked_sections=8,  # Mock data
        current_streak=5,  # Mock data
        longest_streak=12,  # Mock data
        last_activity=max(q["completed_at"] for q in data_store.quiz_results) if data_store.quiz_results else None
    )

@router.get("/topic-performance", response_model=List[TopicPerformance])
async def get_topic_performance():
    """Get performance statistics for each topic"""
    topic_stats = {}
    
    for quiz in data_store.quiz_results:
        topic = quiz["topic"]
        if topic not in topic_stats:
            topic_stats[topic] = {
                "scores": [],
                "time_spent": 0,
                "attempts": 0
            }
        
        topic_stats[topic]["scores"].append(quiz["score"])
        topic_stats[topic]["time_spent"] += quiz["time_spent"]
        topic_stats[topic]["attempts"] += 1
    
    performance_list = []
    for topic, stats in topic_stats.items():
        avg_score = sum(stats["scores"]) / len(stats["scores"])
        # Calculate improvement trend (simplified)
        recent_scores = stats["scores"][-3:] if len(stats["scores"]) >= 3 else stats["scores"]
        early_scores = stats["scores"][:3] if len(stats["scores"]) >= 3 else stats["scores"]
        trend = (sum(recent_scores) / len(recent_scores) - sum(early_scores) / len(early_scores)) if len(stats["scores"]) > 1 else 0
        
        # Determine mastery level based on average score
        if avg_score >= 90:
            mastery = "expert"
        elif avg_score >= 80:
            mastery = "advanced"
        elif avg_score >= 70:
            mastery = "intermediate"
        else:
            mastery = "beginner"
        
        performance_list.append(TopicPerformance(
            topic=topic,
            attempts=stats["attempts"],
            average_score=round(avg_score, 1),
            best_score=max(stats["scores"]),
            improvement_trend=round(trend, 1),
            time_spent=stats["time_spent"],
            mastery_level=mastery
        ))
    
    return performance_list

@router.get("/recent-activity")
async def get_recent_activity(limit: int = Query(10, ge=1, le=50)):
    """Get recent learning activities"""
    activities = []
    
    # Add quiz activities
    for quiz in sorted(data_store.quiz_results, key=lambda x: x["completed_at"], reverse=True)[:limit//2]:
        activities.append({
            "type": "quiz",
            "title": f"Quiz: {quiz['topic']}",
            "description": f"Scored {quiz['score']}% on {quiz['difficulty']} difficulty",
            "timestamp": quiz["completed_at"],
            "score": quiz["score"],
            "icon": "🎯"
        })
    
    # Add video activities
    for video in sorted(data_store.video_progress, key=lambda x: x["last_watched"], reverse=True)[:limit//2]:
        completion = round((video["watch_time"] / video["total_duration"]) * 100)
        activities.append({
            "type": "video",
            "title": f"Video: {video['video_title']}",
            "description": f"Watched {completion}% ({video['watch_time']//60} minutes)",
            "timestamp": video["last_watched"],
            "completion": completion,
            "icon": "📺"
        })
    
    # Sort by timestamp and limit
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]

@router.get("/recommendations", response_model=List[LearningRecommendation])
async def get_learning_recommendations():
    """Get AI-powered learning recommendations"""
    topic_performance = await get_topic_performance()
    
    recommendations = []
    
    # Find weak topics
    weak_topics = [tp for tp in topic_performance if tp.average_score < 75]
    for topic in weak_topics[:2]:
        recommendations.append(LearningRecommendation(
            type="weak_topic",
            title=f"Improve {topic.topic}",
            description=f"Your average score in {topic.topic} is {topic.average_score}%. Practice more to improve!",
            priority="high",
            estimated_time=30,
            action_url=f"/quiz?topic={topic.topic}"
        ))
    
    # Find improving topics to continue
    improving_topics = [tp for tp in topic_performance if tp.improvement_trend > 5]
    for topic in improving_topics[:1]:
        recommendations.append(LearningRecommendation(
            type="next_level",
            title=f"Advance in {topic.topic}",
            description=f"You're improving in {topic.topic}! Try harder difficulty levels.",
            priority="medium",
            estimated_time=25,
            action_url=f"/quiz?topic={topic.topic}&difficulty=Hard"
        ))
    
    # General recommendations
    recommendations.extend([
        LearningRecommendation(
            type="practice_more",
            title="Daily Practice",
            description="Try to complete at least one quiz daily to maintain your streak.",
            priority="medium",
            estimated_time=15,
            action_url="/quiz"
        ),
        LearningRecommendation(
            type="review",
            title="Watch Educational Videos",
            description="Complement your quiz practice with video lessons for better understanding.",
            priority="low",
            estimated_time=20,
            action_url="/videos"
        )
    ])
    
    return recommendations[:4]

@router.get("/charts-data")
async def get_charts_data():
    """Get data for various progress charts"""
    
    # Score trend over time
    score_trend = []
    sorted_quizzes = sorted(data_store.quiz_results, key=lambda x: x["completed_at"])
    for quiz in sorted_quizzes:
        score_trend.append({
            "date": quiz["completed_at"].strftime("%Y-%m-%d"),
            "score": quiz["score"],
            "topic": quiz["topic"]
        })
    
    # Topic distribution (pie chart)
    topic_counts = {}
    for quiz in data_store.quiz_results:
        topic_counts[quiz["topic"]] = topic_counts.get(quiz["topic"], 0) + 1
    
    topic_distribution = [{"topic": k, "count": v} for k, v in topic_counts.items()]
    
    # Difficulty distribution
    difficulty_counts = {}
    for quiz in data_store.quiz_results:
        difficulty_counts[quiz["difficulty"]] = difficulty_counts.get(quiz["difficulty"], 0) + 1
    
    difficulty_distribution = [{"difficulty": k, "count": v} for k, v in difficulty_counts.items()]
    
    # Study time by activity
    activity_time = {}
    for session in data_store.study_sessions:
        activity_type = session["activity_type"]
        activity_time[activity_type] = activity_time.get(activity_type, 0) + session["duration"]
    
    study_time_data = [{"activity": k, "time": v//60} for k, v in activity_time.items()]  # Convert to minutes
    
    # Weekly activity heatmap
    weekly_activity = {}
    for session in data_store.study_sessions:
        date_key = session["started_at"].strftime("%Y-%m-%d")
        weekly_activity[date_key] = weekly_activity.get(date_key, 0) + session["duration"]//60
    
    return {
        "score_trend": score_trend,
        "topic_distribution": topic_distribution,
        "difficulty_distribution": difficulty_distribution,
        "study_time_data": study_time_data,
        "weekly_activity": weekly_activity
    }

@router.get("/achievements", response_model=List[Achievement])
async def get_achievements():
    """Get user achievements and badges"""
    achievements = []
    for ach in data_store.achievements:
        achievements.append(Achievement(**ach))
    return achievements

@router.get("/analytics", response_model=ProgressAnalyticsResponse)
async def get_complete_analytics():
    """Get complete progress analytics (all data in one request)"""
    summary = await get_progress_summary()
    topic_performance = await get_topic_performance()
    recent_activity = await get_recent_activity(limit=10)
    recommendations = await get_learning_recommendations()
    charts_data = await get_charts_data()
    
    return ProgressAnalyticsResponse(
        summary=summary,
        topic_performance=topic_performance,
        recent_activity=recent_activity,
        recommendations=recommendations,
        charts_data=charts_data
    )

@router.post("/quiz-result")
async def record_quiz_result(result: QuizResultRecord):
    """Record a new quiz result for progress tracking"""
    result_dict = result.dict()
    result_dict["completed_at"] = result.completed_at
    data_store.quiz_results.append(result_dict)
    
    return {"message": "Quiz result recorded successfully", "id": result.id}

@router.post("/video-progress")
async def record_video_progress(progress: VideoProgressRecord):
    """Record video watching progress"""
    progress_dict = progress.dict()
    progress_dict["last_watched"] = progress.last_watched
    
    # Update existing or add new
    for i, vp in enumerate(data_store.video_progress):
        if vp["video_id"] == progress.video_id:
            data_store.video_progress[i] = progress_dict
            return {"message": "Video progress updated successfully"}
    
    data_store.video_progress.append(progress_dict)
    return {"message": "Video progress recorded successfully"}

@router.post("/study-session")
async def record_study_session(session: StudySessionRecord):
    """Record a study session"""
    session_dict = session.dict()
    session_dict["started_at"] = session.started_at
    session_dict["ended_at"] = session.ended_at
    data_store.study_sessions.append(session_dict)
    
    return {"message": "Study session recorded successfully", "session_id": session.session_id}
