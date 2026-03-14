from flask import Blueprint

nodes_bp = Blueprint('nodes', __name__)

from . import routes
