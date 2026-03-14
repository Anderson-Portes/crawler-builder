from app.extensions import db

class Node(db.Model):
    __tablename__ = 'nodes'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    configuration = db.Column(db.JSON, nullable=True)
    def __repr__(self):
        return f"<Node {self.name} ({self.type})>"
