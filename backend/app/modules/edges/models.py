from app.extensions import db


class Edge(db.Model):
    __tablename__ = "edges"
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.Integer, db.ForeignKey("workflows.id"), nullable=False)

    frontend_id = db.Column(db.String(100), nullable=False)
    source = db.Column(db.String(100), nullable=False)
    target = db.Column(db.String(100), nullable=False)

    workflow = db.relationship(
        "Workflow", backref=db.backref("edges", lazy=True, cascade="all, delete-orphan")
    )

    def __repr__(self):
        return f"<Edge {self.source} -> {self.target}>"
