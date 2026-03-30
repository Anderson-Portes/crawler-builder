from app.extensions import db
from datetime import datetime

class WorkflowResult(db.Model):
    __tablename__ = 'workflow_results'
    
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.Integer, db.ForeignKey('workflows.id'), nullable=False)
    data = db.Column(db.JSON, nullable=True)
    status = db.Column(db.String(50), default='success')
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    workflow = db.relationship('Workflow', backref=db.backref('results', lazy=True, cascade="all, delete-orphan"))
    
    def __repr__(self):
        return f"<WorkflowResult {self.id}>"
