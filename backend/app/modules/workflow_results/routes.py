from flask import jsonify, request, send_file
import pandas as pd
from fpdf import FPDF
from io import BytesIO
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from . import workflow_results_bp
from .models import WorkflowResult
from app.modules.workflows.models import Workflow

@workflow_results_bp.route('/<int:result_id>', methods=['DELETE'])
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

@workflow_results_bp.route('/<int:result_id>/export', methods=['GET'])
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
            pdf.cell(0, 10, text="Resultado da Extracao", ln=1, align='C')
            pdf.ln(5)
            for val in extracted_data:
                pdf.multi_cell(0, 10, text=str(val))
            pdf_bytes = pdf.output()
            output = BytesIO(pdf_bytes)
            return send_file(output, mimetype='application/pdf', as_attachment=True, download_name=f"{filename}.pdf")
            
    except Exception as e:
        return jsonify({"error": f"Erro ao gerar arquivo: {str(e)}"}), 500
        
    return jsonify(extracted_data), 200
