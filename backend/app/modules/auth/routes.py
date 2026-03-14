from flask import jsonify, request
from flask_jwt_extended import create_access_token
from app.extensions import db
from . import auth_bp
from .models import User
from .schemas import serialize_user
import datetime

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email e senha são obrigatórios"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Usuário já existe"}), 400
    new_user = User(email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(serialize_user(new_user)), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email e senha são obrigatórios"}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Credenciais inválidas"}), 401
    access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1))
    return jsonify({
        "access_token": access_token,
        "user": serialize_user(user)
    }), 200
