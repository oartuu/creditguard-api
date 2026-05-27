from flask import Blueprint, jsonify
from app.services.prepare_service import prepare_dataset

prepare_bp = Blueprint("prepare", __name__)

@prepare_bp.route("/prepare-data")
def prepare_data():
    result = prepare_dataset()

    return jsonify(result)