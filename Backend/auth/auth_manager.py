"""
Authentication Manager for Sahayak Educational Platform
Handles user registration, login, session management, and JWT tokens
"""

import os
import jwt
import bcrypt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from database.models import User, UserSession, PasswordResetToken
from database.config import get_database_session_context
import logging

logger = logging.getLogger(__name__)

class AuthenticationManager:
    """Handles all authentication-related operations"""
    
    def __init__(self):
        self.jwt_secret = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        self.jwt_algorithm = 'HS256'
        self.access_token_expire_hours = int(os.getenv('ACCESS_TOKEN_EXPIRE_HOURS', '24'))
        self.refresh_token_expire_days = int(os.getenv('REFRESH_TOKEN_EXPIRE_DAYS', '30'))
        self.password_reset_expire_hours = int(os.getenv('PASSWORD_RESET_EXPIRE_HOURS', '2'))
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def generate_tokens(self, user: User) -> Tuple[str, str]:
        """Generate access and refresh tokens for a user"""
        # Access token payload
        access_payload = {
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=self.access_token_expire_hours),
            'iat': datetime.utcnow(),
            'type': 'access'
        }
        
        # Refresh token payload
        refresh_payload = {
            'user_id': str(user.id),
            'exp': datetime.utcnow() + timedelta(days=self.refresh_token_expire_days),
            'iat': datetime.utcnow(),
            'type': 'refresh'
        }
        
        access_token = jwt.encode(access_payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        refresh_token = jwt.encode(refresh_payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        
        return access_token, refresh_token
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None
    
    def register_user(self, user_data: Dict[str, Any]) -> Tuple[bool, str, Optional[User]]:
        """Register a new user"""
        try:
            with get_database_session_context() as session:
                # Check if user already exists
                existing_user = session.query(User).filter(User.email == user_data['email']).first()
                if existing_user:
                    return False, "User with this email already exists", None
                
                # Hash password
                user_data['password_hash'] = self.hash_password(user_data.pop('password'))
                
                # Create user
                user = User(**user_data)
                session.add(user)
                session.flush()  # Get the user ID
                
                logger.info(f"New user registered: {user.email}")
                return True, "User registered successfully", user
                
        except Exception as e:
            logger.error(f"User registration failed: {e}")
            return False, f"Registration failed: {str(e)}", None
    
    def login_user(self, email: str, password: str, ip_address: str = None, user_agent: str = None) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Authenticate user and create session"""
        try:
            with get_database_session_context() as session:
                # Find user
                user = session.query(User).filter(User.email == email).first()
                if not user:
                    return False, "Invalid email or password", None
                
                # Check if user is active
                if not user.is_active:
                    return False, "Account is deactivated", None
                
                # Verify password
                if not self.verify_password(password, user.password_hash):
                    return False, "Invalid email or password", None
                
                # Generate tokens
                access_token, refresh_token = self.generate_tokens(user)
                
                # Create session record
                session_record = UserSession(
                    user_id=user.id,
                    session_token=access_token,
                    refresh_token=refresh_token,
                    expires_at=datetime.utcnow() + timedelta(hours=self.access_token_expire_hours),
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                session.add(session_record)
                
                # Update last login
                user.last_login_at = datetime.utcnow()
                
                logger.info(f"User logged in: {user.email}")
                
                return True, "Login successful", {
                    'user': user.to_dict(),
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'expires_in': self.access_token_expire_hours * 3600  # seconds
                }
                
        except Exception as e:
            logger.error(f"User login failed: {e}")
            return False, f"Login failed: {str(e)}", None
    
    def logout_user(self, token: str) -> Tuple[bool, str]:
        """Logout user and invalidate session"""
        try:
            payload = self.verify_token(token)
            if not payload:
                return False, "Invalid token"
            
            with get_database_session_context() as session:
                # Find and deactivate session
                session_record = session.query(UserSession).filter(
                    UserSession.session_token == token,
                    UserSession.is_active == True
                ).first()
                
                if session_record:
                    session_record.is_active = False
                    logger.info(f"User logged out: {payload.get('email')}")
                
                return True, "Logout successful"
                
        except Exception as e:
            logger.error(f"User logout failed: {e}")
            return False, f"Logout failed: {str(e)}"
    
    def refresh_token(self, refresh_token: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Refresh access token using refresh token"""
        try:
            payload = self.verify_token(refresh_token)
            if not payload or payload.get('type') != 'refresh':
                return False, "Invalid refresh token", None
            
            with get_database_session_context() as session:
                # Find user
                user = session.query(User).filter(User.id == payload['user_id']).first()
                if not user or not user.is_active:
                    return False, "User not found or inactive", None
                
                # Generate new tokens
                new_access_token, new_refresh_token = self.generate_tokens(user)
                
                # Update session record
                session_record = session.query(UserSession).filter(
                    UserSession.refresh_token == refresh_token,
                    UserSession.is_active == True
                ).first()
                
                if session_record:
                    session_record.session_token = new_access_token
                    session_record.refresh_token = new_refresh_token
                    session_record.expires_at = datetime.utcnow() + timedelta(hours=self.access_token_expire_hours)
                
                return True, "Token refreshed successfully", {
                    'access_token': new_access_token,
                    'refresh_token': new_refresh_token,
                    'expires_in': self.access_token_expire_hours * 3600
                }
                
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            return False, f"Token refresh failed: {str(e)}", None
    
    def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from token"""
        try:
            payload = self.verify_token(token)
            if not payload:
                return None
            
            with get_database_session_context() as session:
                user = session.query(User).filter(User.id == payload['user_id']).first()
                return user
                
        except Exception as e:
            logger.error(f"Get current user failed: {e}")
            return None
    
    def request_password_reset(self, email: str) -> Tuple[bool, str, Optional[str]]:
        """Request password reset token"""
        try:
            with get_database_session_context() as session:
                user = session.query(User).filter(User.email == email).first()
                if not user:
                    # Don't reveal if email exists or not
                    return True, "If the email exists, a reset link will be sent", None
                
                # Generate reset token
                reset_token = secrets.token_urlsafe(32)
                
                # Create reset token record
                token_record = PasswordResetToken(
                    user_id=user.id,
                    token=reset_token,
                    expires_at=datetime.utcnow() + timedelta(hours=self.password_reset_expire_hours)
                )
                session.add(token_record)
                
                logger.info(f"Password reset requested for: {email}")
                return True, "Reset token generated", reset_token
                
        except Exception as e:
            logger.error(f"Password reset request failed: {e}")
            return False, f"Password reset request failed: {str(e)}", None
    
    def reset_password(self, token: str, new_password: str) -> Tuple[bool, str]:
        """Reset password using reset token"""
        try:
            with get_database_session_context() as session:
                # Find valid reset token
                token_record = session.query(PasswordResetToken).filter(
                    PasswordResetToken.token == token,
                    PasswordResetToken.used_at.is_(None),
                    PasswordResetToken.expires_at > datetime.utcnow()
                ).first()
                
                if not token_record:
                    return False, "Invalid or expired reset token"
                
                # Find user
                user = session.query(User).filter(User.id == token_record.user_id).first()
                if not user:
                    return False, "User not found"
                
                # Update password
                user.password_hash = self.hash_password(new_password)
                
                # Mark token as used
                token_record.used_at = datetime.utcnow()
                
                # Invalidate all user sessions
                session.query(UserSession).filter(
                    UserSession.user_id == user.id,
                    UserSession.is_active == True
                ).update({'is_active': False})
                
                logger.info(f"Password reset completed for: {user.email}")
                return True, "Password reset successful"
                
        except Exception as e:
            logger.error(f"Password reset failed: {e}")
            return False, f"Password reset failed: {str(e)}"
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions and tokens"""
        try:
            with get_database_session_context() as session:
                # Deactivate expired sessions
                expired_sessions = session.query(UserSession).filter(
                    UserSession.expires_at < datetime.utcnow(),
                    UserSession.is_active == True
                ).update({'is_active': False})
                
                # Delete old password reset tokens
                session.query(PasswordResetToken).filter(
                    PasswordResetToken.expires_at < datetime.utcnow()
                ).delete()
                
                logger.info(f"Cleaned up {expired_sessions} expired sessions")
                
        except Exception as e:
            logger.error(f"Session cleanup failed: {e}")

# Global authentication manager instance
auth_manager = AuthenticationManager()
