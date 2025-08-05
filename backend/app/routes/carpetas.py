from flask import request, jsonify, Blueprint
from ..models import User, Carpeta, Indiciado
from ..extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

carpetas_bp = Blueprint('carpetas', __name__)

@carpetas_bp.route('', methods=['POST'])
@jwt_required()
def crear_carpeta():
    """Crea una nueva carpeta (sector) para el usuario autenticado."""
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    data = request.get_json()
    if not data or not data.get('nombre'):
        return jsonify({"msg": "El nombre de la carpeta es requerido"}), 400

    nombre_carpeta = data.get('nombre')
    parent_id = data.get('parent_id')

    if parent_id:
        parent = Carpeta.query.filter_by(id=parent_id, user_id=user.id).first()
        if not parent:
            return jsonify({"msg": "La carpeta padre no existe o no pertenece al usuario"}), 404
        nueva_carpeta = Carpeta(nombre=nombre_carpeta, user_id=user.id, parent_id=parent_id)
    else:
        if Carpeta.query.filter_by(user_id=user.id, nombre=nombre_carpeta).first():
            return jsonify({"msg": f"La carpeta '{nombre_carpeta}' ya existe"}), 409
        nueva_carpeta = Carpeta(nombre=nombre_carpeta, owner=user)

    db.session.add(nueva_carpeta)
    db.session.commit()
    return jsonify({
        "msg": "Carpeta creada exitosamente",
        "carpeta": nueva_carpeta.to_dict()
    }), 201

@carpetas_bp.route('', methods=['GET'])
@jwt_required()
def obtener_carpetas_usuario():
    """Obtiene todas las carpetas del usuario autenticado (sin incluir subcarpetas)."""
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    carpetas = Carpeta.query.filter_by(user_id=user.id, parent_id=None).order_by(Carpeta.nombre).all()
    return jsonify([c.to_dict() for c in carpetas]), 200

@carpetas_bp.route('/<int:id_carpeta>', methods=['GET'])
@jwt_required()
def obtener_carpeta_con_indiciados(id_carpeta):
    """Obtiene una carpeta específica con todos sus indiciados."""
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    carpeta = Carpeta.query.filter_by(id=id_carpeta, user_id=user.id).first()
    if not carpeta:
        return jsonify({"msg": "Carpeta no encontrada o no pertenece al usuario"}), 404

    indiciados_data = [indiciado.to_dict() for indiciado in carpeta.indiciados]
    carpeta_data = carpeta.to_dict()
    carpeta_data['indiciados'] = indiciados_data
    return jsonify(carpeta_data)

@carpetas_bp.route('/<int:id_carpeta>', methods=['DELETE'])
@jwt_required()
def borrar_carpeta(id_carpeta):
    """Borra una carpeta y todos los indiciados dentro de ella (en cascada)."""
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    carpeta = Carpeta.query.filter_by(id=id_carpeta, user_id=user.id).first()
    if not carpeta:
        return jsonify({"msg": "Carpeta no encontrada o no pertenece al usuario"}), 404
    db.session.delete(carpeta)
    db.session.commit()
    return jsonify({"msg": "Carpeta eliminada exitosamente"}), 200