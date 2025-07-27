"""
SQLite configuration for development/testing
Use this when PostgreSQL is not available
"""

import os
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

class SQLiteConfig:
    """SQLite configuration for development"""
    
    def __init__(self):
        self.database_path = os.path.join(os.path.dirname(__file__), '..', 'sahayak_dev.db')
        self.database_url = f"sqlite:///{self.database_path}"
        self.engine = None
        self.SessionLocal = None
        
    def initialize_engine(self):
        """Initialize SQLAlchemy engine for SQLite"""
        self.engine = create_engine(
            self.database_url,
            echo=True,  # Log SQL queries
            connect_args={"check_same_thread": False}  # SQLite specific
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        logger.info("SQLite engine initialized successfully")
    
    def get_session(self):
        """Get a database session"""
        if not self.SessionLocal:
            self.initialize_engine()
        return self.SessionLocal()
    
    @contextmanager
    def get_session_context(self):
        """Get a database session with automatic cleanup"""
        session = self.get_session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()
    
    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            if not self.engine:
                self.initialize_engine()

            from sqlalchemy import text
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))

            logger.info("SQLite connection test successful")
            return True

        except Exception as e:
            logger.error(f"SQLite connection test failed: {e}")
            return False
    
    def create_tables(self):
        """Create all database tables"""
        try:
            if not self.engine:
                self.initialize_engine()
            
            from .models import Base
            Base.metadata.create_all(bind=self.engine)
            
            logger.info("SQLite tables created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create SQLite tables: {e}")
            raise

# Global SQLite configuration instance
sqlite_config = SQLiteConfig()

def get_sqlite_session():
    """Get a SQLite database session"""
    return sqlite_config.get_session()

def get_sqlite_session_context():
    """Get a SQLite database session context manager"""
    return sqlite_config.get_session_context()

def initialize_sqlite_database():
    """Initialize SQLite database"""
    try:
        # Test connection
        if not sqlite_config.test_connection():
            raise Exception("SQLite connection failed")
        
        # Create tables
        sqlite_config.create_tables()
        
        logger.info("SQLite database initialization completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"SQLite database initialization failed: {e}")
        return False
