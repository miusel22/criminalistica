from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    JWTManager,
    get_jwt_identity
)
from flask_cors import CORS

import os
from datetime import timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# CORS (Angular en localhost:4200)
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:4200",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

# --- CONFIGURACIÓN ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)

if not app.config['JWT_SECRET_KEY']:
    raise RuntimeError("JWT_SECRET_KEY no configurada. Define JWT_SECRET_KEY en tu .env")

# --- INICIALIZACIÓN DE EXTENSIONES ---
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- MANEJADORES DE ERROR JWT ---
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"msg": "El token ha expirado."}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"msg": "Token inválido o faltante.", "error_detail": str(error)}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"msg": "Se requiere un token de acceso.", "error_detail": str(error)}), 401

# --- MODELOS DE BASE DE DATOS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)    # <-- AÑADIDO
    full_name = db.Column(db.String(100), nullable=True)             # <-- AÑADIDO
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# --- RUTAS DE LA API ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    full_name = data.get('full_name')

    if not all([username, password, email]):
        return jsonify({"msg": "Faltan usuario, contraseña o email"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "El nombre de usuario ya existe"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El email ya está en uso"}), 400

    new_user = User(
        username=username, 
        email=email, 
        full_name=full_name
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Faltan credenciales"}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        # La identidad sigue siendo el username, que es único
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Nombre de usuario o contraseña incorrectos"}), 401

@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    # Obtiene el 'username' guardado en el token
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    # Devuelve un objeto con la información del perfil del usuario
    # ¡NUNCA incluyas la contraseña o el hash!
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name
    }), 200

# La ruta '/data' ha sido eliminada.

# Punto de entrada
if __name__ == '__main__':
    import logging
    logging.getLogger('werkzeug').setLevel(logging.ERROR)
    app.run(debug=True, use_reloader=False)