from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    CORS(app)

    from app.routes.analysis import analysis_bp
    app.register_blueprint(analysis_bp)
    from app.routes.prepare import prepare_bp

    app.register_blueprint(prepare_bp)
    return app