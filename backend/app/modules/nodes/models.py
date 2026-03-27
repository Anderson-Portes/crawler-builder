from app.extensions import db


class Node(db.Model):
    __tablename__ = "nodes"

    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.Integer, db.ForeignKey("workflows.id"), nullable=False)

    frontend_id = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    position_x = db.Column(db.Float, default=0.0)
    position_y = db.Column(db.Float, default=0.0)
    data = db.Column(db.JSON, nullable=True)

    workflow = db.relationship(
        "Workflow", backref=db.backref("nodes", lazy=True, cascade="all, delete-orphan")
    )

    def __repr__(self):
        return f"<Node {self.frontend_id} ({self.type})>"
