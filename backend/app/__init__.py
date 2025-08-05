import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate, bcrypt, jwt

from .routes.auth import auth_bp
from .routes.carpetas import carpetas_bp
from .routes.indiciados import indiciados_bp

def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    
    app.config.from_object(config_class)

    instance_path = os.path.join(app.root_path, '..', 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
        print(f"Carpeta 'instance' creada en: {instance_path}")

    upload_folder = app.config.get('UPLOAD_FOLDER')
    if upload_folder and not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        print(f"Directorio de subidas creado en: {upload_folder}")

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    CORS(app, resources={
        r"/api/*": {
            "origins": "http://localhost:4200",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    })

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "El token ha expirado. Por favor, inicie sesión de nuevo."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": "Token inválido o faltante.", "error_detail": str(error)}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"msg": "Se requiere un token de acceso.", "error_detail": str(error)}), 401
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(carpetas_bp, url_prefix='/api/carpetas')
    app.register_blueprint(indiciados_bp, url_prefix='/api/indiciados')
    
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(
            app.config['UPLOAD_FOLDER'],
            filename,
            as_attachment=False
        )
        
    return app