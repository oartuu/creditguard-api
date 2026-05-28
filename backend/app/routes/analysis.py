from flask import Blueprint, jsonify
from app.services.analysis_service import (
    get_kpis,
    get_inadimplencia,
    get_recuperacao,
    get_tendencia,
    get_risco_regional,
    get_risco_regional_estrategico,
    get_tendencia_temporal,
    get_padroes_insights,
    get_estatisticas,
    get_distribuicao_atrasos,
    get_comportamento_pagamentos,
    get_distribuicao_regional,
    get_status_cobrancas,
    get_taxa_inadimplencia,
    get_taxa_recuperacao,
    get_atraso_medio,
    get_visao_diretoria,
    get_visao_financeira,
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


@analysis_bp.route("/taxa-recuperacao")
def taxa_recuperacao():
    return jsonify(get_taxa_recuperacao())


@analysis_bp.route("/atraso-medio")
def atraso_medio():
    return jsonify(get_atraso_medio())


@analysis_bp.route("/risco-regional-estrategico")
def risco_regional_estrategico():
    return jsonify(get_risco_regional_estrategico())


@analysis_bp.route("/tendencia-temporal")
def tendencia_temporal():
    return jsonify(get_tendencia_temporal())


@analysis_bp.route("/padroes-insights")
def padroes_insights():
    return jsonify(get_padroes_insights())


@analysis_bp.route("/visao-diretoria")
def visao_diretoria():
    return jsonify(get_visao_diretoria())


@analysis_bp.route("/visao-financeira")
def visao_financeira():
    return jsonify(get_visao_financeira())
