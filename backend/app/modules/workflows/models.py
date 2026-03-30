from app.extensions import db
from datetime import datetime

class Workflow(db.Model):
    __tablename__ = 'workflows'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    nodes_data = db.Column(db.JSON, nullable=True) # Legado: Substituído pelas tabelas Node e Edge

    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    is_scheduled = db.Column(db.Boolean, default=False)
    schedule_interval = db.Column(db.Integer, nullable=True) # minutes
    last_run = db.Column(db.DateTime, nullable=True)
    next_run = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    def __repr__(self):
        return f"<Workflow {self.name}>"
