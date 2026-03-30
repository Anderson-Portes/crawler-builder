from flask import jsonify, request, send_file
import pandas as pd
from fpdf import FPDF
from io import BytesIO
from datetime import datetime, timedelta
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from . import workflows_bp
from .models import Workflow
from app.modules.workflow_results.models import WorkflowResult
from app.modules.nodes.models import Node
from app.modules.edges.models import Edge
from .schemas import serialize_workflow
from .engine import ScrapingEngine

@workflows_bp.route('/', methods=['GET'])
@jwt_required()
def get_workflows():
    current_user_id = get_jwt_identity()
    workflows = Workflow.query.filter_by(user_id=current_user_id).all()
    return jsonify([serialize_workflow(w) for w in workflows]), 200

@workflows_bp.route('/<int:workflow_id>', methods=['GET'])
@jwt_required()
def get_workflow(workflow_id):
    current_user_id = get_jwt_identity()
    workflow = Workflow.query.filter_by(id=workflow_id, user_id=current_user_id).first_or_404()
    return jsonify(serialize_workflow(workflow)), 200
    
@workflows_bp.route('/', methods=['POST'])
@jwt_required()
def create_workflow():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"error": "Nome do workflow é obrigatório"}), 400
    new_workflow = Workflow(
        name=data['name'],
        description=data.get('description', ''),
        user_id=current_user_id
    )
    db.session.add(new_workflow)
    db.session.commit()
    
    # Salvar nodes iniciais se existirem
    nodes_data = data.get('nodes_data', {})
    if nodes_data:
        for n in nodes_data.get('nodes', []):
            new_node = Node(
                workflow_id=new_workflow.id,
                frontend_id=n['id'],
                type=n['type'],
                position_x=n['position']['x'],
                position_y=n['position']['y'],
                data=n.get('data', {})
            )
            db.session.add(new_node)
        for e in nodes_data.get('edges', []):
            new_edge = Edge(
                workflow_id=new_workflow.id,
                frontend_id=e['id'],
                source=e['source'],
                target=e['target']
            )
            db.session.add(new_edge)
        db.session.commit()
        
    return jsonify(serialize_workflow(new_workflow)), 201

@workflows_bp.route('/<int:workflow_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_workflow(workflow_id):
    current_user_id = get_jwt_identity()
    workflow = Workflow.query.filter_by(id=workflow_id, user_id=current_user_id).first_or_404()
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON payload is required"}), 400
    if 'name' in data:
        workflow.name = data['name']
    if 'description' in data:
        workflow.description = data['description']
    if 'nodes_data' in data:
        # Sincronização estruturada de Nodes e Edges
        # 1. Limpar atuais (estratégia simples de overwrite no save)
        Node.query.filter_by(workflow_id=workflow.id).delete()
        Edge.query.filter_by(workflow_id=workflow.id).delete()
        
        # 2. Inserir novos
        nodes_data = data['nodes_data']
        for n in nodes_data.get('nodes', []):
            pos = n.get('position', {'x': 0, 'y': 0})
            new_node = Node(
                workflow_id=workflow.id,
                frontend_id=n['id'],
                type=n['type'],
                position_x=pos.get('x', 0),
                position_y=pos.get('y', 0),
                data=n.get('data', {})
            )
            db.session.add(new_node)
            
        for e in nodes_data.get('edges', []):
            new_edge = Edge(
                workflow_id=workflow.id,
                frontend_id=e['id'],
                source=e['source'],
                target=e['target']
            )
            db.session.add(new_edge)
    
    if 'is_scheduled' in data:
        workflow.is_scheduled = data['is_scheduled']
        if workflow.is_scheduled and workflow.schedule_interval and not workflow.next_run:
            workflow.next_run = datetime.now() + timedelta(minutes=workflow.schedule_interval)
    if 'schedule_interval' in data:
        workflow.schedule_interval = data['schedule_interval']
        if workflow.is_scheduled:
            workflow.next_run = datetime.now() + timedelta(minutes=workflow.schedule_interval)
    db.session.commit()
    return jsonify(serialize_workflow(workflow)), 200

@workflows_bp.route('/<int:workflow_id>', methods=['DELETE'])
@jwt_required()
def delete_workflow(workflow_id):
    current_user_id = get_jwt_identity()
    workflow = Workflow.query.filter_by(id=workflow_id, user_id=current_user_id).first_or_404()
    db.session.delete(workflow)
    db.session.commit()
    return jsonify({"message": f"Workflow {workflow_id} deletado com sucesso"}), 200

@workflows_bp.route('/<int:workflow_id>/run', methods=['POST'])
@jwt_required()
def run_workflow(workflow_id):
    current_user_id = get_jwt_identity()
    workflow = Workflow.query.filter_by(id=workflow_id, user_id=current_user_id).first_or_404()
    
    # Reconstruímos o nodes_data a partir das tabelas para o Engine
    flow_data = serialize_workflow(workflow)['nodes_data']
    
    engine = ScrapingEngine(flow_data or {})
    res = engine.run()
    new_result = WorkflowResult(
        workflow_id=workflow.id,
        data=res.get('results', []),
        status=res.get('status', 'success'),
        error_message=res.get('message')
    )
    db.session.add(new_result)
    db.session.commit()
    return jsonify({
        "status": new_result.status,
        "id": new_result.id,
        "data": new_result.data,
        "error": new_result.error_message
    }), 200

@workflows_bp.route('/<int:workflow_id>/results', methods=['GET'])
@jwt_required()
def get_workflow_results(workflow_id):
    current_user_id = get_jwt_identity()
    workflow = Workflow.query.filter_by(id=workflow_id, user_id=current_user_id).first_or_404()
    results = WorkflowResult.query.filter_by(workflow_id=workflow.id).order_by(WorkflowResult.created_at.desc()).all()
    return jsonify([{
        "id": r.id,
        "status": r.status,
        "error_message": r.error_message,
        "data": r.data,
        "created_at": r.created_at.isoformat()
    } for r in results]), 200

@workflows_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user_id = get_jwt_identity()
    total_workflows = Workflow.query.filter_by(user_id=current_user_id).count()
    runs_stats = db.session.query(
        WorkflowResult.status, 
        func.count(WorkflowResult.id)
    ).join(Workflow).filter(Workflow.user_id == current_user_id).group_by(WorkflowResult.status).all()
    total_runs = sum(s[1] for s in runs_stats)
    success_count = next((s[1] for s in runs_stats if s[0] == 'success'), 0)
    failure_count = next((s[1] for s in runs_stats if s[0] == 'failed'), 0)
    seven_days_ago = datetime.now() - timedelta(days=6)
    daily_stats = db.session.query(
        func.date(WorkflowResult.created_at).label('date'),
        func.count(WorkflowResult.id).label('total'),
        func.count(func.nullif(WorkflowResult.status != 'success', True)).label('success'),
        func.count(func.nullif(WorkflowResult.status != 'failed', True)).label('failure')
    ).join(Workflow).filter(
        Workflow.user_id == current_user_id,
        WorkflowResult.created_at >= seven_days_ago
    ).group_by(func.date(WorkflowResult.created_at)).order_by(func.date(WorkflowResult.created_at)).all()
    days_data = []
    for i in range(7):
        d = (seven_days_ago + timedelta(days=i)).date()
        stat = next((s for s in daily_stats if s.date == d), None)
        days_data.append({
            "date": d.strftime('%d/%m'),
            "total": stat.total if stat else 0,
            "success": stat.success if stat else 0,
            "failure": stat.failure if stat else 0
        })
    top_workflows = db.session.query(
        Workflow.name,
        func.count(WorkflowResult.id).label('runs')
    ).join(WorkflowResult).filter(Workflow.user_id == current_user_id).group_by(Workflow.id).order_by(func.count(WorkflowResult.id).desc()).limit(5).all()
    return jsonify({
        "total_workflows": total_workflows,
        "total_runs": total_runs,
        "success_rate": round((success_count / total_runs * 100), 1) if total_runs > 0 else 0,
        "status_data": [
            {"name": "Sucesso", "value": success_count, "color": "#10b981"},
            {"name": "Falhas", "value": failure_count, "color": "#ef4444"}
        ],
        "daily_data": days_data,
        "top_workflows": [{"name": w.name, "runs": w.runs} for w in top_workflows]
    }), 200

@workflows_bp.route('/<int:workflow_id>/results', methods=['DELETE'])
@jwt_required()
def clear_history(workflow_id):
    current_user_id = get_jwt_identity()
    workflow = Workflow.query.filter_by(id=workflow_id, user_id=current_user_id).first_or_404()
    WorkflowResult.query.filter_by(workflow_id=workflow.id).delete()
    db.session.commit()
    return jsonify({"message": f"History cleared for workflow {workflow_id}"}), 200