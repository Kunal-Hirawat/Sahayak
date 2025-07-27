"""
Database Configuration for Sahayak Educational Platform
Supports both local PostgreSQL and Google Cloud SQL
"""

import os
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration management"""
    
    def __init__(self):
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.database_url = self._get_database_url()
        self.engine = None
        self.SessionLocal = None
        
    def _get_database_url(self) -> str:
        """Get database URL based on environment"""
        
        if self.environment == 'production':
            # Google Cloud SQL configuration
            db_user = os.getenv('DB_USER', 'sahayak_user')
            db_password = os.getenv('DB_PASSWORD')
            db_name = os.getenv('DB_NAME', 'sahayak_db')
            db_host = os.getenv('DB_HOST')  # Cloud SQL instance IP
            db_port = os.getenv('DB_PORT', '5432')

            if not all([db_password, db_host]):
                raise ValueError("Missing required database environment variables for production")

            # For Google Cloud SQL with SSL
            ssl_params = "?sslmode=require" if os.getenv('DB_SSL', 'true').lower() == 'true' else ""
            database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}{ssl_params}"
            
        elif self.environment == 'staging':
            # Staging environment (could be Cloud SQL or other)
            db_user = os.getenv('DB_USER', 'sahayak_staging')
            db_password = os.getenv('DB_PASSWORD')
            db_name = os.getenv('DB_NAME', 'sahayak_staging_db')
            db_host = os.getenv('DB_HOST', 'localhost')
            db_port = os.getenv('DB_PORT', '5432')

            if not db_password:
                raise ValueError("Missing DB_PASSWORD environment variable for staging")

            database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
            
        else:
            # Development environment (local PostgreSQL)
            db_user = os.getenv('DB_USER', 'sahayak_dev')
            db_password = os.getenv('DB_PASSWORD', 'sahayak_password')
            db_name = os.getenv('DB_NAME', 'sahayak_dev_db')
            db_host = os.getenv('DB_HOST', 'localhost')
            db_port = os.getenv('DB_PORT', '5432')

            database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        
        logger.info(f"Database URL configured for {self.environment} environment")
        return database_url
    
    def initialize_engine(self):
        """Initialize SQLAlchemy engine and session factory"""
        engine_kwargs = {
            'echo': self.environment == 'development',  # Log SQL queries in development
            'pool_size': int(os.getenv('DB_POOL_SIZE') or '10'),
            'max_overflow': int(os.getenv('DB_MAX_OVERFLOW') or '20'),
            'pool_timeout': int(os.getenv('DB_POOL_TIMEOUT') or '30'),
            'pool_recycle': int(os.getenv('DB_POOL_RECYCLE') or '3600'),  # 1 hour
        }
        
        # Additional settings for production
        if self.environment == 'production':
            engine_kwargs.update({
                'pool_pre_ping': True,  # Validate connections before use
                'connect_args': {
                    'sslmode': 'require',
                    'connect_timeout': 10,
                }
            })
        
        self.engine = create_engine(self.database_url, **engine_kwargs)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        logger.info("Database engine initialized successfully")
    
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

            logger.info("Database connection test successful")
            return True

        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False
    
    def create_tables(self):
        """Create all database tables"""
        try:
            if not self.engine:
                self.initialize_engine()
            
            from .models import Base
            Base.metadata.create_all(bind=self.engine)
            
            logger.info("Database tables created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
            raise

# Global database configuration instance
db_config = DatabaseConfig()

# Convenience functions
def get_database_session():
    """Get a database session (convenience function)"""
    return db_config.get_session()

def get_database_session_context():
    """Get a database session context manager (convenience function)"""
    return db_config.get_session_context()

def initialize_database():
    """Initialize database connection and create tables if needed"""
    try:
        # Test PostgreSQL connection first
        if db_config.test_connection():
            # Create tables
            db_config.create_tables()
            logger.info("PostgreSQL database initialization completed successfully")
            return True
        else:
            logger.warning("PostgreSQL connection failed, trying SQLite fallback...")
            # Try SQLite fallback
            from .sqlite_config import initialize_sqlite_database
            if initialize_sqlite_database():
                logger.info("SQLite database initialization completed successfully")
                return True
            else:
                raise Exception("Both PostgreSQL and SQLite initialization failed")

    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Try SQLite as last resort
        try:
            logger.info("Attempting SQLite fallback...")
            from .sqlite_config import initialize_sqlite_database
            if initialize_sqlite_database():
                logger.info("SQLite fallback successful")
                return True
        except Exception as sqlite_error:
            logger.error(f"SQLite fallback also failed: {sqlite_error}")

        return False

# Environment-specific configurations
ENVIRONMENT_CONFIGS = {
    'development': {
        'debug': True,
        'testing': False,
        'database_echo': True,
    },
    'staging': {
        'debug': False,
        'testing': False,
        'database_echo': False,
    },
    'production': {
        'debug': False,
        'testing': False,
        'database_echo': False,
    }
}

def get_environment_config():
    """Get configuration for current environment"""
    env = os.getenv('ENVIRONMENT', 'development')
    return ENVIRONMENT_CONFIGS.get(env, ENVIRONMENT_CONFIGS['development'])

# Google Cloud SQL specific configurations
GOOGLE_CLOUD_SQL_CONFIG = {
    'instance_connection_name': os.getenv('GOOGLE_CLOUD_SQL_INSTANCE'),  # project:region:instance
    'database_version': 'POSTGRES_15',
    'tier': os.getenv('GOOGLE_CLOUD_SQL_TIER', 'db-f1-micro'),  # Machine type
    'storage_size': os.getenv('GOOGLE_CLOUD_SQL_STORAGE_SIZE', '10'),  # GB
    'storage_type': 'SSD',
    'backup_enabled': True,
    'backup_start_time': '03:00',  # 3 AM UTC
    'maintenance_window_day': 7,  # Sunday
    'maintenance_window_hour': 4,  # 4 AM UTC
    'authorized_networks': os.getenv('GOOGLE_CLOUD_SQL_AUTHORIZED_NETWORKS', '').split(',') if os.getenv('GOOGLE_CLOUD_SQL_AUTHORIZED_NETWORKS') else [],
}

def get_google_cloud_sql_config():
    """Get Google Cloud SQL configuration"""
    return GOOGLE_CLOUD_SQL_CONFIG

# Database migration utilities
def run_migrations():
    """Run database migrations (placeholder for Alembic integration)"""
    # This would integrate with Alembic for database migrations
    # For now, we'll just create tables
    logger.info("Running database migrations...")
    db_config.create_tables()
    logger.info("Database migrations completed")

def backup_database():
    """Backup database (placeholder for backup functionality)"""
    logger.info("Database backup functionality would be implemented here")
    # This would implement database backup logic
    pass

def restore_database(backup_file: str):
    """Restore database from backup (placeholder)"""
    logger.info(f"Database restore from {backup_file} would be implemented here")
    # This would implement database restore logic
    pass
