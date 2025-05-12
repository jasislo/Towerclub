from flask import Blueprint

index_bp = Blueprint('index', __name__)

@index_bp.route('/')
def home():
    return "Welcome to Tower Club App!"

@index_bp.route('/about')
def about():
    return "About Tower Club App"