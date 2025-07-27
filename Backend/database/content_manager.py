"""
Content Manager for Sahayak Educational Platform
Handles CRUD operations for all content types with database integration
"""

from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from database.models import (
    User, ELI5Explanation, Story, VisualAid, EducationalGame,
    LessonPlan, FluencyAssessment, FluencyResult
)
from database.config import get_database_session_context
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class ContentManager:
    """Manages all content operations with database persistence"""
    
    def __init__(self):
        self.content_models = {
            'eli5': ELI5Explanation,
            'story': Story,
            'visual_aid': VisualAid,
            'game': EducationalGame,
            'lesson_plan': LessonPlan,
            'fluency_assessment': FluencyAssessment
        }
    
    # ELI5 Explanations
    def save_eli5_explanation(self, user_id: str, explanation_data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict]]:
        """Save ELI5 explanation to database"""
        try:
            with get_database_session_context() as session:
                explanation_data['user_id'] = user_id
                explanation_data['word_count'] = len(explanation_data.get('explanation', '').split())
                explanation_data['reading_time_minutes'] = max(1, explanation_data['word_count'] // 200)
                
                explanation = ELI5Explanation(**explanation_data)
                session.add(explanation)
                session.flush()
                
                logger.info(f"ELI5 explanation saved: {explanation.id}")
                return True, "ELI5 explanation saved successfully", explanation.to_dict()
                
        except Exception as e:
            logger.error(f"Failed to save ELI5 explanation: {e}")
            return False, f"Failed to save explanation: {str(e)}", None
    
    def get_eli5_explanations(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict]:
        """Get user's ELI5 explanations"""
        try:
            with get_database_session_context() as session:
                explanations = session.query(ELI5Explanation).filter(
                    ELI5Explanation.user_id == user_id
                ).order_by(desc(ELI5Explanation.created_at)).offset(offset).limit(limit).all()
                
                return [exp.to_dict() for exp in explanations]
                
        except Exception as e:
            logger.error(f"Failed to get ELI5 explanations: {e}")
            return []
    
    # Stories
    def save_story(self, user_id: str, story_data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict]]:
        """Save story to database"""
        try:
            with get_database_session_context() as session:
                story_data['user_id'] = user_id
                story_data['word_count'] = len(story_data.get('story_content', '').split())
                story_data['estimated_reading_time'] = max(1, story_data['word_count'] // 150)
                
                story = Story(**story_data)
                session.add(story)
                session.flush()
                
                logger.info(f"Story saved: {story.id}")
                return True, "Story saved successfully", story.to_dict()
                
        except Exception as e:
            logger.error(f"Failed to save story: {e}")
            return False, f"Failed to save story: {str(e)}", None
    
    def get_stories(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict]:
        """Get user's stories"""
        try:
            with get_database_session_context() as session:
                stories = session.query(Story).filter(
                    Story.user_id == user_id
                ).order_by(desc(Story.created_at)).offset(offset).limit(limit).all()
                
                return [story.to_dict() for story in stories]
                
        except Exception as e:
            logger.error(f"Failed to get stories: {e}")
            return []
    
    # Visual Aids
    def save_visual_aid(self, user_id: str, visual_aid_data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict]]:
        """Save visual aid to database"""
        try:
            with get_database_session_context() as session:
                visual_aid_data['user_id'] = user_id
                
                visual_aid = VisualAid(**visual_aid_data)
                session.add(visual_aid)
                session.flush()
                
                logger.info(f"Visual aid saved: {visual_aid.id}")
                return True, "Visual aid saved successfully", visual_aid.to_dict()
                
        except Exception as e:
            logger.error(f"Failed to save visual aid: {e}")
            return False, f"Failed to save visual aid: {str(e)}", None
    
    def get_visual_aids(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict]:
        """Get user's visual aids"""
        try:
            with get_database_session_context() as session:
                visual_aids = session.query(VisualAid).filter(
                    VisualAid.user_id == user_id
                ).order_by(desc(VisualAid.created_at)).offset(offset).limit(limit).all()
                
                return [aid.to_dict() for aid in visual_aids]
                
        except Exception as e:
            logger.error(f"Failed to get visual aids: {e}")
            return []
    
    # Educational Games
    def save_educational_game(self, user_id: str, game_data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict]]:
        """Save educational game to database"""
        try:
            with get_database_session_context() as session:
                game_data['user_id'] = user_id
                
                game = EducationalGame(**game_data)
                session.add(game)
                session.flush()
                
                logger.info(f"Educational game saved: {game.id}")
                return True, "Educational game saved successfully", game.to_dict()
                
        except Exception as e:
            logger.error(f"Failed to save educational game: {e}")
            return False, f"Failed to save game: {str(e)}", None
    
    def get_educational_games(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict]:
        """Get user's educational games"""
        try:
            with get_database_session_context() as session:
                games = session.query(EducationalGame).filter(
                    EducationalGame.user_id == user_id
                ).order_by(desc(EducationalGame.created_at)).offset(offset).limit(limit).all()
                
                return [game.to_dict() for game in games]
                
        except Exception as e:
            logger.error(f"Failed to get educational games: {e}")
            return []
    
    # Lesson Plans
    def save_lesson_plan(self, user_id: str, lesson_plan_data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict]]:
        """Save lesson plan to database"""
        try:
            with get_database_session_context() as session:
                lesson_plan_data['user_id'] = user_id
                
                lesson_plan = LessonPlan(**lesson_plan_data)
                session.add(lesson_plan)
                session.flush()
                
                logger.info(f"Lesson plan saved: {lesson_plan.id}")
                return True, "Lesson plan saved successfully", lesson_plan.to_dict()
                
        except Exception as e:
            logger.error(f"Failed to save lesson plan: {e}")
            return False, f"Failed to save lesson plan: {str(e)}", None
    
    def get_lesson_plans(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict]:
        """Get user's lesson plans"""
        try:
            with get_database_session_context() as session:
                lesson_plans = session.query(LessonPlan).filter(
                    LessonPlan.user_id == user_id
                ).order_by(desc(LessonPlan.created_at)).offset(offset).limit(limit).all()
                
                return [plan.to_dict() for plan in lesson_plans]
                
        except Exception as e:
            logger.error(f"Failed to get lesson plans: {e}")
            return []
    
    # Fluency Assessments
    def save_fluency_assessment(self, user_id: str, assessment_data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict]]:
        """Save fluency assessment to database"""
        try:
            with get_database_session_context() as session:
                assessment_data['user_id'] = user_id
                assessment_data['text_word_count'] = len(assessment_data.get('assessment_text', '').split())
                
                assessment = FluencyAssessment(**assessment_data)
                session.add(assessment)
                session.flush()
                
                logger.info(f"Fluency assessment saved: {assessment.id}")
                return True, "Fluency assessment saved successfully", assessment.to_dict()
                
        except Exception as e:
            logger.error(f"Failed to save fluency assessment: {e}")
            return False, f"Failed to save assessment: {str(e)}", None
    
    def save_fluency_results(self, assessment_id: str, results_data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict]]:
        """Save fluency assessment results"""
        try:
            with get_database_session_context() as session:
                results_data['assessment_id'] = assessment_id
                
                results = FluencyResult(**results_data)
                session.add(results)
                session.flush()
                
                logger.info(f"Fluency results saved: {results.id}")
                return True, "Fluency results saved successfully", results.to_dict()
                
        except Exception as e:
            logger.error(f"Failed to save fluency results: {e}")
            return False, f"Failed to save results: {str(e)}", None
    
    def get_fluency_assessments(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict]:
        """Get user's fluency assessments with results"""
        try:
            with get_database_session_context() as session:
                assessments = session.query(FluencyAssessment).filter(
                    FluencyAssessment.user_id == user_id
                ).order_by(desc(FluencyAssessment.created_at)).offset(offset).limit(limit).all()
                
                result = []
                for assessment in assessments:
                    assessment_dict = assessment.to_dict()
                    # Get latest results for this assessment
                    latest_result = session.query(FluencyResult).filter(
                        FluencyResult.assessment_id == assessment.id
                    ).order_by(desc(FluencyResult.created_at)).first()
                    
                    if latest_result:
                        assessment_dict['results'] = latest_result.to_dict()
                    
                    result.append(assessment_dict)
                
                return result
                
        except Exception as e:
            logger.error(f"Failed to get fluency assessments: {e}")
            return []
    
    # Generic content operations
    def get_content_by_id(self, content_type: str, content_id: str) -> Optional[Dict]:
        """Get content by ID and type"""
        try:
            if content_type not in self.content_models:
                return None
            
            with get_database_session_context() as session:
                model = self.content_models[content_type]
                content = session.query(model).filter(model.id == content_id).first()
                
                return content.to_dict() if content else None
                
        except Exception as e:
            logger.error(f"Failed to get content: {e}")
            return None
    
    def delete_content(self, content_type: str, content_id: str, user_id: str) -> Tuple[bool, str]:
        """Delete content by ID (only if user owns it)"""
        try:
            if content_type not in self.content_models:
                return False, "Invalid content type"
            
            with get_database_session_context() as session:
                model = self.content_models[content_type]
                content = session.query(model).filter(
                    and_(model.id == content_id, model.user_id == user_id)
                ).first()
                
                if not content:
                    return False, "Content not found or access denied"
                
                session.delete(content)
                
                logger.info(f"Content deleted: {content_type} {content_id}")
                return True, "Content deleted successfully"
                
        except Exception as e:
            logger.error(f"Failed to delete content: {e}")
            return False, f"Failed to delete content: {str(e)}"
    
    def search_content(self, user_id: str, query: str, content_types: List[str] = None, 
                      grade_level: str = None, subject: str = None, limit: int = 20) -> List[Dict]:
        """Search user's content across all types"""
        try:
            if not content_types:
                content_types = list(self.content_models.keys())
            
            results = []
            
            with get_database_session_context() as session:
                for content_type in content_types:
                    if content_type not in self.content_models:
                        continue
                    
                    model = self.content_models[content_type]
                    
                    # Build search query
                    search_query = session.query(model).filter(model.user_id == user_id)
                    
                    # Add text search (this is a simplified version - in production you'd use full-text search)
                    if hasattr(model, 'title'):
                        search_query = search_query.filter(
                            or_(
                                model.title.ilike(f'%{query}%'),
                                getattr(model, 'description', '').ilike(f'%{query}%') if hasattr(model, 'description') else False
                            )
                        )
                    elif hasattr(model, 'topic'):
                        search_query = search_query.filter(model.topic.ilike(f'%{query}%'))
                    
                    # Add filters
                    if grade_level and hasattr(model, 'grade_level'):
                        search_query = search_query.filter(model.grade_level == grade_level)
                    
                    if subject and hasattr(model, 'subject'):
                        search_query = search_query.filter(model.subject == subject)
                    
                    # Execute query
                    content_items = search_query.order_by(desc(model.created_at)).limit(limit // len(content_types)).all()
                    
                    for item in content_items:
                        item_dict = item.to_dict()
                        item_dict['content_type'] = content_type
                        results.append(item_dict)
            
            # Sort by creation date
            results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Failed to search content: {e}")
            return []
    
    def get_user_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for user"""
        try:
            stats = {}
            
            with get_database_session_context() as session:
                for content_type, model in self.content_models.items():
                    count = session.query(model).filter(model.user_id == user_id).count()
                    stats[f'{content_type}_count'] = count
                
                # Get recent activity (last 7 days)
                from datetime import datetime, timedelta
                week_ago = datetime.utcnow() - timedelta(days=7)
                
                recent_activity = 0
                for model in self.content_models.values():
                    recent_count = session.query(model).filter(
                        and_(model.user_id == user_id, model.created_at >= week_ago)
                    ).count()
                    recent_activity += recent_count
                
                stats['recent_activity'] = recent_activity
                stats['total_content'] = sum(stats[f'{ct}_count'] for ct in self.content_models.keys())
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get dashboard stats: {e}")
            return {}

# Global content manager instance
content_manager = ContentManager()
