from flask import Blueprint, jsonify
from app.services.analysis_service import (
    get_kpis,
    get_inadimplencia,
    get_recuperacao,
    get_tendencia,
    get_risco_regional,
    get_estatisticas,
    get_distribuicao_atrasos,
    get_comportamento_pagamentos,
    get_distribuicao_regional,
    get_status_cobrancas,
    get_taxa_inadimplencia,
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


@analysis_bp.route("/estatisticas")
def estatisticas():
    return jsonify(get_estatisticas())


@analysis_bp.route("/distribuicao-atrasos")
def distribuicao_atrasos():
    return jsonify(get_distribuicao_atrasos())


@analysis_bp.route("/comportamento-pagamentos")
def comportamento_pagamentos():
    return jsonify(get_comportamento_pagamentos())


@analysis_bp.route("/distribuicao-regional")
def distribuicao_regional():
    return jsonify(get_distribuicao_regional())


@analysis_bp.route("/status-cobrancas")
def status_cobrancas():
    return jsonify(get_status_cobrancas())


@analysis_bp.route("/taxa-inadimplencia")
def taxa_inadimplencia():
    return jsonify(get_taxa_inadimplencia())
