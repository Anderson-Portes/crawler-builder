from app import create_app
from celery import Celery, Task
import os

app = create_app()

class FlaskTask(Task):
    def __call__(self, *args, **kwargs):
        with app.app_context():
            return self.run(*args, **kwargs)

broker_url = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')
result_backend = os.environ.get('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')

celery_app = Celery(
    app.name, 
    task_cls=FlaskTask,
    broker=broker_url,
    backend=result_backend,
    include=['app.tasks']
)

celery_app.conf.update(
    timezone='America/Sao_Paulo',
    enable_utc=False,
    beat_schedule={
        'check-schedules-every-minute': {
            'task': 'app.tasks.check_schedules',
            'schedule': 60.0,
        },
    }
)
