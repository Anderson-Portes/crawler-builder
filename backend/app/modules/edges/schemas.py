from .models import Edge

def serialize_edge(edge: Edge):
    return {
        "id": edge.frontend_id,
        "source": edge.source,
        "target": edge.target,
    }
