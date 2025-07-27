"""
Authentication Routes for Sahayak Educational Platform
Flask routes for user registration, login, logout, and profile management
"""

from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from typing import Optional, Dict, Any
import logging
from .auth_manager import auth_manager
from database.models import User
from database.config import get_database_session_context

logger = logging.getLogger(__name__)

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Verify token
        payload = auth_manager.verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Get current user
        current_user = auth_manager.get_current_user(token)
        if not current_user:
            return jsonify({'error': 'User not found'}), 401
        
        # Add user to request context
        request.current_user = current_user
        request.token_payload = payload
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        email = data['email'].lower().strip()
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        password = data['password']
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Prepare user data
        user_data = {
            'email': email,
            'password': password,
            'first_name': data['first_name'].strip(),
            'last_name': data['last_name'].strip(),
            'phone': data.get('phone', '').strip(),
            'school_name': data.get('school_name', '').strip(),
            'district': data.get('district', '').strip(),
            'state': data.get('state', '').strip(),
            'grade_levels': data.get('grade_levels', []),
            'subjects': data.get('subjects', []),
            'experience_years': data.get('experience_years'),
            'bio': data.get('bio', '').strip()
        }
        
        # Register user
        success, message, user = auth_manager.register_user(user_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': user.to_dict() if user else None
            }), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Get client info
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        user_agent = request.headers.get('User-Agent')
        
        # Attempt login
        success, message, login_data = auth_manager.login_user(
            email, password, ip_address, user_agent
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                **login_data
            }), 200
        else:
            return jsonify({'error': message}), 401
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """Logout user"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1] if auth_header else None
        
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        success, message = auth_manager.logout_user(token)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token"""
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        success, message, token_data = auth_manager.refresh_token(refresh_token)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                **token_data
            }), 200
        else:
            return jsonify({'error': message}), 401
            
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
    try:
        return jsonify({
            'success': True,
            'user': request.current_user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        return jsonify({'error': 'Failed to get profile'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        
        with get_database_session_context() as session:
            user = session.query(User).filter(User.id == request.current_user.id).first()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Update allowed fields
            updatable_fields = [
                'first_name', 'last_name', 'phone', 'school_name', 
                'district', 'state', 'grade_levels', 'subjects', 
                'experience_years', 'bio'
            ]
            
            for field in updatable_fields:
                if field in data:
                    setattr(user, field, data[field])
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'user': user.to_dict()
            }), 200
            
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password"""
    try:
        data = request.get_json()
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400
        
        with get_database_session_context() as session:
            user = session.query(User).filter(User.id == request.current_user.id).first()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Verify current password
            if not auth_manager.verify_password(current_password, user.password_hash):
                return jsonify({'error': 'Current password is incorrect'}), 400
            
            # Update password
            user.password_hash = auth_manager.hash_password(new_password)
            
            return jsonify({
                'success': True,
                'message': 'Password changed successfully'
            }), 200
            
    except Exception as e:
        logger.error(f"Change password error: {e}")
        return jsonify({'error': 'Failed to change password'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        success, message, reset_token = auth_manager.request_password_reset(email)
        
        # In production, you would send an email with the reset token
        # For now, we'll return it in the response (NOT recommended for production)
        response_data = {
            'success': success,
            'message': message
        }
        
        # Only include token in development environment
        if current_app.config.get('DEBUG') and reset_token:
            response_data['reset_token'] = reset_token
        
        return jsonify(response_data), 200 if success else 400
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({'error': 'Failed to process password reset request'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using reset token"""
    try:
        data = request.get_json()
        
        reset_token = data.get('reset_token')
        new_password = data.get('new_password')
        
        if not reset_token or not new_password:
            return jsonify({'error': 'Reset token and new password are required'}), 400
        
        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400
        
        success, message = auth_manager.reset_password(reset_token, new_password)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({'error': 'Failed to reset password'}), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify if a token is valid"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        payload = auth_manager.verify_token(token)
        
        if payload:
            user = auth_manager.get_current_user(token)
            return jsonify({
                'success': True,
                'valid': True,
                'user': user.to_dict() if user else None,
                'payload': payload
            }), 200
        else:
            return jsonify({
                'success': True,
                'valid': False
            }), 200
            
    except Exception as e:
        logger.error(f"Verify token error: {e}")
        return jsonify({'error': 'Failed to verify token'}), 500

# Error handlers
@auth_bp.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@auth_bp.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized'}), 401

@auth_bp.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden'}), 403

@auth_bp.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@auth_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500
