from flask import request, jsonify, Blueprint
from ..models import User
from ..extensions import db, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibió un cuerpo de solicitud JSON"}), 400

    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    full_name = data.get('full_name')

    if not all([username, password, email]):
        return jsonify({"msg": "Faltan usuario, contraseña o email"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "El nombre de usuario ya existe"}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El email ya está en uso"}), 409

    new_user = User(
        username=username,
        email=email,
        full_name=full_name
    )
    new_user.set_password(password, bcrypt) 
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibió un cuerpo de solicitud JSON"}), 400
        
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Faltan credenciales"}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password, bcrypt):
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Nombre de usuario o contraseña incorrectos"}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first()

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name
    }), 200