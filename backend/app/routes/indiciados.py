import os
import uuid
from datetime import datetime
from flask import request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename
from sqlalchemy import or_
from ..models import User, Carpeta, Indiciado
from ..extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

indiciados_bp = Blueprint('indiciados', __name__)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _get_indiciado_if_owner(id_indiciado, user_id):
    return db.session.query(Indiciado).join(Carpeta).filter(
        Indiciado.id == id_indiciado,
        Carpeta.user_id == user_id
    ).first()

@indiciados_bp.route('', methods=['POST'])
@jwt_required()
def agregar_indiciado():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()

    required_fields = ['cc', 'nombres', 'apellidos', 'carpeta_id']
    for field in required_fields:
        if field not in request.form:
            return jsonify({"msg": f"Falta el campo requerido: {field}"}), 400

    if Indiciado.query.filter_by(cc=request.form['cc']).first():
        return jsonify({"msg": "Un indiciado con esa Cédula de Ciudadanía ya existe"}), 409

    carpeta = Carpeta.query.filter_by(id=request.form['carpeta_id'], user_id=user.id).first()
    if not carpeta:
        return jsonify({"msg": "La carpeta no existe o no tienes permiso sobre ella"}), 404

    foto_filename = None
    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = str(uuid.uuid4()) + "_" + filename
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename))
            foto_filename = unique_filename

    try:
        nuevo_indiciado = Indiciado(
            nombres=request.form['nombres'],
            apellidos=request.form['apellidos'],
            cc=request.form['cc'],
            alias=request.form.get('alias'),
            fecha_nacimiento=datetime.strptime(request.form['fecha_nacimiento'], '%Y-%m-%d').date() if request.form.get('fecha_nacimiento') else None,
            edad=request.form.get('edad', type=int),
            hijo_de=request.form.get('hijo_de'),
            estado_civil=request.form.get('estado_civil'),
            residencia=request.form.get('residencia'),
            telefono=request.form.get('telefono'),
            estudios_realizados=request.form.get('estudios_realizados'),
            profesion=request.form.get('profesion'),
            oficio=request.form.get('oficio'),
            senales_fisicas=request.form.get('senales_fisicas'),
            banda_delincuencial=request.form.get('banda_delincuencial'),
            delitos_atribuidos=request.form.get('delitos_atribuidos'),
            situacion_juridica=request.form.get('situacion_juridica'),
            observaciones=request.form.get('observaciones'),
            foto_filename=foto_filename,
            carpeta_id=carpeta.id,
            sub_sector=request.form.get('sub_sector'),
            google_earth_link=request.form.get('google_earth_link')
        )
        db.session.add(nuevo_indiciado)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al procesar los datos.", "error": str(e)}), 400

    return jsonify({
        "msg": "Indiciado agregado exitosamente",
        "indiciado": nuevo_indiciado.to_dict()
    }), 201

@indiciados_bp.route('/<int:id_indiciado>', methods=['PUT'])
@jwt_required()
def actualizar_indiciado(id_indiciado):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    indiciado = _get_indiciado_if_owner(id_indiciado, user.id)
    if not indiciado:
        return jsonify({"msg": "Indiciado no encontrado o no tienes permiso"}), 404

    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename != '' and allowed_file(file.filename):
            if indiciado.foto_filename:
                old_photo_path = os.path.join(current_app.config['UPLOAD_FOLDER'], indiciado.foto_filename)
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)
            filename = secure_filename(file.filename)
            unique_filename = str(uuid.uuid4()) + "_" + filename
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename))
            indiciado.foto_filename = unique_filename

    indiciado.nombres = request.form.get('nombres', indiciado.nombres)
    indiciado.apellidos = request.form.get('apellidos', indiciado.apellidos)
    indiciado.cc = request.form.get('cc', indiciado.cc)
    indiciado.alias = request.form.get('alias', indiciado.alias)
    if request.form.get('fecha_nacimiento'):
        indiciado.fecha_nacimiento = datetime.strptime(request.form['fecha_nacimiento'], '%Y-%m-%d').date()
    indiciado.edad = request.form.get('edad', indiciado.edad, type=int)
    indiciado.hijo_de = request.form.get('hijo_de', indiciado.hijo_de)
    indiciado.estado_civil = request.form.get('estado_civil', indiciado.estado_civil)
    indiciado.residencia = request.form.get('residencia', indiciado.residencia)
    indiciado.telefono = request.form.get('telefono', indiciado.telefono)
    indiciado.estudios_realizados = request.form.get('estudios_realizados', indiciado.estudios_realizados)
    indiciado.profesion = request.form.get('profesion', indiciado.profesion)
    indiciado.oficio = request.form.get('oficio', indiciado.oficio)
    indiciado.senales_fisicas = request.form.get('senales_fisicas', indiciado.senales_fisicas)
    indiciado.banda_delincuencial = request.form.get('banda_delincuencial', indiciado.banda_delincuencial)
    indiciado.delitos_atribuidos = request.form.get('delitos_atribuidos', indiciado.delitos_atribuidos)
    indiciado.situacion_juridica = request.form.get('situacion_juridica', indiciado.situacion_juridica)
    indiciado.observaciones = request.form.get('observaciones', indiciado.observaciones)
    indiciado.sub_sector = request.form.get('sub_sector', indiciado.sub_sector)
    indiciado.google_earth_link = request.form.get('google_earth_link', indiciado.google_earth_link)
    db.session.commit()
    return jsonify({
        "msg": "Indiciado actualizado exitosamente",
        "indiciado": indiciado.to_dict()
    }), 200

@indiciados_bp.route('/<int:id_indiciado>', methods=['DELETE'])
@jwt_required()
def borrar_indiciado(id_indiciado):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    indiciado = _get_indiciado_if_owner(id_indiciado, user.id)
    if not indiciado:
        return jsonify({"msg": "Indiciado no encontrado o no tienes permiso"}), 404
    if indiciado.foto_filename:
        photo_path = os.path.join(current_app.config['UPLOAD_FOLDER'], indiciado.foto_filename)
        if os.path.exists(photo_path):
            os.remove(photo_path)
    db.session.delete(indiciado)
    db.session.commit()
    return jsonify({"msg": "Indiciado eliminado exitosamente"}), 200

@indiciados_bp.route('/search', methods=['GET'])
@jwt_required()
def search_indiciados():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    
    query_term = request.args.get('q', '').strip()

    if not query_term:
        return jsonify([])

    search_pattern = f"%{query_term}%"

    search_results = db.session.query(Indiciado).join(Carpeta).filter(
        Carpeta.user_id == user.id,
        or_(
            Indiciado.nombres.ilike(search_pattern),
            Indiciado.apellidos.ilike(search_pattern),
            Indiciado.alias.ilike(search_pattern),
            Indiciado.cc.ilike(search_pattern)
        )
    ).all()

    return jsonify([indiciado.to_dict() for indiciado in search_results]), 200