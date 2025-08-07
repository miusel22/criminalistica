import os
import uuid
from flask import request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename
from ..models import User, Indiciado, Documento
from ..extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

documentos_bp = Blueprint('documentos', __name__)
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@documentos_bp.route('/indiciado/<int:id_indiciado>', methods=['POST'])
@jwt_required()
def subir_documentos(id_indiciado):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    
    indiciado = db.session.query(Indiciado).join(Indiciado.carpeta).filter(
        Indiciado.id == id_indiciado,
        User.id == user.id
    ).first()

    if not indiciado:
        return jsonify({"msg": "Indiciado no encontrado o no tienes permiso"}), 404

    if 'documentos' not in request.files:
        return jsonify({"msg": "No se encontraron archivos en la solicitud"}), 400

    files = request.files.getlist('documentos')
    uploaded_docs = []

    for file in files:
        if file and file.filename and allowed_file(file.filename):
            original_filename = secure_filename(file.filename)
            unique_filename = str(uuid.uuid4()) + "_" + original_filename
            
            doc_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'documentos')
            if not os.path.exists(doc_path):
                os.makedirs(doc_path)
            
            file.save(os.path.join(doc_path, unique_filename))
            
            nuevo_documento = Documento(
                filename=unique_filename,
                original_filename=original_filename,
                indiciado_id=indiciado.id
            )
            db.session.add(nuevo_documento)
            uploaded_docs.append(nuevo_documento)
    
    db.session.commit()
    return jsonify({
        "msg": "Documentos subidos exitosamente",
        "documentos": [doc.to_dict() for doc in uploaded_docs]
    }), 201


@documentos_bp.route('/<int:id_documento>', methods=['DELETE'])
@jwt_required()
def borrar_documento(id_documento):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    
    documento = db.session.query(Documento).join(Documento.indiciado).join(Indiciado.carpeta).filter(
        Documento.id == id_documento,
        User.id == user.id
    ).first()

    if not documento:
        return jsonify({"msg": "Documento no encontrado o no tienes permiso"}), 404

    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'documentos', documento.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error al eliminar el archivo físico: {e}")

    db.session.delete(documento)
    db.session.commit()
    return jsonify({"msg": "Documento eliminado exitosamente"}), 200