import os
import datetime
from sqlalchemy import text
from flask import Flask, jsonify
from flask_cors import CORS
from app.extensions import db, jwt
from app.modules.auth import auth_bp
from app.modules.workflows import workflows_bp
from app.modules.nodes import nodes_bp
from app.modules.auth.models import User
from app.modules.workflows.models import Workflow, WorkflowResult
from app.modules.nodes.models import Node
from app.modules.edges.models import Edge

def health_check():
    try:
        db.session.execute(text('SELECT 1'))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return jsonify({"status": "ok", "database": db_status}), 200
    
def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 
        'postgresql://crawler_user:crawler_password@localhost:5432/crawler_db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-123')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
    db.init_app(app)
    jwt.init_app(app)
    app.add_url_rule('/api/health', view_func=health_check, methods=['GET'])
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(workflows_bp, url_prefix='/api/workflows')
    app.register_blueprint(nodes_bp, url_prefix='/api/nodes')
    with app.app_context():
        db.create_all()
    return app