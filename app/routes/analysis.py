from flask import Blueprint, jsonify
from app.services.data_service import load_data

analysis_bp = Blueprint("analysis", __name__)

@analysis_bp.route("/analysis")
def analysis():
    data = load_data()

    return jsonify(data)