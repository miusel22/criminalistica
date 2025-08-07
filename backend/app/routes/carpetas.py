from flask import request, jsonify, Blueprint
from ..models import User, Carpeta, Indiciado
from ..extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

carpetas_bp = Blueprint('carpetas', __name__)

# --- CREAR CARPETA (Sin cambios) ---
@carpetas_bp.route('', methods=['POST'])
@jwt_required()
def crear_carpeta():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Cuerpo de la solicitud JSON vacío o inválido"}), 400

    nombre_carpeta = data.get('nombre')
    parent_id = data.get('parent_id')

    if not nombre_carpeta or not isinstance(nombre_carpeta, str) or nombre_carpeta.strip() == "":
        return jsonify({"msg": "El campo 'nombre' es requerido y debe ser un texto no vacío"}), 400
    
    nombre_carpeta = nombre_carpeta.strip()

    if parent_id:
        parent = Carpeta.query.filter_by(id=parent_id, user_id=user.id).first()
        if not parent:
            return jsonify({"msg": "El sector padre no existe o no pertenece al usuario"}), 404
        
        existe = Carpeta.query.filter_by(user_id=user.id, parent_id=parent_id, nombre=nombre_carpeta).first()
        if existe:
            return jsonify({"msg": f"El sub-sector '{nombre_carpeta}' ya existe en '{parent.nombre}'"}), 409

        nueva_carpeta = Carpeta(nombre=nombre_carpeta, user_id=user.id, parent_id=parent_id)

    else:
        existe = Carpeta.query.filter_by(user_id=user.id, parent_id=None, nombre=nombre_carpeta).first()
        if existe:
            return jsonify({"msg": f"El sector '{nombre_carpeta}' ya existe"}), 409
            
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
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    carpetas = Carpeta.query.filter_by(user_id=user.id, parent_id=None).order_by(Carpeta.nombre).all()
    return jsonify([c.to_dict() for c in carpetas]), 200

@carpetas_bp.route('/<int:id_carpeta>', methods=['GET'])
@jwt_required()
def obtener_carpeta_con_indiciados(id_carpeta):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    carpeta = Carpeta.query.filter_by(id=id_carpeta, user_id=user.id).first()
    
    if not carpeta:
        return jsonify({"msg": "Carpeta no encontrada o no pertenece al usuario"}), 404

    return jsonify(carpeta.to_dict(include_indiciados=True))

@carpetas_bp.route('/<int:id_carpeta>', methods=['PUT'])
@jwt_required()
def actualizar_carpeta(id_carpeta):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    
    carpeta = Carpeta.query.filter_by(id=id_carpeta, user_id=user.id).first()
    if not carpeta:
        return jsonify({"msg": "Carpeta no encontrada o no pertenece al usuario"}), 404

    data = request.get_json()
    nuevo_nombre = data.get('nombre')

    if not nuevo_nombre or not isinstance(nuevo_nombre, str) or nuevo_nombre.strip() == "":
        return jsonify({"msg": "El campo 'nombre' es requerido y debe ser un texto no vacío"}), 400

    nuevo_nombre = nuevo_nombre.strip()

    query_conflicto = Carpeta.query.filter(
        Carpeta.user_id == user.id,
        Carpeta.parent_id == carpeta.parent_id,
        Carpeta.nombre == nuevo_nombre,
        Carpeta.id != id_carpeta
    )
    conflicto = query_conflicto.first()

    if conflicto:
        return jsonify({"msg": f"Ya existe una carpeta con el nombre '{nuevo_nombre}' en este nivel."}), 409

    carpeta.nombre = nuevo_nombre
    db.session.commit()

    return jsonify({
        "msg": "Carpeta actualizada exitosamente",
        "carpeta": carpeta.to_dict()
    }), 200

@carpetas_bp.route('/<int:id_carpeta>', methods=['DELETE'])
@jwt_required()
def borrar_carpeta(id_carpeta):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    carpeta = Carpeta.query.filter_by(id=id_carpeta, user_id=user.id).first()
    if not carpeta:
        return jsonify({"msg": "Carpeta no encontrada o no pertenece al usuario"}), 404
    db.session.delete(carpeta)
    db.session.commit()
    return jsonify({"msg": "Carpeta eliminada exitosamente"}), 200