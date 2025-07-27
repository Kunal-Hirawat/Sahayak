"""
Database Models for Sahayak Educational Platform
PostgreSQL models using SQLAlchemy ORM
"""

from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, DECIMAL, BIGINT, Date, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey, UniqueConstraint, CheckConstraint
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    role = Column(String(20), default='teacher')
    school_name = Column(String(200))
    district = Column(String(100))
    state = Column(String(50))
    country = Column(String(50), default='India')
    grade_levels = Column(ARRAY(String))
    subjects = Column(ARRAY(String))
    experience_years = Column(Integer)
    profile_image_url = Column(Text)
    bio = Column(Text)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    eli5_explanations = relationship("ELI5Explanation", back_populates="user", cascade="all, delete-orphan")
    stories = relationship("Story", back_populates="user", cascade="all, delete-orphan")
    visual_aids = relationship("VisualAid", back_populates="user", cascade="all, delete-orphan")
    games = relationship("EducationalGame", back_populates="user", cascade="all, delete-orphan")
    lesson_plans = relationship("LessonPlan", back_populates="user", cascade="all, delete-orphan")
    fluency_assessments = relationship("FluencyAssessment", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'full_name': self.full_name,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'role': self.role,
            'school_name': self.school_name,
            'district': self.district,
            'state': self.state,
            'country': self.country,
            'grade_levels': self.grade_levels,
            'subjects': self.subjects,
            'experience_years': self.experience_years,
            'profile_image_url': self.profile_image_url,
            'bio': self.bio,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }

class UserSession(Base):
    __tablename__ = 'user_sessions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    refresh_token = Column(String(255), unique=True)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(INET)
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class PasswordResetToken(Base):
    __tablename__ = 'password_reset_tokens'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime)
    created_at = Column(DateTime, default=func.current_timestamp())

class ELI5Explanation(Base):
    __tablename__ = 'eli5_explanations'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    topic = Column(String(500), nullable=False)
    grade_level = Column(String(10), nullable=False)
    subject = Column(String(100))
    explanation = Column(Text, nullable=False)
    complexity_level = Column(String(20), default='simple')
    language = Column(String(10), default='en')
    word_count = Column(Integer)
    reading_time_minutes = Column(Integer)
    is_public = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="eli5_explanations")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'topic': self.topic,
            'grade_level': self.grade_level,
            'subject': self.subject,
            'explanation': self.explanation,
            'complexity_level': self.complexity_level,
            'language': self.language,
            'word_count': self.word_count,
            'reading_time_minutes': self.reading_time_minutes,
            'is_public': self.is_public,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Story(Base):
    __tablename__ = 'stories'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(300), nullable=False)
    theme = Column(String(100))
    characters = Column(ARRAY(String))
    grade_level = Column(String(10), nullable=False)
    subject = Column(String(100))
    moral_lesson = Column(String(500))
    story_content = Column(Text, nullable=False)
    language = Column(String(10), default='en')
    word_count = Column(Integer)
    estimated_reading_time = Column(Integer)
    is_public = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="stories")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'title': self.title,
            'theme': self.theme,
            'characters': self.characters,
            'grade_level': self.grade_level,
            'subject': self.subject,
            'moral_lesson': self.moral_lesson,
            'story_content': self.story_content,
            'language': self.language,
            'word_count': self.word_count,
            'estimated_reading_time': self.estimated_reading_time,
            'is_public': self.is_public,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class VisualAid(Base):
    __tablename__ = 'visual_aids'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    subject = Column(String(100), nullable=False)
    topic = Column(String(300), nullable=False)
    grade_level = Column(String(10), nullable=False)
    complexity = Column(String(20), default='simple')
    color_scheme = Column(String(50))
    style = Column(String(50))
    size = Column(String(20))
    include_labels = Column(Boolean, default=True)
    include_explanation = Column(Boolean, default=True)
    image_url = Column(Text)
    image_prompt = Column(Text)
    generation_metadata = Column(JSONB)
    is_public = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="visual_aids")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'topic': self.topic,
            'grade_level': self.grade_level,
            'complexity': self.complexity,
            'color_scheme': self.color_scheme,
            'style': self.style,
            'size': self.size,
            'include_labels': self.include_labels,
            'include_explanation': self.include_explanation,
            'image_url': self.image_url,
            'image_prompt': self.image_prompt,
            'generation_metadata': self.generation_metadata,
            'is_public': self.is_public,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class EducationalGame(Base):
    __tablename__ = 'educational_games'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    subject = Column(String(100), nullable=False)
    topic = Column(String(300), nullable=False)
    grade_level = Column(String(10), nullable=False)
    theme = Column(String(100))
    difficulty = Column(String(20), default='medium')
    duration = Column(String(20), default='medium')
    game_type = Column(String(50))
    html_code = Column(Text, nullable=False)
    design_document = Column(Text)
    play_count = Column(Integer, default=0)
    is_public = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="games")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'topic': self.topic,
            'grade_level': self.grade_level,
            'theme': self.theme,
            'difficulty': self.difficulty,
            'duration': self.duration,
            'game_type': self.game_type,
            'html_code': self.html_code,
            'design_document': self.design_document,
            'play_count': self.play_count,
            'is_public': self.is_public,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class LessonPlan(Base):
    __tablename__ = 'lesson_plans'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(300), nullable=False)
    subject = Column(String(100), nullable=False)
    grade_level = Column(String(10), nullable=False)
    week_number = Column(Integer)
    academic_year = Column(String(10))
    curriculum_standard = Column(String(100))
    learning_objectives = Column(ARRAY(String))
    plan_content = Column(Text, nullable=False)
    materials_needed = Column(ARRAY(String))
    assessment_methods = Column(ARRAY(String))
    homework_assignments = Column(ARRAY(String))
    duration_minutes = Column(Integer)
    is_public = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relationships
    user = relationship("User", back_populates="lesson_plans")

class FluencyAssessment(Base):
    __tablename__ = 'fluency_assessments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    student_name = Column(String(200), nullable=False)
    grade_level = Column(String(10), nullable=False)
    assessment_text = Column(Text, nullable=False)
    text_title = Column(String(300))
    text_word_count = Column(Integer)
    audio_file_url = Column(Text)
    audio_duration_seconds = Column(DECIMAL(8,2))
    audio_file_size_bytes = Column(BIGINT)
    assessment_date = Column(Date, default=func.current_date())
    is_custom_text = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relationships
    user = relationship("User", back_populates="fluency_assessments")
    results = relationship("FluencyResult", back_populates="assessment", cascade="all, delete-orphan")

class FluencyResult(Base):
    __tablename__ = 'fluency_results'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey('fluency_assessments.id', ondelete='CASCADE'), nullable=False)
    reading_speed_wpm = Column(DECIMAL(6,2))
    accuracy_percentage = Column(DECIMAL(5,2))
    fluency_score = Column(DECIMAL(4,2))
    pronunciation_score = Column(DECIMAL(4,2))
    overall_feedback = Column(Text)
    improvement_suggestions = Column(Text)
    detailed_analysis = Column(JSONB)
    processing_status = Column(String(20), default='completed')
    processing_time_seconds = Column(Integer)
    created_at = Column(DateTime, default=func.current_timestamp())

    # Relationships
    assessment = relationship("FluencyAssessment", back_populates="results")

# Database connection and session management
class DatabaseManager:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url, echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def create_tables(self):
        """Create all tables in the database"""
        Base.metadata.create_all(bind=self.engine)

    def get_session(self):
        """Get a database session"""
        return self.SessionLocal()

    def close_session(self, session):
        """Close a database session"""
        session.close()

# Utility functions for database operations
def get_user_by_email(session, email: str) -> Optional[User]:
    """Get user by email address"""
    return session.query(User).filter(User.email == email).first()

def get_user_by_id(session, user_id: str) -> Optional[User]:
    """Get user by ID"""
    return session.query(User).filter(User.id == user_id).first()

def create_user(session, user_data: Dict[str, Any]) -> User:
    """Create a new user"""
    user = User(**user_data)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_user_content(session, user_id: str, content_type: str, limit: int = 10):
    """Get user's content by type"""
    model_map = {
        'eli5': ELI5Explanation,
        'story': Story,
        'visual_aid': VisualAid,
        'game': EducationalGame,
        'lesson_plan': LessonPlan,
        'fluency_assessment': FluencyAssessment
    }

    if content_type not in model_map:
        return []

    model = model_map[content_type]
    return session.query(model).filter(model.user_id == user_id).order_by(model.created_at.desc()).limit(limit).all()

def save_content(session, content_data: Dict[str, Any], content_type: str) -> Any:
    """Save content to database"""
    model_map = {
        'eli5': ELI5Explanation,
        'story': Story,
        'visual_aid': VisualAid,
        'game': EducationalGame,
        'lesson_plan': LessonPlan,
        'fluency_assessment': FluencyAssessment
    }

    if content_type not in model_map:
        raise ValueError(f"Unknown content type: {content_type}")

    model = model_map[content_type]
    content = model(**content_data)
    session.add(content)
    session.commit()
    session.refresh(content)
    return content
