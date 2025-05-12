from flask import Flask
from routes.index import main as routes_main
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register routes
    app.register_blueprint(routes_main)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)