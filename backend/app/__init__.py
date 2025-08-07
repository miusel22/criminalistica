import os
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate, bcrypt, jwt
from .models import Documento

from .routes.auth import auth_bp
from .routes.carpetas import carpetas_bp
from .routes.indiciados import indiciados_bp
from .routes.documentos import documentos_bp 

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
    app.register_blueprint(documentos_bp, url_prefix='/api/documentos')
    
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(
            app.config['UPLOAD_FOLDER'],
            filename,
            as_attachment=False
        )
    
    @app.route('/uploads/documentos/<path:filename>')
    def serve_document(filename):
        documento = Documento.query.filter_by(filename=filename).first_or_404()
        document_directory = os.path.join(app.config['UPLOAD_FOLDER'], 'documentos')

        wants_to_view = request.args.get('view', 'false').lower() == 'true'

        should_attach = not wants_to_view

        return send_from_directory(
            document_directory,
            filename,
            as_attachment=should_attach,
            download_name=documento.original_filename
        )
        
    return app