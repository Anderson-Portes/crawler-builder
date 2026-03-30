from flask import Blueprint

workflow_results_bp = Blueprint('workflow_results', __name__)

from . import routes
