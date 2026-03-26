from app.extensions import db
from app.modules.workflows.models import Workflow, WorkflowResult
from app.modules.workflows.engine import ScrapingEngine
from datetime import datetime, timedelta
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task
def run_scheduled_workflow(workflow_id):
    logger.info(f"Starting scheduled execution for workflow {workflow_id}")
    workflow = Workflow.query.get(workflow_id)
    if not workflow:
        logger.error(f"Workflow {workflow_id} not found.")
        return f"Workflow {workflow_id} not found."
    
    try:
        engine = ScrapingEngine(workflow.nodes_data or {})
        res = engine.run()
        new_result = WorkflowResult(
            workflow_id=workflow.id,
            data=res.get('results', []),
            status=res.get('status', 'success'),
            error_message=res.get('message')
        )
        db.session.add(new_result)
        logger.info(f"Execution completed for workflow {workflow_id} with status {new_result.status}")
    except Exception as e:
        logger.error(f"Execution failed for workflow {workflow_id}: {str(e)}")
        new_result = WorkflowResult(
            workflow_id=workflow.id,
            data=[],
            status='failed',
            error_message=str(e)
        )
        db.session.add(new_result)

    workflow.last_run = datetime.now()
    
    if workflow.is_scheduled and workflow.schedule_interval:
        workflow.next_run = datetime.now() + timedelta(minutes=workflow.schedule_interval)
    else:
        workflow.next_run = None
    
    db.session.commit()
    return f"Workflow {workflow_id} executed."

@shared_task
def check_schedules():
    # Use timezone local time + 15 seconds de tolerância
    # Se o celery beat bater aos 09:59:52, ele deve engatilhar tarefas das 10:00:00
    now_with_slack = datetime.now() + timedelta(seconds=15)
    
    # Find all scheduled workflows that are due and trigger them
    due_workflows = Workflow.query.filter(
        Workflow.is_scheduled == True,
        Workflow.next_run <= now_with_slack
    ).all()
    
    for w in due_workflows:
        run_scheduled_workflow.delay(w.id)
    
    if due_workflows:
        logger.info(f"Triggered {len(due_workflows)} workflows.")
    
    return f"Triggered {len(due_workflows)} workflows."
