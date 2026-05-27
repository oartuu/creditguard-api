from flask import Blueprint, jsonify
from app.services.analysis_service import (
    get_kpis,
    get_inadimplencia,
    get_recuperacao,
    get_tendencia,
    get_risco_regional,
)

analysis_bp = Blueprint("analysis", __name__, url_prefix="/analysis")


@analysis_bp.route("/kpis")
def kpis():
    return jsonify(get_kpis())


@analysis_bp.route("/inadimplencia")
def inadimplencia():
    return jsonify(get_inadimplencia())


@analysis_bp.route("/recuperacao")
def recuperacao():
    return jsonify(get_recuperacao())


@analysis_bp.route("/tendencia")
def tendencia():
    return jsonify(get_tendencia())


@analysis_bp.route("/risco-regional")
def risco_regional():
    return jsonify(get_risco_regional())
