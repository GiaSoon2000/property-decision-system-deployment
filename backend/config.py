# backend/config.py

import os
from dotenv import load_dotenv
import sys

# Load environment variables from .env file
load_dotenv()

# Validate critical environment variables
def validate_env_variables():
    required_vars = ['OPENAI_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print("\nEnvironment Variable Error:")
        print("----------------------------")
        print(f"Missing required environment variables: {', '.join(missing_vars)}")
        print("\nTo fix this:")
        print("1. Create a .env file in the backend directory if it doesn't exist")
        print("2. Add the following line to your .env file:")
        print("   OPENAI_API_KEY=your-actual-openai-api-key-here")
        print("\nMake sure to replace 'your-actual-openai-api-key-here' with your OpenAI API key")
        print("You can get an API key from: https://platform.openai.com/api-keys")
        sys.exit(1)

# Run validation
validate_env_variables()

class Config:
    # Your existing configurations
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'WW15257Z')
    MYSQL_DB = os.getenv('MYSQL_DB', 'property_db')
    
    # OpenAI configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini ')
    
    # Flask configuration
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'WW15257Z!')
    
    # Other configurations...
    UPLOAD_FOLDER = 'static/images/property_images'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    @classmethod
    def init_app(cls, app):
        """Initialize the application with configuration settings"""
        try:
            # Create upload folder if it doesn't exist
            if not os.path.exists(cls.UPLOAD_FOLDER):
                os.makedirs(cls.UPLOAD_FOLDER)
                
            # Set Flask configurations
            app.config['UPLOAD_FOLDER'] = cls.UPLOAD_FOLDER
            app.config['MAX_CONTENT_LENGTH'] = cls.MAX_CONTENT_LENGTH
            app.secret_key = cls.SECRET_KEY
            
            return True
        except Exception as e:
            print(f"Error initializing application configuration: {e}")
            return False