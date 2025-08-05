import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

instance_path = os.path.join(BASE_DIR, 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)
    print(f"[Config] Carpeta 'instance' creada en: {instance_path}")

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'una-clave-secreta-muy-dificil'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'site.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY no configurada. Define JWT_SECRET_KEY en tu .env")
        
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 