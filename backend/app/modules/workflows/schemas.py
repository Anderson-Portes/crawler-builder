from .models import Workflow

def serialize_workflow(workflow: Workflow):
    return {
        "id": workflow.id,
        "name": workflow.name,
        "description": workflow.description,
        "nodes_data": workflow.nodes_data,
        "user_id": workflow.user_id,
        "is_scheduled": workflow.is_scheduled or False,
        "schedule_interval": workflow.schedule_interval,
        "last_run": workflow.last_run.isoformat() if workflow.last_run else None,
        "next_run": workflow.next_run.isoformat() if workflow.next_run else None,
        "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
        "updated_at": workflow.updated_at.isoformat() if workflow.updated_at else None,
    }
