from .models import Node

def serialize_node(node: Node):
    return {
        "id": node.id,
        "type": node.type,
        "name": node.name,
        "configuration": node.configuration,
    }
