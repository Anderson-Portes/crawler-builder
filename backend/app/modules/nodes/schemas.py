from .models import Node


def serialize_node(node: Node):
    return {
        "id": node.frontend_id,
        "type": node.type,
        "position": {"x": node.position_x, "y": node.position_y},
        "data": node.data,
    }
