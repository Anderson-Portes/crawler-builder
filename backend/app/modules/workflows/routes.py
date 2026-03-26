from flask import jsonify, request, send_file
import pandas as pd
from fpdf import FPDF
from io import BytesIO
from datetime import datetime, timedelta
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from . import workflows_bp
from .models import Workflow, WorkflowResult
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
        nodes_data=data.get('nodes_data', {}),
        user_id=current_user_id
    )
    db.session.add(new_workflow)
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
        workflow.nodes_data = data['nodes_data']
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
    engine = ScrapingEngine(workflow.nodes_data or {})
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
    
@workflows_bp.route('/results/<int:result_id>/export', methods=['GET'])
@jwt_required()
def export_result(result_id):
    current_user_id = get_jwt_identity()
    res = WorkflowResult.query.join(Workflow).filter(
        WorkflowResult.id == result_id, 
        Workflow.user_id == current_user_id
    ).first_or_404()
    fmt = request.args.get('format', 'json').lower()
    data = res.data
    extracted_data = None
    node_filename = "resultado"
    for item in data:
        if item.get('data'):
            extracted_data = item['data']
            node_filename = item.get('filename', 'resultado')
            break
    if not extracted_data:
        return jsonify({"error": "Nenhum dado para exportar"}), 400
    filename = f"{node_filename}_{result_id}"
    try:
        if fmt in ['csv', 'xlsx']:
            is_multilayer = len(extracted_data) > 0 and isinstance(extracted_data[0], list)
            if is_multilayer:
                df = pd.DataFrame(extracted_data[1:], columns=extracted_data[0])
            else:
                df = pd.DataFrame(extracted_data, columns=['conteudo'])
            output = BytesIO()
            if fmt == 'csv':
                df.to_csv(output, index=False, encoding='utf-8-sig')
                mimetype = 'text/csv'
                ext = 'csv'
            else:
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False)
                mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ext = 'xlsx'
            output.seek(0)
            return send_file(output, mimetype=mimetype, as_attachment=True, download_name=f"{filename}.{ext}")
        elif fmt == 'pdf':
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("helvetica", size=12)
            pdf.cell(0, 10, text="Resultado da Extracão", ln=1, align='C')
            pdf.ln(5)
            for val in extracted_data:
                pdf.multi_cell(0, 10, text=str(val))
            pdf_bytes = pdf.output()
            output = BytesIO(pdf_bytes)
            return send_file(output, mimetype='application/pdf', as_attachment=True, download_name=f"{filename}.pdf")
    except Exception as e:
        return jsonify({"error": f"Erro ao gerar arquivo: {str(e)}"}), 500
    return jsonify(extracted_data), 200

@workflows_bp.route('/results/<int:result_id>', methods=['DELETE'])
@jwt_required()
def delete_result(result_id):
    current_user_id = get_jwt_identity()
    res = WorkflowResult.query.join(Workflow).filter(
        WorkflowResult.id == result_id, 
        Workflow.user_id == current_user_id
    ).first_or_404()
    db.session.delete(res)
    db.session.commit()
    return jsonify({"message": f"Execution {result_id} deleted successfully"}), 200

@workflows_bp.route('/<int:workflow_id>/results', methods=['DELETE'])
@jwt_required()
def clear_history(workflow_id):
    current_user_id = get_jwt_identity()
    workflow = Workflow.query.filter_by(id=workflow_id, user_id=current_user_id).first_or_404()
    WorkflowResult.query.filter_by(workflow_id=workflow.id).delete()
    db.session.commit()
    return jsonify({"message": f"History cleared for workflow {workflow_id}"}), 200