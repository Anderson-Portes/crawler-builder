from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from . import nodes_bp
from .models import Node
from .schemas import serialize_node

@nodes_bp.route('/', methods=['GET'])
@jwt_required()
def get_nodes():
    nodes = Node.query.all()
    return jsonify([serialize_node(n) for n in nodes]), 200

@nodes_bp.route('/', methods=['POST'])
@jwt_required()
def create_node():
    data = request.get_json()
    if not data or not data.get('type') or not data.get('name'):
        return jsonify({"error": "Tipo (type) e Nome (name) são obrigatórios"}), 400
    new_node = Node(
        type=data['type'],
        name=data['name'],
        configuration=data.get('configuration', {})
    )
    db.session.add(new_node)
    db.session.commit()
    return jsonify(serialize_node(new_node)), 201
