from .extensions import db
from flask import url_for

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    password_hash = db.Column(db.String(128), nullable=False)
    carpetas = db.relationship('Carpeta', backref='owner', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password, bcrypt_instance):
        self.password_hash = bcrypt_instance.generate_password_hash(password).decode('utf-8')

    def check_password(self, password, bcrypt_instance):
        return bcrypt_instance.check_password_hash(self.password_hash, password)

class Carpeta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('carpeta.id'), nullable=True) # Para sectores
    indiciados = db.relationship('Indiciado', backref='carpeta', lazy=True, cascade="all, delete-orphan")
    sub_carpetas = db.relationship('Carpeta', backref=db.backref('parent', remote_side=[id]), lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "owner_id": self.user_id,
            "parent_id": self.parent_id,
            "sub_carpetas": [sub.to_dict() for sub in self.sub_carpetas]
        }

class Indiciado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    cc = db.Column(db.String(20), unique=True, nullable=False)
    alias = db.Column(db.String(100), nullable=True)
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    edad = db.Column(db.Integer, nullable=True)
    hijo_de = db.Column(db.String(200), nullable=True)
    estado_civil = db.Column(db.String(50), nullable=True)
    residencia = db.Column(db.String(200), nullable=True)
    telefono = db.Column(db.String(20), nullable=True)
    estudios_realizados = db.Column(db.String(255), nullable=True)
    profesion = db.Column(db.String(100), nullable=True)
    oficio = db.Column(db.String(100), nullable=True)
    senales_fisicas = db.Column(db.Text, nullable=True)
    banda_delincuencial = db.Column(db.String(150), nullable=True)
    delitos_atribuidos = db.Column(db.Text, nullable=True)
    situacion_juridica = db.Column(db.String(255), nullable=True)
    observaciones = db.Column(db.Text, nullable=True)
    foto_filename = db.Column(db.String(255), nullable=True)
    carpeta_id = db.Column(db.Integer, db.ForeignKey('carpeta.id'), nullable=False)
    sub_sector = db.Column(db.String(100), nullable=True)

    def get_foto_url(self):
        if self.foto_filename:
            return url_for('serve_upload', filename=self.foto_filename, _external=False)
        return None

    def to_dict(self):
        return {
            "id": self.id,
            "nombres": self.nombres,
            "apellidos": self.apellidos,
            "cc": self.cc,
            "alias": self.alias,
            "fecha_nacimiento": self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
            "edad": self.edad,
            "hijo_de": self.hijo_de,
            "estado_civil": self.estado_civil,
            "residencia": self.residencia,
            "telefono": self.telefono,
            "estudios_realizados": self.estudios_realizados,
            "profesion": self.profesion,
            "oficio": self.oficio,
            "senales_fisicas": self.senales_fisicas,
            "banda_delincuencial": self.banda_delincuencial,
            "delitos_atribuidos": self.delitos_atribuidos,
            "situacion_juridica": self.situacion_juridica,
            "observaciones": self.observaciones,
            "foto_url": self.get_foto_url(),
            "carpeta_id": self.carpeta_id,
            "sub_sector": self.sub_sector
        }