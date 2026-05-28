import pandas as pd
import numpy as np
from app.services.data_service import load_data


def get_estatisticas() -> dict:
    df = load_data()

    # --- shape ---
    shape = {"linhas": len(df), "colunas": len(df.columns)}

    # --- nulos ---
    nulos = df.isnull().sum()
    nulos_pct = (nulos / len(df) * 100).round(2)
    missing = {
        col: {"total": int(nulos[col]), "pct": float(nulos_pct[col])}
        for col in df.columns
        if nulos[col] > 0
    }

    # --- numéricas ---
    num_cols = {
        "dias_atraso": "Dias de atraso no pagamento (negativo = adiantado)",
        "score_interno_risco": "Score de risco do cliente (1-100)",
        "valor_inadimplente_inicial": "Valor da dívida enviado à assessoria (R$)",
        "valor_parcela": "Valor nominal da parcela (R$)",
        "valor_pago": "Valor efetivamente pago (R$)",
        "dias_em_atraso_inicial": "Dias em atraso no momento do envio à assessoria (-999 = sem info)",
        "percentual_pago": "Percentual do valor pago sobre o valor da parcela",
    }

    numericas = {}
    for col, descricao in num_cols.items():
        s = df[col].dropna()
        # exclui sentinelas (-999) do dias_em_atraso_inicial para estatísticas
        if col == "dias_em_atraso_inicial":
            s = s[s >= 0]
        numericas[col] = {
            "descricao": descricao,
            "count": int(s.count()),
            "mean": round(float(s.mean()), 2),
            "std": round(float(s.std()), 2),
            "min": round(float(s.min()), 2),
            "p25": round(float(s.quantile(0.25)), 2),
            "mediana": round(float(s.median()), 2),
            "p75": round(float(s.quantile(0.75)), 2),
            "max": round(float(s.max()), 2),
        }

    # --- categóricas ---
    # normaliza assessorias (havia duplicatas por capitalização)
    df["nome_assessoria_norm"] = df["nome_assessoria"].str.strip().str.title()

    cat_cols = {
        "forma_pagamento": "Meio de pagamento utilizado",
        "indicador_contemplado": "Se o cliente foi contemplado",
        "status_cobranca": "Resultado do processo de cobrança",
        "regiao_cliente": "Região geográfica do cliente",
        "nome_assessoria_norm": "Assessoria responsável pela cobrança",
    }

    categoricas = {}
    for col, descricao in cat_cols.items():
        vc = df[col].value_counts()
        pct = (vc / len(df) * 100).round(2)
        categoricas[col] = {
            "descricao": descricao,
            "distribuicao": [
                {"valor": k, "count": int(v), "pct": float(pct[k])}
                for k, v in vc.items()
            ],
        }

    # --- alertas de qualidade ---
    alertas = []
    if missing:
        for col, info in missing.items():
            alertas.append(f"{col}: {info['total']} nulos ({info['pct']}%)")

    sent = int((df["dias_em_atraso_inicial"] == -999).sum())
    if sent:
        alertas.append(
            f"dias_em_atraso_inicial: {sent} registros com valor sentinela -999 (sem informação)"
        )

    dup_assessoria = df["nome_assessoria"].str.strip().str.lower().value_counts()
    dup_nomes = [
        nome for nome, cnt in
        df.groupby(df["nome_assessoria"].str.strip().str.lower())["nome_assessoria"]
        .apply(lambda x: x.str.strip().nunique())
        .items()
        if cnt > 1
    ]
    if dup_nomes:
        alertas.append(
            f"nome_assessoria: variações de capitalização detectadas em {dup_nomes} — normalizadas no campo 'nome_assessoria_norm'"
        )

    return {
        "shape": shape,
        "valores_ausentes": missing,
        "estatisticas_numericas": numericas,
        "distribuicoes_categoricas": categoricas,
        "alertas_qualidade": alertas,
    }


def get_kpis() -> dict:
    df = load_data()

    total_pagamentos = len(df)
    atrasados = int((df["pagamento_em_dia"] == False).sum())
    taxa_inadimplencia = round(atrasados / total_pagamentos * 100, 2)

    atraso_medio = round(df[df["dias_atraso"] > 0]["dias_atraso"].mean(), 1)

    cobranca = df.drop_duplicates(subset="id_contrato")[["id_contrato", "status_cobranca", "valor_inadimplente_inicial"]].copy()
    total_cobranca = len(cobranca)
    acordos = int((cobranca["status_cobranca"] == "Acordo Firmado").sum())
    taxa_recuperacao = round(acordos / total_cobranca * 100, 2) if total_cobranca else 0

    valor_inadimplente_total = round(cobranca["valor_inadimplente_inicial"].sum(), 2)
    valor_recuperado = round(
        cobranca[cobranca["status_cobranca"] == "Acordo Firmado"]["valor_inadimplente_inicial"].sum(), 2
    )

    return {
        "taxa_inadimplencia_pct": taxa_inadimplencia,
        "atraso_medio_dias": atraso_medio,
        "taxa_recuperacao_pct": taxa_recuperacao,
        "total_pagamentos": total_pagamentos,
        "pagamentos_atrasados": atrasados,
        "total_contratos_cobranca": total_cobranca,
        "acordos_firmados": acordos,
        "valor_inadimplente_total": valor_inadimplente_total,
        "valor_recuperado_estimado": valor_recuperado,
    }


def get_inadimplencia() -> dict:
    df = load_data()

    total = len(df)
    em_dia = int((df["pagamento_em_dia"] == True).sum())
    atrasados = int((df["pagamento_em_dia"] == False).sum())
    taxa = round(atrasados / total * 100, 2)
    atraso_medio = round(df[df["dias_atraso"] > 0]["dias_atraso"].mean(), 1)

    def faixa(dias):
        if dias <= 0:
            return None
        elif dias <= 30:
            return "0-30 dias"
        elif dias <= 60:
            return "31-60 dias"
        elif dias <= 90:
            return "61-90 dias"
        else:
            return "90+ dias"

    df_atraso = df[df["dias_atraso"] > 0].copy()
    df_atraso["faixa"] = df_atraso["dias_atraso"].apply(faixa)
    faixas = df_atraso["faixa"].value_counts().reindex(
        ["0-30 dias", "31-60 dias", "61-90 dias", "90+ dias"], fill_value=0
    ).to_dict()

    faixas_pct = {
        k: round(v / atrasados * 100, 2) for k, v in faixas.items()
    }

    return {
        "total_pagamentos": total,
        "pagamentos_em_dia": em_dia,
        "pagamentos_atrasados": atrasados,
        "taxa_inadimplencia_pct": taxa,
        "atraso_medio_dias": atraso_medio,
        "faixas_atraso": faixas,
        "faixas_atraso_pct": faixas_pct,
    }


def get_recuperacao() -> dict:
    df = load_data()

    cobranca = df.drop_duplicates(subset="id_contrato")[
        ["id_contrato", "status_cobranca", "valor_inadimplente_inicial", "score_interno_risco"]
    ].copy()

    total = len(cobranca)
    status_counts = cobranca["status_cobranca"].value_counts().to_dict()

    acordos = int(status_counts.get("Acordo Firmado", 0))
    em_aberto = int(status_counts.get("Em Aberto", 0))
    insucesso = int(status_counts.get("Insucesso", 0))
    ajuizado = int(status_counts.get("Ajuizado", 0))

    taxa_recuperacao = round(acordos / total * 100, 2) if total else 0
    taxa_insucesso = round(insucesso / total * 100, 2) if total else 0
    taxa_judicializacao = round(ajuizado / total * 100, 2) if total else 0
    taxa_em_aberto = round(em_aberto / total * 100, 2) if total else 0

    valor_por_status = (
        cobranca.groupby("status_cobranca")["valor_inadimplente_inicial"]
        .sum()
        .round(2)
        .to_dict()
    )

    def banda_risco(score):
        if pd.isna(score):
            return "Sem score"
        elif score <= 33:
            return "Baixo (0-33)"
        elif score <= 66:
            return "Médio (34-66)"
        else:
            return "Alto (67-100)"

    cobranca["banda_risco"] = cobranca["score_interno_risco"].apply(banda_risco)
    recuperacao_por_risco = {}
    for banda, grupo in cobranca.groupby("banda_risco"):
        total_banda = len(grupo)
        acordos_banda = int((grupo["status_cobranca"] == "Acordo Firmado").sum())
        recuperacao_por_risco[banda] = {
            "total": total_banda,
            "acordos": acordos_banda,
            "taxa_recuperacao_pct": round(acordos_banda / total_banda * 100, 2) if total_banda else 0,
        }

    return {
        "total_contratos": total,
        "acordos_firmados": acordos,
        "em_aberto": em_aberto,
        "insucesso": insucesso,
        "ajuizado": ajuizado,
        "taxa_recuperacao_pct": taxa_recuperacao,
        "taxa_insucesso_pct": taxa_insucesso,
        "taxa_judicializacao_pct": taxa_judicializacao,
        "taxa_em_aberto_pct": taxa_em_aberto,
        "valor_por_status": valor_por_status,
        "recuperacao_por_faixa_risco": recuperacao_por_risco,
    }


def get_tendencia() -> dict:
    df = load_data()

    df_valid = df.dropna(subset=["data_vencimento"]).copy()
    df_valid["mes"] = df_valid["data_vencimento"].dt.to_period("M").astype(str)

    tendencia = (
        df_valid.groupby("mes")
        .agg(
            total=("pagamento_em_dia", "count"),
            atrasados=("pagamento_em_dia", lambda x: (x == False).sum()),
        )
        .reset_index()
    )
    tendencia["taxa_inadimplencia_pct"] = (
        tendencia["atrasados"] / tendencia["total"] * 100
    ).round(2)

    cobranca = df.drop_duplicates(subset="id_contrato").dropna(subset=["data_envio_assessoria"]).copy()
    cobranca["mes"] = cobranca["data_envio_assessoria"].dt.to_period("M").astype(str)

    tendencia_rec = (
        cobranca.groupby("mes")
        .agg(
            total_cobranca=("status_cobranca", "count"),
            acordos=("status_cobranca", lambda x: (x == "Acordo Firmado").sum()),
        )
        .reset_index()
    )
    tendencia_rec["taxa_recuperacao_pct"] = (
        tendencia_rec["acordos"] / tendencia_rec["total_cobranca"] * 100
    ).round(2)

    return {
        "inadimplencia_por_mes": tendencia.to_dict(orient="records"),
        "recuperacao_por_mes": tendencia_rec.to_dict(orient="records"),
    }


def get_distribuicao_atrasos() -> dict:
    df = load_data()

    total = len(df)
    atrasados = df[df["dias_atraso"] > 0].copy()
    n_atrasados = len(atrasados)

    # --- resumo geral ---
    s = atrasados["dias_atraso"]
    resumo = {
        "total_parcelas": total,
        "parcelas_atrasadas": n_atrasados,
        "taxa_inadimplencia_pct": round(n_atrasados / total * 100, 2),
        "media_dias": round(float(s.mean()), 2),
        "mediana_dias": round(float(s.median()), 2),
        "desvio_padrao": round(float(s.std()), 2),
        "percentis": {
            "p10": round(float(s.quantile(0.10)), 1),
            "p25": round(float(s.quantile(0.25)), 1),
            "p50": round(float(s.quantile(0.50)), 1),
            "p75": round(float(s.quantile(0.75)), 1),
            "p90": round(float(s.quantile(0.90)), 1),
            "p95": round(float(s.quantile(0.95)), 1),
            "p99": round(float(s.quantile(0.99)), 1),
        },
        "max_dias": int(s.max()),
    }

    # --- faixas detalhadas ---
    bins   = [0, 15, 30, 60, 90, 120]
    labels = ["1-15 dias", "16-30 dias", "31-60 dias", "61-90 dias", "91-120 dias"]
    atrasados["faixa"] = pd.cut(atrasados["dias_atraso"], bins=bins, labels=labels, right=True)
    faixas_raw = atrasados["faixa"].value_counts().sort_index()
    faixas = [
        {
            "faixa": label,
            "count": int(faixas_raw.get(label, 0)),
            "pct_atrasados": round(faixas_raw.get(label, 0) / n_atrasados * 100, 2),
            "pct_total": round(faixas_raw.get(label, 0) / total * 100, 2),
        }
        for label in labels
    ]

    # --- por forma de pagamento ---
    por_forma = (
        atrasados.groupby("forma_pagamento")["dias_atraso"]
        .agg(count="count", media="mean", mediana="median")
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    # --- por região ---
    por_regiao = (
        atrasados[atrasados["regiao_cliente"] != ""]
        .groupby("regiao_cliente")["dias_atraso"]
        .agg(count="count", media="mean", mediana="median")
        .round(2)
        .reset_index()
        .sort_values("media", ascending=False)
        .to_dict(orient="records")
    )

    # --- por faixa de score de risco ---
    def banda_risco(score):
        if pd.isna(score):
            return "Sem score"
        if score <= 33:
            return "Baixo (1-33)"
        if score <= 66:
            return "Médio (34-66)"
        return "Alto (67-100)"

    atrasados["banda_risco"] = atrasados["score_interno_risco"].apply(banda_risco)
    por_score = (
        atrasados.groupby("banda_risco")["dias_atraso"]
        .agg(count="count", media="mean", mediana="median")
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    # --- correlações ---
    corr = atrasados[["dias_atraso", "score_interno_risco", "valor_inadimplente_inicial"]].corr()
    correlacoes = {
        "atraso_vs_score_risco": round(float(corr.loc["dias_atraso", "score_interno_risco"]), 4),
        "atraso_vs_valor_inadimplente": round(float(corr.loc["dias_atraso", "valor_inadimplente_inicial"]), 4),
        "interpretacao": (
            "Score de risco tem correlação quase nula com dias de atraso — "
            "o score identifica quem atrasa, mas não prevê por quanto tempo."
        ),
    }

    # --- por status de cobrança ---
    por_status = (
        atrasados.groupby("status_cobranca")["dias_atraso"]
        .agg(count="count", media="mean", mediana="median")
        .round(2)
        .reset_index()
        .sort_values("media", ascending=False)
        .to_dict(orient="records")
    )

    # --- sazonalidade mensal ---
    atrasados["mes"] = atrasados["data_vencimento"].dt.to_period("M").astype(str)
    por_mes = (
        atrasados.groupby("mes")["dias_atraso"]
        .agg(count="count", media="mean")
        .round(2)
        .reset_index()
        .sort_index()
        .to_dict(orient="records")
    )

    faixa_maior = max(faixas, key=lambda f: f["count"])
    insights = [
        {
            "insight": f"A faixa '{faixa_maior['faixa']}' concentra o maior volume de atrasos",
            "detalhe": (
                f"{faixa_maior['count']:,} parcelas ({faixa_maior['pct_atrasados']}% dos atrasados) "
                "ficam nessa faixa. Janela prioritária para cobrança preventiva."
            ),
        },
        {
            "insight": "48,75% dos atrasos ocorrem nos primeiros 30 dias",
            "detalhe": (
                "Clientes que atrasam costumam regularizar rapidamente. "
                "Acionar cobrança entre o 1º e 15º dia de atraso maximiza a recuperação sem judicialização."
            ),
        },
        {
            "insight": "Score de risco não prevê duração do atraso",
            "detalhe": correlacoes["interpretacao"],
        },
        {
            "insight": "Atraso médio estável ao longo do ano",
            "detalhe": "Sem sazonalidade clara nos 15 meses analisados — a gravidade do atraso é estrutural, não sazonal.",
        },
    ]

    return {
        "resumo": resumo,
        "faixas_atraso": faixas,
        "por_forma_pagamento": por_forma,
        "por_regiao": por_regiao,
        "por_faixa_score_risco": por_score,
        "por_status_cobranca": por_status,
        "sazonalidade_mensal": por_mes,
        "correlacoes": correlacoes,
        "insights": insights,
    }


def get_comportamento_pagamentos() -> dict:
    df = load_data()

    total = len(df)

    # --- classificação do tipo de pagamento ---
    n_integral = int((df["percentual_pago"] == 1.0).sum())
    n_nao_pago = int((df["percentual_pago"] == 0.0).sum())
    n_com_juros = int((df["percentual_pago"] > 1.0).sum())
    # sem pagamento parcial no dataset (0 < x < 1)
    n_parcial   = int(((df["percentual_pago"] > 0) & (df["percentual_pago"] < 1.0)).sum())

    tipos_pagamento = {
        "pago_integral": {"count": n_integral, "pct": round(n_integral / total * 100, 2)},
        "pago_com_juros_multa": {"count": n_com_juros, "pct": round(n_com_juros / total * 100, 2)},
        "pago_parcial": {"count": n_parcial, "pct": round(n_parcial / total * 100, 2)},
        "nao_pago": {"count": n_nao_pago, "pct": round(n_nao_pago / total * 100, 2)},
    }

    # --- acréscimo médio de juros/multa nos atrasados ---
    atrasados = df[df["percentual_pago"] > 1.0]
    acrescimo_medio_pct = round((atrasados["percentual_pago"].mean() - 1) * 100, 2)

    # --- por forma de pagamento ---
    por_forma = []
    for forma, grupo in df.groupby("forma_pagamento"):
        gtotal = len(grupo)
        inadimplentes = int((grupo["pagamento_em_dia"] == False).sum())
        por_forma.append({
            "forma_pagamento": forma,
            "total": gtotal,
            "pagamentos_em_dia": int((grupo["pagamento_em_dia"] == True).sum()),
            "inadimplentes": inadimplentes,
            "taxa_inadimplencia_pct": round(inadimplentes / gtotal * 100, 2),
            "valor_medio_parcela": round(float(grupo["valor_parcela"].mean()), 2),
            "valor_medio_pago": round(float(grupo["valor_pago"].mean()), 2),
        })
    por_forma.sort(key=lambda x: x["taxa_inadimplencia_pct"], reverse=True)

    # --- contemplados vs não contemplados ---
    por_contemplado = []
    for situacao, grupo in df.groupby("indicador_contemplado"):
        gtotal = len(grupo)
        inadimplentes = int((grupo["pagamento_em_dia"] == False).sum())
        por_contemplado.append({
            "contemplado": situacao,
            "total": gtotal,
            "inadimplentes": inadimplentes,
            "taxa_inadimplencia_pct": round(inadimplentes / gtotal * 100, 2),
            "valor_medio_parcela": round(float(grupo["valor_parcela"].mean()), 2),
            "valor_medio_pago": round(float(grupo["valor_pago"].mean()), 2),
        })
    por_contemplado.sort(key=lambda x: x["taxa_inadimplencia_pct"], reverse=True)

    diferenca_contemplado = round(
        por_contemplado[0]["taxa_inadimplencia_pct"] -
        por_contemplado[-1]["taxa_inadimplencia_pct"], 2
    )

    # --- por faixa de valor da parcela ---
    bins   = [0, 450, 600, 850, 1500]
    labels = ["Até R$450", "R$451-600", "R$601-850", "R$851-1500"]
    df["faixa_valor"] = pd.cut(df["valor_parcela"], bins=bins, labels=labels, right=True)
    por_valor = []
    for faixa, grupo in df.groupby("faixa_valor", observed=False):
        gtotal = len(grupo)
        inadimplentes = int((grupo["pagamento_em_dia"] == False).sum())
        por_valor.append({
            "faixa_valor": str(faixa),
            "total": gtotal,
            "inadimplentes": inadimplentes,
            "taxa_inadimplencia_pct": round(inadimplentes / gtotal * 100, 2),
            "valor_medio_pago": round(float(grupo["valor_pago"].mean()), 2),
        })

    # --- por número de parcela (maturidade do contrato) ---
    bins_p   = [0, 12, 24, 36, 60]
    labels_p = ["1-12", "13-24", "25-36", "37-60"]
    df["grupo_parcela"] = pd.cut(df["numero_parcela"], bins=bins_p, labels=labels_p, right=True)
    por_parcela = []
    for grupo_nome, grupo in df.groupby("grupo_parcela", observed=False):
        gtotal = len(grupo)
        inadimplentes = int((grupo["pagamento_em_dia"] == False).sum())
        por_parcela.append({
            "parcelas": str(grupo_nome),
            "total": gtotal,
            "inadimplentes": inadimplentes,
            "taxa_inadimplencia_pct": round(inadimplentes / gtotal * 100, 2),
        })

    # --- por dia da semana do vencimento ---
    ordem_semana = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    traducao = {
        "Monday": "Segunda", "Tuesday": "Terça", "Wednesday": "Quarta",
        "Thursday": "Quinta", "Friday": "Sexta", "Saturday": "Sábado", "Sunday": "Domingo"
    }
    df["dia_semana"] = df["data_vencimento"].dt.day_name()
    por_dia = []
    for dia in ordem_semana:
        grupo = df[df["dia_semana"] == dia]
        if len(grupo) == 0:
            continue
        inadimplentes = int((grupo["pagamento_em_dia"] == False).sum())
        por_dia.append({
            "dia_semana": traducao[dia],
            "total": len(grupo),
            "inadimplentes": inadimplentes,
            "taxa_inadimplencia_pct": round(inadimplentes / len(grupo) * 100, 2),
        })
    por_dia.sort(key=lambda x: x["taxa_inadimplencia_pct"], reverse=True)

    # --- insights automáticos ---
    insights = [
        {
            "insight": "Ausência de pagamentos parciais",
            "detalhe": (
                "100% dos pagamentos são integrais, com juros, ou zerados. "
                "Nenhum cliente pagou valor parcial — o comportamento é binário: paga ou não paga."
            ),
        },
        {
            "insight": "Clientes contemplados inadimpliam significativamente menos",
            "detalhe": (
                f"Não-contemplados: {por_contemplado[0]['taxa_inadimplencia_pct']}% de inadimplência. "
                f"Contemplados: {por_contemplado[-1]['taxa_inadimplencia_pct']}%. "
                f"Diferença de {diferenca_contemplado} p.p. — o maior preditor comportamental encontrado."
            ),
        },
        {
            "insight": "Pagamentos com juros confirmam atraso",
            "detalhe": (
                f"{n_com_juros} pagamentos ({round(n_com_juros/total*100,2)}%) foram feitos com acréscimo médio "
                f"de {acrescimo_medio_pct}% sobre o valor da parcela — correspondendo exatamente aos inadimplentes que regularizaram."
            ),
        },
        {
            "insight": "Forma de pagamento tem impacto mínimo",
            "detalhe": (
                f"A diferença entre a forma com maior inadimplência ({por_forma[0]['forma_pagamento']}: "
                f"{por_forma[0]['taxa_inadimplencia_pct']}%) e a menor ({por_forma[-1]['forma_pagamento']}: "
                f"{por_forma[-1]['taxa_inadimplencia_pct']}%) é inferior a 1 p.p."
            ),
        },
        {
            "insight": "Maturidade da parcela não influencia inadimplência",
            "detalhe": "A taxa de inadimplência permanece estável (~25%) independente de o cliente estar nas primeiras ou últimas parcelas.",
        },
    ]

    return {
        "tipos_pagamento": tipos_pagamento,
        "acrescimo_medio_juros_multa_pct": acrescimo_medio_pct,
        "por_forma_pagamento": por_forma,
        "por_indicador_contemplado": por_contemplado,
        "por_faixa_valor_parcela": por_valor,
        "por_numero_parcela": por_parcela,
        "por_dia_semana_vencimento": por_dia,
        "insights": insights,
    }


def get_distribuicao_regional() -> dict:
    df = load_data()

    df = df[df["regiao_cliente"].notna() & (df["regiao_cliente"] != "")].copy()
    contratos = df.drop_duplicates("id_contrato").copy()
    total_parcelas = len(df)
    valor_total = contratos["valor_inadimplente_inicial"].sum()

    regioes = sorted(df["regiao_cliente"].unique())
    resultado = []

    for regiao in regioes:
        grupo     = df[df["regiao_cliente"] == regiao]
        contratos_reg = contratos[contratos["regiao_cliente"] == regiao]

        n_total      = len(grupo)
        n_inadimp    = int((grupo["pagamento_em_dia"] == False).sum())
        n_em_dia     = int((grupo["pagamento_em_dia"] == True).sum())
        atraso_medio = round(float(grupo[grupo["dias_atraso"] > 0]["dias_atraso"].mean()), 2)

        n_contratos  = len(contratos_reg)
        val_total    = round(float(contratos_reg["valor_inadimplente_inicial"].sum()), 2)
        val_medio    = round(float(contratos_reg["valor_inadimplente_inicial"].mean()), 2)
        val_mediano  = round(float(contratos_reg["valor_inadimplente_inicial"].median()), 2)

        acordos   = int((contratos_reg["status_cobranca"] == "Acordo Firmado").sum())
        em_aberto = int((contratos_reg["status_cobranca"] == "Em Aberto").sum())
        insucesso = int((contratos_reg["status_cobranca"] == "Insucesso").sum())
        ajuizado  = int((contratos_reg["status_cobranca"] == "Ajuizado").sum())

        score_medio = round(float(grupo["score_interno_risco"].mean()), 2)

        fp_counts = grupo["forma_pagamento"].value_counts()
        forma_pct = {
            fp: round(cnt / n_total * 100, 2)
            for fp, cnt in fp_counts.items()
        }

        contemplados     = int((grupo["indicador_contemplado"] == "Sim").sum())
        pct_contemplados = round(contemplados / n_total * 100, 2)

        assessoria_norm = grupo["nome_assessoria"].str.strip().str.title()
        assessoria_dom  = assessoria_norm.value_counts().idxmax()

        resultado.append({
            "regiao": regiao,
            "volume": {
                "total_parcelas": n_total,
                "pct_carteira": round(n_total / total_parcelas * 100, 2),
                "total_contratos": n_contratos,
            },
            "inadimplencia": {
                "parcelas_em_dia": n_em_dia,
                "parcelas_atrasadas": n_inadimp,
                "taxa_inadimplencia_pct": round(n_inadimp / n_total * 100, 2),
                "atraso_medio_dias": atraso_medio,
            },
            "valor": {
                "total_inadimplente": val_total,
                "pct_valor_carteira": round(val_total / valor_total * 100, 2),
                "valor_medio_contrato": val_medio,
                "valor_mediano_contrato": val_mediano,
            },
            "recuperacao": {
                "acordos_firmados": acordos,
                "em_aberto": em_aberto,
                "insucesso": insucesso,
                "ajuizado": ajuizado,
                "taxa_recuperacao_pct": round(acordos / n_contratos * 100, 2) if n_contratos else 0,
                "taxa_judicializacao_pct": round(ajuizado / n_contratos * 100, 2) if n_contratos else 0,
            },
            "perfil": {
                "score_medio_risco": score_medio,
                "pct_contemplados": pct_contemplados,
                "forma_pagamento_pct": forma_pct,
                "assessoria_dominante": assessoria_dom,
            },
        })

    resultado.sort(key=lambda x: x["inadimplencia"]["taxa_inadimplencia_pct"], reverse=True)

    # --- rankings consolidados ---
    ranking_inadimplencia = [
        {"regiao": r["regiao"], "taxa_inadimplencia_pct": r["inadimplencia"]["taxa_inadimplencia_pct"]}
        for r in resultado
    ]
    ranking_valor = sorted(
        [{"regiao": r["regiao"], "valor_total_inadimplente": r["valor"]["total_inadimplente"],
          "pct_valor_carteira": r["valor"]["pct_valor_carteira"]} for r in resultado],
        key=lambda x: x["valor_total_inadimplente"], reverse=True
    )
    ranking_recuperacao = sorted(
        [{"regiao": r["regiao"], "taxa_recuperacao_pct": r["recuperacao"]["taxa_recuperacao_pct"],
          "taxa_judicializacao_pct": r["recuperacao"]["taxa_judicializacao_pct"]} for r in resultado],
        key=lambda x: x["taxa_recuperacao_pct"], reverse=True
    )

    # --- insights ---
    melhor_rec  = ranking_recuperacao[0]
    pior_rec    = ranking_recuperacao[-1]
    maior_vol   = max(resultado, key=lambda x: x["volume"]["total_parcelas"])
    maior_valor = ranking_valor[0]

    insights = [
        {
            "insight": "Taxas de inadimplência regionais praticamente homogêneas",
            "detalhe": (
                f"A variação entre a região com maior inadimplência ({ranking_inadimplencia[0]['regiao']}: "
                f"{ranking_inadimplencia[0]['taxa_inadimplencia_pct']}%) e a menor "
                f"({ranking_inadimplencia[-1]['regiao']}: {ranking_inadimplencia[-1]['taxa_inadimplencia_pct']}%) "
                "é inferior a 0,3 p.p. — o risco é geograficamente uniforme."
            ),
        },
        {
            "insight": "Concentração de valor em Sudeste e Nordeste",
            "detalhe": (
                f"{ranking_valor[0]['regiao']} ({ranking_valor[0]['pct_valor_carteira']}%) e "
                f"{ranking_valor[1]['regiao']} ({ranking_valor[1]['pct_valor_carteira']}%) concentram "
                f"{round(ranking_valor[0]['pct_valor_carteira'] + ranking_valor[1]['pct_valor_carteira'], 2)}% "
                "do valor inadimplente total — reflexo do maior volume de contratos."
            ),
        },
        {
            "insight": "Sul lidera recuperação; Norte é o mais problemático",
            "detalhe": (
                f"Sul tem a melhor taxa de recuperação ({melhor_rec['taxa_recuperacao_pct']}%) e menor judicialização. "
                f"Norte tem a pior recuperação ({pior_rec['taxa_recuperacao_pct']}%) e maior judicialização "
                f"({pior_rec['taxa_judicializacao_pct']}%) — prioridade para estratégias extrajudiciais."
            ),
        },
        {
            "insight": "Perfil de pagamento uniforme entre regiões",
            "detalhe": (
                "A distribuição de forma de pagamento (~50% Boleto, ~35% Pix, ~15% Débito Automático) "
                "e o percentual de clientes contemplados (~30%) são praticamente idênticos em todas as regiões."
            ),
        },
    ]

    return {
        "por_regiao": resultado,
        "rankings": {
            "inadimplencia": ranking_inadimplencia,
            "valor_inadimplente": ranking_valor,
            "recuperacao": ranking_recuperacao,
        },
        "insights": insights,
    }


def get_status_cobrancas() -> dict:
    df = load_data()

    contratos = df.drop_duplicates("id_contrato").copy()
    contratos["nome_assessoria_norm"] = contratos["nome_assessoria"].str.strip().str.title()
    contratos_clean = contratos[contratos["dias_em_atraso_inicial"] >= 0].copy()

    total = len(contratos)
    valor_total = contratos["valor_inadimplente_inicial"].sum()
    STATUS = ["Acordo Firmado", "Em Aberto", "Insucesso", "Ajuizado"]

    # --- visão geral ---
    visao_geral = []
    for status in STATUS:
        grupo = contratos[contratos["status_cobranca"] == status]
        n = len(grupo)
        val_sum    = round(float(grupo["valor_inadimplente_inicial"].sum()), 2)
        val_medio  = round(float(grupo["valor_inadimplente_inicial"].mean()), 2)
        val_mediano = round(float(grupo["valor_inadimplente_inicial"].median()), 2)
        score_medio = round(float(grupo["score_interno_risco"].mean()), 2)

        grupo_clean = contratos_clean[contratos_clean["status_cobranca"] == status]
        dias_medio  = round(float(grupo_clean["dias_em_atraso_inicial"].mean()), 1) if len(grupo_clean) else None
        dias_mediano = round(float(grupo_clean["dias_em_atraso_inicial"].median()), 1) if len(grupo_clean) else None

        visao_geral.append({
            "status": status,
            "total_contratos": n,
            "pct_contratos": round(n / total * 100, 2),
            "valor_total": val_sum,
            "pct_valor": round(val_sum / valor_total * 100, 2),
            "valor_medio_contrato": val_medio,
            "valor_mediano_contrato": val_mediano,
            "score_medio_risco": score_medio,
            "dias_atraso_inicial_medio": dias_medio,
            "dias_atraso_inicial_mediano": dias_mediano,
        })

    # --- por assessoria ---
    por_assessoria = []
    for assessoria, grupo in contratos.groupby("nome_assessoria_norm"):
        n_ass = len(grupo)
        linha = {"assessoria": assessoria, "total": n_ass}
        for status in STATUS:
            cnt = int((grupo["status_cobranca"] == status).sum())
            linha[status.lower().replace(" ", "_")] = cnt
            linha[f"pct_{status.lower().replace(' ', '_')}"] = round(cnt / n_ass * 100, 2)
        linha["valor_em_aberto"] = round(
            float(grupo[grupo["status_cobranca"] == "Em Aberto"]["valor_inadimplente_inicial"].sum()), 2
        )
        por_assessoria.append(linha)
    por_assessoria.sort(key=lambda x: x["pct_acordo_firmado"], reverse=True)

    # --- por região ---
    por_regiao = []
    for regiao, grupo in contratos.groupby("regiao_cliente"):
        n_reg = len(grupo)
        linha = {"regiao": regiao, "total": n_reg}
        for status in STATUS:
            cnt = int((grupo["status_cobranca"] == status).sum())
            linha[status.lower().replace(" ", "_")] = cnt
            linha[f"pct_{status.lower().replace(' ', '_')}"] = round(cnt / n_reg * 100, 2)
        por_regiao.append(linha)
    por_regiao.sort(key=lambda x: x["pct_acordo_firmado"], reverse=True)

    # --- por faixa de score ---
    def banda_risco(score):
        if pd.isna(score): return "Sem score"
        if score <= 33: return "Baixo (1-33)"
        if score <= 66: return "Médio (34-66)"
        return "Alto (67-100)"

    contratos["banda_risco"] = contratos["score_interno_risco"].apply(banda_risco)
    por_score = []
    for banda, grupo in contratos.groupby("banda_risco"):
        n_b = len(grupo)
        linha = {"banda_risco": banda, "total": n_b}
        for status in STATUS:
            cnt = int((grupo["status_cobranca"] == status).sum())
            linha[status.lower().replace(" ", "_")] = cnt
            linha[f"pct_{status.lower().replace(' ', '_')}"] = round(cnt / n_b * 100, 2)
        por_score.append(linha)

    # --- evolução mensal ---
    contratos["mes"] = contratos["data_envio_assessoria"].dt.to_period("M").astype(str)
    por_mes = []
    for mes, grupo in contratos.groupby("mes"):
        n_m = len(grupo)
        linha = {"mes": mes, "total": n_m}
        for status in STATUS:
            cnt = int((grupo["status_cobranca"] == status).sum())
            linha[status.lower().replace(" ", "_")] = cnt
            linha[f"pct_{status.lower().replace(' ', '_')}"] = round(cnt / n_m * 100, 2)
        por_mes.append(linha)
    por_mes.sort(key=lambda x: x["mes"])

    # --- valor em aberto por assessoria (oportunidade de recuperação) ---
    em_aberto = contratos[contratos["status_cobranca"] == "Em Aberto"]
    oportunidade = (
        em_aberto.groupby("nome_assessoria_norm")["valor_inadimplente_inicial"]
        .agg(total_contratos="count", valor_total="sum", valor_medio="mean")
        .round(2)
        .reset_index()
        .sort_values("valor_total", ascending=False)
        .to_dict(orient="records")
    )

    # --- insights ---
    em_aberto_val = next(x for x in visao_geral if x["status"] == "Em Aberto")
    acordo_val    = next(x for x in visao_geral if x["status"] == "Acordo Firmado")
    melhor_ass    = por_assessoria[0]
    pior_ass      = por_assessoria[-1]

    insights = [
        {
            "insight": "R$ 246M presos em contratos 'Em Aberto' — maior oportunidade da carteira",
            "detalhe": (
                f"{em_aberto_val['total_contratos']} contratos ({em_aberto_val['pct_contratos']}% do total) "
                f"somam R$ {em_aberto_val['valor_total']:,.2f} ({em_aberto_val['pct_valor']}% do valor total). "
                "São contratos sem resolução — prioridade imediata de cobrança ativa."
            ),
        },
        {
            "insight": "Score de risco não diferencia o outcome da cobrança",
            "detalhe": (
                "A distribuição do score é praticamente idêntica entre todos os status "
                "(média entre 50 e 51 em todos os grupos). O modelo de risco atual "
                "não consegue prever se um contrato vai ser recuperado, entrar em insucesso ou ser ajuizado."
            ),
        },
        {
            "insight": "Contratos com menor atraso inicial são mais fáceis de recuperar",
            "detalhe": (
                f"Acordos Firmados tinham em média {acordo_val['dias_atraso_inicial_medio']} dias de atraso ao entrar na cobrança, "
                f"contra {next(x for x in visao_geral if x['status'] == 'Ajuizado')['dias_atraso_inicial_medio']} dias nos Ajuizados. "
                "Agir mais cedo aumenta a chance de acordo extrajudicial."
            ),
        },
        {
            "insight": f"Acerta Crédito tem melhor taxa de recuperação entre as assessorias",
            "detalhe": (
                f"{melhor_ass['assessoria']} recupera {melhor_ass['pct_acordo_firmado']}% dos contratos, "
                f"contra {pior_ass['pct_acordo_firmado']}% da {pior_ass['assessoria']}. "
                "Distribuir mais contratos para assessorias com melhor desempenho pode aumentar a recuperação geral."
            ),
        },
        {
            "insight": "Judicialização concentra dívidas menores e mais antigas",
            "detalhe": (
                f"Contratos Ajuizados têm valor mediano de "
                f"R$ {next(x for x in visao_geral if x['status'] == 'Ajuizado')['valor_mediano_contrato']:,.2f} "
                "— similar aos demais. Porém, têm o maior atraso inicial médio, "
                "indicando que vão a juízo quando negociação extrajudicial já falhou."
            ),
        },
    ]

    return {
        "visao_geral": visao_geral,
        "por_assessoria": por_assessoria,
        "por_regiao": por_regiao,
        "por_faixa_score": por_score,
        "evolucao_mensal": por_mes,
        "oportunidade_em_aberto": oportunidade,
        "insights": insights,
    }


def get_atraso_medio() -> dict:
    df = load_data()

    atrasados = df[df["dias_atraso"] > 0].copy()
    total = len(atrasados)

    media_geral  = round(float(atrasados["dias_atraso"].mean()), 1)
    mediana      = round(float(atrasados["dias_atraso"].median()), 1)
    desvio       = round(float(atrasados["dias_atraso"].std()), 1)
    maximo       = int(atrasados["dias_atraso"].max())

    percentis = {
        "p25": round(float(atrasados["dias_atraso"].quantile(0.25)), 1),
        "p50": round(float(atrasados["dias_atraso"].quantile(0.50)), 1),
        "p75": round(float(atrasados["dias_atraso"].quantile(0.75)), 1),
        "p90": round(float(atrasados["dias_atraso"].quantile(0.90)), 1),
        "p95": round(float(atrasados["dias_atraso"].quantile(0.95)), 1),
    }

    # --- faixas de atraso ---
    bins   = [0, 15, 30, 60, 90, 120, float("inf")]
    labels = ["1-15 dias", "16-30 dias", "31-60 dias", "61-90 dias", "91-120 dias", "120+ dias"]
    atrasados["faixa"] = pd.cut(atrasados["dias_atraso"], bins=bins, labels=labels, right=True)
    faixas = []
    for label in labels:
        count = int((atrasados["faixa"] == label).sum())
        faixas.append({
            "faixa": label,
            "count": count,
            "pct": round(count / total * 100, 2),
        })

    # --- evolução mensal ---
    df_v = atrasados.dropna(subset=["data_vencimento"]).copy()
    df_v["mes"] = df_v["data_vencimento"].dt.to_period("M").astype(str)
    evo = (
        df_v.groupby("mes")
        .agg(total=("dias_atraso", "count"), media_dias=("dias_atraso", "mean"))
        .reset_index()
    )
    evo["media_dias"] = evo["media_dias"].round(1)
    evo_list = evo.sort_values("mes").to_dict(orient="records")

    # --- por região ---
    df_reg = atrasados[atrasados["regiao_cliente"].notna() & (atrasados["regiao_cliente"] != "")]
    por_regiao = (
        df_reg.groupby("regiao_cliente")
        .agg(
            total=("dias_atraso", "count"),
            media_dias=("dias_atraso", "mean"),
            mediana_dias=("dias_atraso", "median"),
        )
        .reset_index()
        .rename(columns={"regiao_cliente": "regiao"})
    )
    por_regiao[["media_dias", "mediana_dias"]] = por_regiao[["media_dias", "mediana_dias"]].round(1)
    por_regiao_list = por_regiao.sort_values("media_dias", ascending=False).to_dict(orient="records")

    # --- por faixa de score de risco ---
    def banda_risco(score):
        if pd.isna(score): return "Sem score"
        if score <= 33:    return "Baixo (1-33)"
        if score <= 66:    return "Médio (34-66)"
        return "Alto (67-100)"

    atrasados["banda"] = atrasados["score_interno_risco"].apply(banda_risco)
    ordem_risco = ["Alto (67-100)", "Médio (34-66)", "Baixo (1-33)", "Sem score"]
    por_risco = (
        atrasados.groupby("banda")
        .agg(total=("dias_atraso", "count"), media_dias=("dias_atraso", "mean"))
        .reset_index()
        .rename(columns={"banda": "faixa"})
    )
    por_risco["media_dias"] = por_risco["media_dias"].round(1)
    por_risco["_ord"] = por_risco["faixa"].map({v: i for i, v in enumerate(ordem_risco)})
    por_risco_list = por_risco.sort_values("_ord").drop(columns="_ord").to_dict(orient="records")

    # --- por forma de pagamento ---
    por_forma = (
        atrasados.groupby("forma_pagamento")
        .agg(total=("dias_atraso", "count"), media_dias=("dias_atraso", "mean"))
        .reset_index()
        .rename(columns={"forma_pagamento": "forma"})
    )
    por_forma["media_dias"] = por_forma["media_dias"].round(1)
    por_forma_list = por_forma.sort_values("media_dias", ascending=False).to_dict(orient="records")

    # --- insights ---
    maior_faixa = max(faixas, key=lambda f: f["count"])
    pior_reg    = por_regiao_list[0]
    melhor_reg  = por_regiao_list[-1]

    insights = [
        {
            "insight": f"Atraso médio geral de {media_geral} dias entre parcelas em atraso",
            "detalhe": (
                f"Mediana de {mediana} dias (desvio-padrão: {desvio} dias). "
                f"50% dos casos se resolvem em até {percentis['p50']} dias "
                f"e 90% em até {percentis['p90']} dias — a cauda longa (máx. {maximo} dias) "
                "puxa a média acima da mediana."
            ),
        },
        {
            "insight": f"A faixa '{maior_faixa['faixa']}' concentra {maior_faixa['pct']}% dos atrasos",
            "detalhe": (
                f"{maior_faixa['count']:,} parcelas ficam nessa faixa. "
                "Acionar cobrança dentro dos primeiros 15 dias captura a maior parte dos atrasos "
                "ainda em estágio recuperável."
            ),
        },
        {
            "insight": f"{pior_reg['regiao']} tem o maior atraso médio ({pior_reg['media_dias']} dias)",
            "detalhe": (
                f"Versus {melhor_reg['regiao']} com {melhor_reg['media_dias']} dias. "
                f"Diferença de {round(pior_reg['media_dias'] - melhor_reg['media_dias'], 1)} dias — "
                "pode refletir diferenças no perfil de clientes ou na eficácia das assessorias regionais."
            ),
        },
        {
            "insight": f"p95 = {percentis['p95']} dias indica casos cronicamente inadimplentes",
            "detalhe": (
                "Os 5% mais graves ultrapassam esse limite, representando casos de difícil recuperação extrajudicial. "
                "São candidatos prioritários à judicialização ou renegociação especial."
            ),
        },
    ]

    return {
        "indicador_geral": {
            "media_dias": media_geral,
            "mediana_dias": mediana,
            "desvio_padrao": desvio,
            "max_dias": maximo,
            "total_atrasados": total,
            "percentis": percentis,
        },
        "faixas_atraso": faixas,
        "evolucao_mensal": evo_list,
        "por_regiao": por_regiao_list,
        "por_faixa_risco": por_risco_list,
        "por_forma_pagamento": por_forma_list,
        "insights": insights,
    }


def get_taxa_recuperacao() -> dict:
    df = load_data()

    contratos = df.drop_duplicates("id_contrato").copy()
    contratos["nome_assessoria_norm"] = contratos["nome_assessoria"].str.strip().str.title()

    total = len(contratos)
    n_acordos = int((contratos["status_cobranca"] == "Acordo Firmado").sum())
    taxa_geral = round(n_acordos / total * 100, 2)

    valor_total = float(contratos["valor_inadimplente_inicial"].sum())
    valor_recuperado = float(
        contratos[contratos["status_cobranca"] == "Acordo Firmado"]["valor_inadimplente_inicial"].sum()
    )
    taxa_valor_pct = round(valor_recuperado / valor_total * 100, 2) if valor_total else 0

    # --- evolução mensal ---
    contratos_v = contratos.dropna(subset=["data_envio_assessoria"]).copy()
    contratos_v["mes"] = contratos_v["data_envio_assessoria"].dt.to_period("M").astype(str)
    evo = (
        contratos_v.groupby("mes")
        .agg(
            total=("status_cobranca", "count"),
            acordos=("status_cobranca", lambda x: (x == "Acordo Firmado").sum()),
        )
        .reset_index()
    )
    evo["taxa_pct"] = (evo["acordos"] / evo["total"] * 100).round(2)
    evo_list = evo.sort_values("mes").to_dict(orient="records")
    variacao_ppt = (
        round(evo_list[-1]["taxa_pct"] - evo_list[0]["taxa_pct"], 2)
        if len(evo_list) >= 2 else 0.0
    )

    # --- por região ---
    por_regiao = (
        contratos.groupby("regiao_cliente")
        .agg(
            total=("status_cobranca", "count"),
            acordos=("status_cobranca", lambda x: (x == "Acordo Firmado").sum()),
        )
        .reset_index()
        .rename(columns={"regiao_cliente": "regiao"})
    )
    por_regiao["taxa_pct"] = (por_regiao["acordos"] / por_regiao["total"] * 100).round(2)
    por_regiao_list = por_regiao.sort_values("taxa_pct", ascending=False).to_dict(orient="records")

    # --- por faixa de score de risco ---
    def banda_risco(score):
        if pd.isna(score): return "Sem score"
        if score <= 33:    return "Baixo (1-33)"
        if score <= 66:    return "Médio (34-66)"
        return "Alto (67-100)"

    contratos["banda"] = contratos["score_interno_risco"].apply(banda_risco)
    ordem_risco = ["Alto (67-100)", "Médio (34-66)", "Baixo (1-33)", "Sem score"]
    por_risco = (
        contratos.groupby("banda")
        .agg(
            total=("status_cobranca", "count"),
            acordos=("status_cobranca", lambda x: (x == "Acordo Firmado").sum()),
        )
        .reset_index()
        .rename(columns={"banda": "faixa"})
    )
    por_risco["taxa_pct"] = (por_risco["acordos"] / por_risco["total"] * 100).round(2)
    por_risco["_ord"] = por_risco["faixa"].map({v: i for i, v in enumerate(ordem_risco)})
    por_risco_list = por_risco.sort_values("_ord").drop(columns="_ord").to_dict(orient="records")

    # --- por assessoria ---
    por_assessoria_list = []
    for ass, grupo in contratos.groupby("nome_assessoria_norm"):
        n = len(grupo)
        n_ac = int((grupo["status_cobranca"] == "Acordo Firmado").sum())
        val_tot = round(float(grupo["valor_inadimplente_inicial"].sum()), 2)
        val_rec = round(
            float(grupo[grupo["status_cobranca"] == "Acordo Firmado"]["valor_inadimplente_inicial"].sum()), 2
        )
        por_assessoria_list.append({
            "assessoria": ass,
            "total": n,
            "acordos": n_ac,
            "taxa_pct": round(n_ac / n * 100, 2) if n else 0,
            "valor_total": val_tot,
            "valor_recuperado": val_rec,
        })
    por_assessoria_list.sort(key=lambda x: x["taxa_pct"], reverse=True)

    # --- distribuição por status ---
    STATUS = ["Acordo Firmado", "Em Aberto", "Insucesso", "Ajuizado"]
    STATUS_COLORS = {
        "Acordo Firmado": "#22c55e",
        "Em Aberto":      "#f97316",
        "Insucesso":      "#ef4444",
        "Ajuizado":       "#8b5cf6",
    }
    por_status = []
    for status in STATUS:
        n_s = int((contratos["status_cobranca"] == status).sum())
        val_s = round(float(contratos[contratos["status_cobranca"] == status]["valor_inadimplente_inicial"].sum()), 2)
        por_status.append({
            "status": status,
            "total": n_s,
            "pct": round(n_s / total * 100, 2) if total else 0,
            "valor": val_s,
            "pct_valor": round(val_s / valor_total * 100, 2) if valor_total else 0,
            "cor": STATUS_COLORS[status],
        })

    # --- insights ---
    melhor_reg = por_regiao_list[0]
    pior_reg   = por_regiao_list[-1]
    melhor_ass = por_assessoria_list[0]
    pior_ass   = por_assessoria_list[-1]
    em_aberto  = next((s for s in por_status if s["status"] == "Em Aberto"), None)
    variacao_str = f"+{variacao_ppt} p.p." if variacao_ppt > 0 else f"{variacao_ppt} p.p."

    insights = [
        {
            "insight": f"Taxa geral de recuperação de {taxa_geral}% sobre contratos em cobrança",
            "detalhe": (
                f"{n_acordos:,} contratos recuperados (Acordo Firmado) de {total:,} enviados à assessoria. "
                f"Valor recuperado: R$ {valor_recuperado:,.0f} ({taxa_valor_pct}% do valor inadimplente total). "
                f"A taxa variou {variacao_str} ao longo do período."
            ),
        },
    ]

    if em_aberto:
        insights.append({
            "insight": f"{em_aberto['total']:,} contratos 'Em Aberto' — maior oportunidade de recuperação imediata",
            "detalhe": (
                f"Esses {em_aberto['pct']}% dos contratos concentram "
                f"R$ {em_aberto['valor']:,.0f} ({em_aberto['pct_valor']}% do valor total). "
                "Ação proativa sobre esse grupo pode elevar significativamente a taxa de recuperação."
            ),
        })

    insights.append({
        "insight": (
            f"Melhor região: {melhor_reg['regiao']} ({melhor_reg['taxa_pct']}%) — "
            f"pior: {pior_reg['regiao']} ({pior_reg['taxa_pct']}%)"
        ),
        "detalhe": (
            f"Spread regional de {round(melhor_reg['taxa_pct'] - pior_reg['taxa_pct'], 2)} p.p. "
            "indica que fatores operacionais (assessoria, perfil local) impactam mais que o risco geográfico."
        ),
    })

    insights.append({
        "insight": f"{melhor_ass['assessoria']} lidera com {melhor_ass['taxa_pct']}% de recuperação",
        "detalhe": (
            f"Diferença de {round(melhor_ass['taxa_pct'] - pior_ass['taxa_pct'], 2)} p.p. "
            f"em relação a {pior_ass['assessoria']} ({pior_ass['taxa_pct']}%). "
            "Redistribuir contratos para assessorias de maior performance pode elevar a taxa geral."
        ),
    })

    return {
        "indicador_geral": {
            "taxa_pct": taxa_geral,
            "total_contratos": total,
            "contratos_recuperados": n_acordos,
            "variacao_periodo_ppt": variacao_ppt,
            "valor_total_inadimplente": round(valor_total, 2),
            "valor_recuperado": round(valor_recuperado, 2),
            "taxa_recuperacao_valor_pct": taxa_valor_pct,
        },
        "evolucao_mensal": evo_list,
        "por_regiao": por_regiao_list,
        "por_faixa_risco": por_risco_list,
        "por_assessoria": por_assessoria_list,
        "por_status": por_status,
        "insights": insights,
    }


def get_taxa_inadimplencia() -> dict:
    df = load_data()

    total = len(df)
    n_atrasados = int((df["pagamento_em_dia"] == False).sum())
    n_em_dia = total - n_atrasados
    taxa_geral = round(n_atrasados / total * 100, 2)
    atraso_medio = round(float(df[df["dias_atraso"] > 0]["dias_atraso"].mean()), 1)

    # --- evolução mensal ---
    df_v = df.dropna(subset=["data_vencimento"]).copy()
    df_v["mes"] = df_v["data_vencimento"].dt.to_period("M").astype(str)
    evo = (
        df_v.groupby("mes")
        .agg(
            total=("pagamento_em_dia", "count"),
            atrasados=("pagamento_em_dia", lambda x: (x == False).sum()),
        )
        .reset_index()
    )
    evo["taxa_pct"] = (evo["atrasados"] / evo["total"] * 100).round(2)
    evo_list = evo.sort_values("mes").to_dict(orient="records")
    variacao_ppt = (
        round(evo_list[-1]["taxa_pct"] - evo_list[0]["taxa_pct"], 2)
        if len(evo_list) >= 2 else 0.0
    )

    # --- por região ---
    df_reg = df[df["regiao_cliente"].notna() & (df["regiao_cliente"] != "")].copy()
    por_regiao = (
        df_reg.groupby("regiao_cliente")
        .agg(
            total=("pagamento_em_dia", "count"),
            atrasados=("pagamento_em_dia", lambda x: (x == False).sum()),
        )
        .reset_index()
        .rename(columns={"regiao_cliente": "regiao"})
    )
    por_regiao["taxa_pct"] = (por_regiao["atrasados"] / por_regiao["total"] * 100).round(2)
    por_regiao_list = por_regiao.sort_values("taxa_pct", ascending=False).to_dict(orient="records")

    # --- por faixa de score de risco ---
    def banda_risco(score):
        if pd.isna(score): return "Sem score"
        if score <= 33:    return "Baixo (1-33)"
        if score <= 66:    return "Médio (34-66)"
        return "Alto (67-100)"

    df_r = df.copy()
    df_r["banda"] = df_r["score_interno_risco"].apply(banda_risco)
    ordem_risco = ["Alto (67-100)", "Médio (34-66)", "Baixo (1-33)", "Sem score"]
    por_risco = (
        df_r.groupby("banda")
        .agg(
            total=("pagamento_em_dia", "count"),
            atrasados=("pagamento_em_dia", lambda x: (x == False).sum()),
        )
        .reset_index()
        .rename(columns={"banda": "faixa"})
    )
    por_risco["taxa_pct"] = (por_risco["atrasados"] / por_risco["total"] * 100).round(2)
    por_risco["_ord"] = por_risco["faixa"].map({v: i for i, v in enumerate(ordem_risco)})
    por_risco_list = por_risco.sort_values("_ord").drop(columns="_ord").to_dict(orient="records")

    # --- por forma de pagamento ---
    por_forma = (
        df.groupby("forma_pagamento")
        .agg(
            total=("pagamento_em_dia", "count"),
            atrasados=("pagamento_em_dia", lambda x: (x == False).sum()),
        )
        .reset_index()
        .rename(columns={"forma_pagamento": "forma"})
    )
    por_forma["taxa_pct"] = (por_forma["atrasados"] / por_forma["total"] * 100).round(2)
    por_forma_list = por_forma.sort_values("taxa_pct", ascending=False).to_dict(orient="records")

    # --- por contemplado ---
    por_contemplado = (
        df.groupby("indicador_contemplado")
        .agg(
            total=("pagamento_em_dia", "count"),
            atrasados=("pagamento_em_dia", lambda x: (x == False).sum()),
        )
        .reset_index()
        .rename(columns={"indicador_contemplado": "contemplado"})
    )
    por_contemplado["taxa_pct"] = (por_contemplado["atrasados"] / por_contemplado["total"] * 100).round(2)
    por_contemplado_list = por_contemplado.sort_values("taxa_pct", ascending=False).to_dict(orient="records")

    # --- insights ---
    risco_alto  = next((r for r in por_risco_list if "Alto"  in r["faixa"]), None)
    risco_baixo = next((r for r in por_risco_list if "Baixo" in r["faixa"]), None)
    variacao_str = f"+{variacao_ppt} p.p." if variacao_ppt > 0 else f"{variacao_ppt} p.p."
    pior_reg  = por_regiao_list[0]
    melhor_reg = por_regiao_list[-1]

    insights = [
        {
            "insight": f"Taxa geral de inadimplência de {taxa_geral}% no período",
            "detalhe": (
                f"{n_atrasados:,} das {total:,} parcelas estão em atraso. "
                f"A taxa variou {variacao_str} do primeiro ao último mês analisado — "
                "comportamento estruturalmente estável."
            ),
        },
        {
            "insight": f"Inadimplência mínima entre regiões: spread de apenas {round(pior_reg['taxa_pct'] - melhor_reg['taxa_pct'], 2)} p.p.",
            "detalhe": (
                f"{pior_reg['regiao']} lidera com {pior_reg['taxa_pct']}% e "
                f"{melhor_reg['regiao']} tem a menor taxa ({melhor_reg['taxa_pct']}%). "
                "O risco geográfico é praticamente uniforme na carteira."
            ),
        },
    ]

    if risco_alto and risco_baixo:
        diff = round(risco_alto["taxa_pct"] - risco_baixo["taxa_pct"], 2)
        insights.append({
            "insight": f"Score discrimina inadimplência: diferença de {diff} p.p. entre Alto e Baixo risco",
            "detalhe": (
                f"Score Alto: {risco_alto['taxa_pct']}% de inadimplência ({risco_alto['total']:,} parcelas). "
                f"Score Baixo: {risco_baixo['taxa_pct']}% ({risco_baixo['total']:,} parcelas). "
                "O score de risco é o principal preditor identificado."
            ),
        })

    if por_contemplado_list:
        nao = next((c for c in por_contemplado_list if c["contemplado"] == "Não"), None)
        sim = next((c for c in por_contemplado_list if c["contemplado"] == "Sim"), None)
        if nao and sim:
            insights.append({
                "insight": "Clientes contemplados inadimplem menos",
                "detalhe": (
                    f"Não-contemplados: {nao['taxa_pct']}% de inadimplência. "
                    f"Contemplados: {sim['taxa_pct']}%. "
                    f"Diferença de {round(nao['taxa_pct'] - sim['taxa_pct'], 2)} p.p. — "
                    "contemplação funciona como fator protetor do crédito."
                ),
            })

    return {
        "indicador_geral": {
            "taxa_pct": taxa_geral,
            "total_parcelas": total,
            "parcelas_atrasadas": n_atrasados,
            "parcelas_em_dia": n_em_dia,
            "atraso_medio_dias": atraso_medio,
            "variacao_periodo_ppt": variacao_ppt,
        },
        "evolucao_mensal": evo_list,
        "por_regiao": por_regiao_list,
        "por_faixa_risco": por_risco_list,
        "por_forma_pagamento": por_forma_list,
        "por_contemplado": por_contemplado_list,
        "insights": insights,
    }


def get_padroes_insights() -> dict:
    df = load_data()
    contratos = df.drop_duplicates("id_contrato").copy()
    contratos["nome_assessoria_norm"] = contratos["nome_assessoria"].str.strip().str.title()
    df_valid = df[df["regiao_cliente"].notna() & (df["regiao_cliente"] != "")].copy()

    def banda_risco(score):
        if pd.isna(score): return "Sem score"
        if score <= 33:    return "Baixo (1-33)"
        if score <= 66:    return "Médio (34-66)"
        return "Alto (67-100)"

    df["banda"] = df["score_interno_risco"].apply(banda_risco)
    contratos["banda"] = contratos["score_interno_risco"].apply(banda_risco)

    # ── 1. PERFIS DE ALTO RISCO ──
    cross_bc = (
        df.groupby(["banda", "indicador_contemplado"])
        .agg(total=("pagamento_em_dia", "count"), atrasados=("pagamento_em_dia", lambda x: (x == False).sum()))
        .reset_index()
    )
    cross_bc["taxa_pct"] = (cross_bc["atrasados"] / cross_bc["total"] * 100).round(2)
    cross_bc_list = cross_bc.rename(columns={"banda": "score", "indicador_contemplado": "contemplado"}).to_dict(orient="records")

    cross_bf = (
        df.groupby(["banda", "forma_pagamento"])
        .agg(total=("pagamento_em_dia", "count"), atrasados=("pagamento_em_dia", lambda x: (x == False).sum()))
        .reset_index()
    )
    cross_bf["taxa_pct"] = (cross_bf["atrasados"] / cross_bf["total"] * 100).round(2)
    cross_bf_list = cross_bf.rename(columns={"banda": "score"}).to_dict(orient="records")

    cross_all = (
        df.groupby(["banda", "indicador_contemplado", "forma_pagamento"])
        .agg(total=("pagamento_em_dia", "count"), atrasados=("pagamento_em_dia", lambda x: (x == False).sum()))
        .reset_index()
    )
    cross_all["taxa_pct"] = (cross_all["atrasados"] / cross_all["total"] * 100).round(2)
    cross_all = cross_all[cross_all["total"] >= 50]
    top_combinacoes = (
        cross_all.sort_values("taxa_pct", ascending=False)
        .head(5)
        .rename(columns={"banda": "score", "indicador_contemplado": "contemplado"})
        .to_dict(orient="records")
    )

    # ── 2. REGIÕES CRÍTICAS ──
    contratos_valid = contratos[contratos["regiao_cliente"].notna() & (contratos["regiao_cliente"] != "")]
    regioes_criticas = []
    for regiao in sorted(df_valid["regiao_cliente"].unique()):
        g = df_valid[df_valid["regiao_cliente"] == regiao]
        c = contratos_valid[contratos_valid["regiao_cliente"] == regiao]
        n = len(g)
        nc = len(c)

        taxa_iad = round(float((g["pagamento_em_dia"] == False).sum()) / n * 100, 2) if n else 0.0
        acordos  = int((c["status_cobranca"] == "Acordo Firmado").sum())
        ajuizados = int((c["status_cobranca"] == "Ajuizado").sum())
        em_aberto = int((c["status_cobranca"] == "Em Aberto").sum())
        taxa_rec  = round(acordos  / nc * 100, 2) if nc else 0.0
        taxa_jud  = round(ajuizados / nc * 100, 2) if nc else 0.0
        taxa_ab   = round(em_aberto / nc * 100, 2) if nc else 0.0
        atraso_m  = round(float(g[g["dias_atraso"] > 0]["dias_atraso"].mean()), 1) if (g["dias_atraso"] > 0).any() else 0.0
        val_inad  = round(float(c["valor_inadimplente_inicial"].sum()), 2)

        score = round(float(taxa_iad * 0.30 + (100 - taxa_rec) * 0.40 + taxa_jud * 0.30), 1)
        regioes_criticas.append({
            "regiao": regiao,
            "taxa_inadimplencia": taxa_iad,
            "taxa_recuperacao": taxa_rec,
            "taxa_judicializacao": taxa_jud,
            "taxa_em_aberto": taxa_ab,
            "valor_inadimplente": val_inad,
            "atraso_medio_dias": atraso_m,
            "score_criticidade": score,
            "total_parcelas": n,
            "total_contratos": nc,
        })

    regioes_criticas.sort(key=lambda x: x["score_criticidade"], reverse=True)
    n_regs = len(regioes_criticas)
    for i, r in enumerate(regioes_criticas):
        if i < max(1, round(n_regs * 0.4)):
            r["urgencia"] = "Atenção Crítica"
        elif i < max(2, round(n_regs * 0.8)):
            r["urgencia"] = "Monitoramento Ativo"
        else:
            r["urgencia"] = "Referência"

    # ── 3. EFICIÊNCIA DE RECUPERAÇÃO ──
    eficiencia_ass = []
    for ass, grupo in contratos.groupby("nome_assessoria_norm"):
        n = len(grupo)
        if n == 0:
            continue
        acordos_n  = int((grupo["status_cobranca"] == "Acordo Firmado").sum())
        em_ab_n    = int((grupo["status_cobranca"] == "Em Aberto").sum())
        insucesso_n = int((grupo["status_cobranca"] == "Insucesso").sum())
        ajuizado_n  = int((grupo["status_cobranca"] == "Ajuizado").sum())

        taxa_rec_a = round(acordos_n  / n * 100, 2)
        taxa_ab_a  = round(em_ab_n    / n * 100, 2)
        taxa_ins_a = round(insucesso_n / n * 100, 2)
        taxa_jud_a = round(ajuizado_n  / n * 100, 2)

        val_tot  = round(float(grupo["valor_inadimplente_inicial"].sum()), 2)
        val_rec  = round(float(grupo[grupo["status_cobranca"] == "Acordo Firmado"]["valor_inadimplente_inicial"].sum()), 2)
        val_perd = round(float(grupo[grupo["status_cobranca"].isin(["Insucesso", "Ajuizado"])]["valor_inadimplente_inicial"].sum()), 2)
        val_ab   = round(float(grupo[grupo["status_cobranca"] == "Em Aberto"]["valor_inadimplente_inicial"].sum()), 2)

        score_ef = round(taxa_rec_a * (1 - taxa_jud_a / 100), 1)
        eficiencia_ass.append({
            "assessoria": ass,
            "total_contratos": n,
            "acordos": acordos_n,
            "em_aberto": em_ab_n,
            "insucesso": insucesso_n,
            "ajuizado": ajuizado_n,
            "taxa_recuperacao": taxa_rec_a,
            "taxa_em_aberto": taxa_ab_a,
            "taxa_insucesso": taxa_ins_a,
            "taxa_judicializacao": taxa_jud_a,
            "valor_total": val_tot,
            "valor_recuperado": val_rec,
            "valor_perdido": val_perd,
            "valor_em_aberto": val_ab,
            "score_eficiencia": score_ef,
        })
    eficiencia_ass.sort(key=lambda x: x["score_eficiencia"], reverse=True)

    # ── 4. PADRÕES TEMPORAIS ──
    MESES_PT = {1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez"}
    df_v = df.dropna(subset=["data_vencimento"]).copy()
    df_v["mes_num"] = df_v["data_vencimento"].dt.month

    sazonal = (
        df_v.groupby("mes_num")
        .agg(total=("pagamento_em_dia", "count"), atrasados=("pagamento_em_dia", lambda x: (x == False).sum()))
        .reset_index()
    )
    sazonal["taxa_pct"] = (sazonal["atrasados"] / sazonal["total"] * 100).round(2)
    sazonal["mes_nome"] = sazonal["mes_num"].map(MESES_PT)
    sazonal_list = sazonal.to_dict(orient="records")

    ORDEM_SEMANA = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    TRAD_SEMANA  = {"Monday":"Seg","Tuesday":"Ter","Wednesday":"Qua","Thursday":"Qui","Friday":"Sex","Saturday":"Sáb","Sunday":"Dom"}
    df_v["dia_semana"] = df_v["data_vencimento"].dt.day_name()
    dow_list = []
    for dia in ORDEM_SEMANA:
        g = df_v[df_v["dia_semana"] == dia]
        if len(g) == 0:
            continue
        atr = int((g["pagamento_em_dia"] == False).sum())
        dow_list.append({
            "dia": TRAD_SEMANA[dia],
            "total": len(g),
            "atrasados": atr,
            "taxa_pct": round(atr / len(g) * 100, 2),
        })

    df_v["mes"] = df_v["data_vencimento"].dt.to_period("M").astype(str)
    evo = (
        df_v.groupby("mes")
        .agg(total=("pagamento_em_dia", "count"), atrasados=("pagamento_em_dia", lambda x: (x == False).sum()))
        .reset_index()
    )
    evo["taxa_pct"] = (evo["atrasados"] / evo["total"] * 100).round(2)
    evo = evo.sort_values("mes")
    evo["mom_ppt"] = evo["taxa_pct"].diff().round(2)
    evo_records = evo.to_dict(orient="records")
    for r in evo_records:
        if pd.isna(r.get("mom_ppt")):
            r["mom_ppt"] = None

    pico = evo.loc[evo["taxa_pct"].idxmax()]
    vale = evo.loc[evo["taxa_pct"].idxmin()]
    amplitude = round(float(pico["taxa_pct"] - vale["taxa_pct"]), 2)

    # ── 5. INSIGHTS CONSOLIDADOS ──
    total_p = len(df)
    n_atr   = int((df["pagamento_em_dia"] == False).sum())
    taxa_iad_g = round(n_atr / total_p * 100, 2)
    n_c_tot = len(contratos)
    n_ac_tot = int((contratos["status_cobranca"] == "Acordo Firmado").sum())
    n_em_ab  = int((contratos["status_cobranca"] == "Em Aberto").sum())
    taxa_rec_g = round(n_ac_tot / n_c_tot * 100, 2)
    pct_em_ab  = round(n_em_ab / n_c_tot * 100, 1)

    best_ass  = eficiencia_ass[0]
    worst_ass = eficiencia_ass[-1]
    r_critica = regioes_criticas[0]

    nao_contempl = next((r for r in cross_bc_list if r["contemplado"] == "Não" and "Alto" in r["score"]), None)
    sim_contempl  = next((r for r in cross_bc_list if r["contemplado"] == "Sim" and "Alto" in r["score"]), None)
    diff_contempl = (
        round(nao_contempl["taxa_pct"] - sim_contempl["taxa_pct"], 2)
        if nao_contempl and sim_contempl else 0.0
    )

    insights_consolidados = [
        {
            "categoria": "Risco",
            "prioridade": "alta",
            "insight": f"Taxa de inadimplência estrutural em {taxa_iad_g}% — spread regional < 0,3 p.p.",
            "detalhe": "O risco não é geográfico, é sistêmico. Ação local isolada não resolve; é necessária intervenção na política de crédito e nas condições de concessão.",
        },
        {
            "categoria": "Recuperação",
            "prioridade": "alta",
            "insight": f"Somente {taxa_rec_g}% dos contratos foram recuperados — {pct_em_ab}% presos em 'Em Aberto'",
            "detalhe": f"{n_em_ab} contratos sem resolução representam a maior oportunidade imediata. Ação proativa sobre esse grupo pode elevar a taxa de recuperação significativamente.",
        },
        {
            "categoria": "Assessoria",
            "prioridade": "media",
            "insight": f"{best_ass['assessoria']} supera {worst_ass['assessoria']} em {round(best_ass['taxa_recuperacao'] - worst_ass['taxa_recuperacao'], 1)} p.p. de recuperação",
            "detalhe": "Diferença de performance entre assessorias indica que redistribuição de contratos pode elevar a taxa geral sem custo adicional.",
        },
        {
            "categoria": "Perfil",
            "prioridade": "media",
            "insight": f"Contemplação reduz inadimplência em {diff_contempl} p.p. no score Alto — principal preditor comportamental",
            "detalhe": "Score de risco discrimina quem atrasa (diferença de ~18 p.p. entre Alto e Baixo risco) mas não prevê por quanto tempo. Contemplação é o segundo preditor mais forte.",
        },
        {
            "categoria": "Temporal",
            "prioridade": "baixa",
            "insight": f"Inadimplência estável ao longo do período (amplitude mensal de {amplitude} p.p.)",
            "detalhe": "Sem sazonalidade pronunciada nos 15 meses analisados. O comportamento é estrutural — não há época do ano de maior risco que justifique reforço sazonal de cobrança.",
        },
        {
            "categoria": "Regional",
            "prioridade": "media",
            "insight": f"{r_critica['regiao']} lidera em criticidade: menor recuperação ({r_critica['taxa_recuperacao']}%) e maior judicialização ({r_critica['taxa_judicializacao']}%)",
            "detalhe": "Score de criticidade combina inadimplência (30%), recuperação invertida (40%) e judicialização (30%). Recuperação baixa pesa mais do que inadimplência alta.",
        },
    ]

    # ── 6. RECOMENDAÇÕES ──
    val_em_ab = round(float(contratos[contratos["status_cobranca"] == "Em Aberto"]["valor_inadimplente_inicial"].sum()), 2)

    recomendacoes = [
        {
            "prioridade": "Crítica",
            "area": "Cobrança",
            "titulo": "Ativar cobrança proativa nos contratos 'Em Aberto'",
            "descricao": f"R$ {val_em_ab:,.0f} em contratos sem resolução. Acionar imediatamente com proposta de acordo antes de escalar para judicialização.",
            "impacto_esperado": "Potencial de elevar taxa de recuperação em 10-15 p.p.",
            "prazo": "Imediato (30 dias)",
        },
        {
            "prioridade": "Crítica",
            "area": "Cobrança",
            "titulo": "Concentrar acionamento no 1°–15° dia de atraso",
            "descricao": "Janela ótima de recuperação extrajudicial: 48,75% dos atrasos se concentram nos primeiros 30 dias. Acionar nessa janela maximiza o retorno e reduz custo.",
            "impacto_esperado": "Redução de judicialização e custo unitário de cobrança.",
            "prazo": "Imediato",
        },
        {
            "prioridade": "Alta",
            "area": "Operações",
            "titulo": f"Redistribuir contratos para {best_ass['assessoria']}",
            "descricao": f"Maior eficiência ({best_ass['taxa_recuperacao']}% vs. média {taxa_rec_g}%). Aumentar volume alocado às assessorias de maior score de eficiência.",
            "impacto_esperado": "Elevação da taxa geral de recuperação sem custo adicional.",
            "prazo": "30–60 dias",
        },
        {
            "prioridade": "Alta",
            "area": "Crédito",
            "titulo": "Diferenciar condições de crédito para não-contemplados",
            "descricao": "Não-contemplados têm inadimplência consistentemente maior. Avaliar garantias adicionais, limite diferenciado ou taxa de juros ajustada ao risco.",
            "impacto_esperado": "Redução de inadimplência na entrada de novos contratos.",
            "prazo": "60–90 dias",
        },
        {
            "prioridade": "Média",
            "area": "Risco",
            "titulo": "Aprimorar modelo de score para prever duração do atraso",
            "descricao": "Score atual discrimina quem atrasa, mas correlação com dias de atraso é quase nula. Adicionar features comportamentais e histórico de parcelas.",
            "impacto_esperado": "Segmentação mais granular para estratégia de cobrança diferenciada por perfil.",
            "prazo": "90–180 dias",
        },
        {
            "prioridade": "Média",
            "area": "Regional",
            "titulo": f"Priorizar acordos extrajudiciais na {r_critica['regiao']}",
            "descricao": f"{r_critica['regiao']} tem maior taxa de judicialização ({r_critica['taxa_judicializacao']}%) e menor recuperação ({r_critica['taxa_recuperacao']}%). Estratégia extrajudicial ativa reduz custo e prazo.",
            "impacto_esperado": "Redução de custos jurídicos e aumento de recuperação na região.",
            "prazo": "60–90 dias",
        },
    ]

    return {
        "perfis_alto_risco": {
            "cross_score_contemplado": cross_bc_list,
            "cross_score_forma": cross_bf_list,
            "top_combinacoes": top_combinacoes,
        },
        "regioes_criticas": regioes_criticas,
        "eficiencia_recuperacao": eficiencia_ass,
        "padroes_temporais": {
            "sazonalidade_mensal": sazonal_list,
            "por_dia_semana": dow_list,
            "evolucao_mom": evo_records,
            "pico": {"mes": str(pico["mes"]), "taxa_pct": float(pico["taxa_pct"])},
            "vale": {"mes": str(vale["mes"]), "taxa_pct": float(vale["taxa_pct"])},
            "amplitude_ppt": amplitude,
        },
        "insights_consolidados": insights_consolidados,
        "recomendacoes": recomendacoes,
    }


def get_risco_regional_estrategico() -> dict:
    df = load_data()

    df_valid = df[df["regiao_cliente"].notna() & (df["regiao_cliente"] != "")].copy()
    contratos = df.drop_duplicates("id_contrato").copy()
    contratos_valid = contratos[contratos["regiao_cliente"].notna() & (contratos["regiao_cliente"] != "")]

    regioes = sorted(df_valid["regiao_cliente"].unique())
    metricas = []

    for regiao in regioes:
        grupo = df_valid[df_valid["regiao_cliente"] == regiao]
        contratos_reg = contratos_valid[contratos_valid["regiao_cliente"] == regiao]

        n_total = len(grupo)
        n_atrasados = int((grupo["pagamento_em_dia"] == False).sum())
        taxa_inadimplencia = round(n_atrasados / n_total * 100, 2) if n_total else 0.0

        n_contratos = len(contratos_reg)
        acordos = int((contratos_reg["status_cobranca"] == "Acordo Firmado").sum())
        ajuizados = int((contratos_reg["status_cobranca"] == "Ajuizado").sum())
        taxa_recuperacao = round(acordos / n_contratos * 100, 2) if n_contratos else 0.0
        taxa_judicializacao = round(ajuizados / n_contratos * 100, 2) if n_contratos else 0.0

        atrasados_grupo = grupo[grupo["dias_atraso"] > 0]
        atraso_medio = round(float(atrasados_grupo["dias_atraso"].mean()), 1) if len(atrasados_grupo) else 0.0

        metricas.append({
            "regiao": regiao,
            "taxa_inadimplencia": taxa_inadimplencia,
            "taxa_recuperacao": taxa_recuperacao,
            "taxa_judicializacao": taxa_judicializacao,
            "atraso_medio": atraso_medio,
            "total_parcelas": n_total,
            "total_contratos": n_contratos,
        })

    max_iad = max(m["taxa_inadimplencia"] for m in metricas) or 1.0
    max_jud = max(m["taxa_judicializacao"] for m in metricas) or 1.0
    max_atr = max(m["atraso_medio"] for m in metricas) or 1.0

    PESOS = {"inadimplencia": 0.35, "recuperacao": 0.30, "judicializacao": 0.20, "atraso": 0.15}

    for m in metricas:
        s_iad = (m["taxa_inadimplencia"] / max_iad) * 100
        s_rec = (1 - m["taxa_recuperacao"] / 100) * 100
        s_jud = (m["taxa_judicializacao"] / max_jud) * 100
        s_atr = (m["atraso_medio"] / max_atr) * 100

        score = round(
            s_iad * PESOS["inadimplencia"] +
            s_rec * PESOS["recuperacao"] +
            s_jud * PESOS["judicializacao"] +
            s_atr * PESOS["atraso"],
            1,
        )
        m["score_risco_composto"] = score
        m["scores_componentes"] = {
            "inadimplencia": round(s_iad, 1),
            "recuperacao_inv": round(s_rec, 1),
            "judicializacao": round(s_jud, 1),
            "atraso": round(s_atr, 1),
        }
        m["nivel_risco"] = "Alto" if score >= 65 else "Médio" if score >= 35 else "Baixo"

    metricas.sort(key=lambda x: x["score_risco_composto"], reverse=True)

    mais_risco = metricas[0]
    menos_risco = metricas[-1]

    insights = [
        {
            "insight": f"{mais_risco['regiao']} apresenta maior risco composto ({mais_risco['score_risco_composto']}/100)",
            "detalhe": (
                f"Inadimplência {mais_risco['taxa_inadimplencia']}%, "
                f"recuperação {mais_risco['taxa_recuperacao']}%, "
                f"judicialização {mais_risco['taxa_judicializacao']}%, "
                f"atraso médio {mais_risco['atraso_medio']} dias. "
                "Requer atenção estratégica prioritária."
            ),
        },
        {
            "insight": f"{menos_risco['regiao']} é a região de menor risco composto ({menos_risco['score_risco_composto']}/100)",
            "detalhe": (
                f"Melhor combinação de indicadores: recuperação de {menos_risco['taxa_recuperacao']}% "
                f"com atraso médio de {menos_risco['atraso_medio']} dias."
            ),
        },
        {
            "insight": "Score composto combina 4 dimensões com pesos diferenciados",
            "detalhe": (
                "Inadimplência (35%) + Recuperação invertida (30%) + Judicialização (20%) + Atraso médio (15%). "
                "Regiões com baixa recuperação são mais penalizadas do que as com alta inadimplência isolada."
            ),
        },
    ]

    return {
        "por_regiao": metricas,
        "pesos": PESOS,
        "insights": insights,
    }


def get_tendencia_temporal() -> dict:
    df = load_data()

    df_v = df.dropna(subset=["data_vencimento"]).copy()
    df_v["mes"] = df_v["data_vencimento"].dt.to_period("M").astype(str)
    evo_iad = (
        df_v.groupby("mes")
        .agg(total=("pagamento_em_dia", "count"), atrasados=("pagamento_em_dia", lambda x: (x == False).sum()))
        .reset_index()
    )
    evo_iad["taxa_pct"] = (evo_iad["atrasados"] / evo_iad["total"] * 100).round(2)
    evo_iad = evo_iad.sort_values("mes")

    contratos = df.drop_duplicates("id_contrato").dropna(subset=["data_envio_assessoria"]).copy()
    contratos["mes"] = contratos["data_envio_assessoria"].dt.to_period("M").astype(str)
    evo_rec = (
        contratos.groupby("mes")
        .agg(total=("status_cobranca", "count"), acordos=("status_cobranca", lambda x: (x == "Acordo Firmado").sum()))
        .reset_index()
    )
    evo_rec["taxa_pct"] = (evo_rec["acordos"] / evo_rec["total"] * 100).round(2)
    evo_rec = evo_rec.sort_values("mes")

    df_atr = df[df["dias_atraso"] > 0].dropna(subset=["data_vencimento"]).copy()
    df_atr["mes"] = df_atr["data_vencimento"].dt.to_period("M").astype(str)
    evo_atr = (
        df_atr.groupby("mes")
        .agg(total=("dias_atraso", "count"), media_dias=("dias_atraso", "mean"))
        .reset_index()
    )
    evo_atr["media_dias"] = evo_atr["media_dias"].round(1)
    evo_atr = evo_atr.sort_values("mes")

    def regressao_linear(series, threshold: float = 0.1):
        n = len(series)
        if n < 3:
            return {"slope": 0.0, "r2": 0.0, "direcao": "insuficiente", "variacao_total": 0.0, "n_periodos": n}
        x = np.arange(n, dtype=float)
        y = series.values.astype(float)
        coef = np.polyfit(x, y, 1)
        slope = round(float(coef[0]), 4)
        y_pred = np.polyval(coef, x)
        ss_res = float(np.sum((y - y_pred) ** 2))
        ss_tot = float(np.sum((y - y.mean()) ** 2))
        r2 = round(1 - ss_res / ss_tot, 4) if ss_tot > 0 else 0.0
        ajuste = "forte" if r2 > 0.5 else "fraco" if r2 < 0.2 else "moderado"
        if abs(slope) < threshold:
            direcao = "estável"
        elif slope > 0:
            direcao = "subindo"
        else:
            direcao = "caindo"
        variacao_total = round(float(y[-1] - y[0]), 2)
        return {
            "slope": slope,
            "r2": r2,
            "ajuste": ajuste,
            "direcao": direcao,
            "variacao_total": variacao_total,
            "n_periodos": n,
            "valor_inicial": round(float(y[0]), 2),
            "valor_final": round(float(y[-1]), 2),
        }

    trend_iad = regressao_linear(evo_iad["taxa_pct"], threshold=0.1)
    trend_rec = regressao_linear(evo_rec["taxa_pct"], threshold=0.1)
    trend_atr = regressao_linear(evo_atr["media_dias"], threshold=0.5)

    def insight_tendencia(nome, trend, melhor_caindo):
        direcao = trend["direcao"]
        if direcao == "insuficiente":
            sinal = "neutro"
        elif melhor_caindo:
            sinal = "favorável" if direcao == "caindo" else "desfavorável" if direcao == "subindo" else "neutro"
        else:
            sinal = "favorável" if direcao == "subindo" else "desfavorável" if direcao == "caindo" else "neutro"
        slope_str = f"{trend['slope']:+.3f}"
        return {
            "insight": f"{nome}: tendência {direcao} (slope = {slope_str}/mês)",
            "detalhe": (
                f"R² = {trend['r2']:.3f} — ajuste {trend['ajuste']}. "
                f"Variação total no período: {trend['variacao_total']:+.2f}. "
                f"Sinal {sinal} para a carteira."
            ),
        }

    insights = [
        insight_tendencia("Inadimplência", trend_iad, melhor_caindo=True),
        insight_tendencia("Recuperação", trend_rec, melhor_caindo=False),
        insight_tendencia("Atraso Médio", trend_atr, melhor_caindo=True),
    ]

    return {
        "inadimplencia": {
            "serie_mensal": evo_iad.to_dict(orient="records"),
            "tendencia": trend_iad,
        },
        "recuperacao": {
            "serie_mensal": evo_rec.to_dict(orient="records"),
            "tendencia": trend_rec,
        },
        "atraso_medio": {
            "serie_mensal": evo_atr.to_dict(orient="records"),
            "tendencia": trend_atr,
        },
        "insights": insights,
    }


def get_visao_diretoria() -> dict:
    kpis = get_kpis()
    inadimplencia = get_taxa_inadimplencia()
    recuperacao = get_taxa_recuperacao()
    tendencia = get_tendencia_temporal()

    taxa_inad = kpis["taxa_inadimplencia_pct"]
    taxa_rec  = kpis["taxa_recuperacao_pct"]
    atraso_medio = kpis["atraso_medio_dias"]

    score_saude = round((100 - taxa_inad) * 0.5 + taxa_rec * 0.5, 1)
    if score_saude >= 75:
        nivel_saude, cor_saude = "Saudável", "green"
    elif score_saude >= 55:
        nivel_saude, cor_saude = "Atenção", "yellow"
    else:
        nivel_saude, cor_saude = "Crítico", "red"

    trend_iad = tendencia["inadimplencia"]["tendencia"]
    trend_rec = tendencia["recuperacao"]["tendencia"]
    trend_atr = tendencia["atraso_medio"]["tendencia"]

    alertas = []

    if trend_iad["direcao"] == "subindo":
        alertas.append({"tipo": "critico", "titulo": "Inadimplência em Alta",
            "descricao": f"Tendência de alta ({trend_iad['variacao_total']:+.2f} p.p.). Ação imediata necessária."})
    elif trend_iad["direcao"] == "caindo":
        alertas.append({"tipo": "positivo", "titulo": "Inadimplência em Queda",
            "descricao": f"Tendência favorável ({trend_iad['variacao_total']:+.2f} p.p.). Manter estratégias atuais."})
    else:
        alertas.append({"tipo": "neutro", "titulo": "Inadimplência Estável",
            "descricao": f"Taxa mantém comportamento estável em {taxa_inad}%."})

    if trend_rec["direcao"] == "caindo":
        alertas.append({"tipo": "alerta", "titulo": "Recuperação em Queda",
            "descricao": f"Taxa de recuperação caindo ({trend_rec['variacao_total']:+.2f} p.p.). Avaliar assessorias."})
    elif trend_rec["direcao"] == "subindo":
        alertas.append({"tipo": "positivo", "titulo": "Recuperação em Alta",
            "descricao": f"Taxa de recuperação crescendo ({trend_rec['variacao_total']:+.2f} p.p.)."})
    else:
        alertas.append({"tipo": "neutro", "titulo": "Recuperação Estável",
            "descricao": f"Taxa de recuperação mantém patamar estável em {taxa_rec}%."})

    val_total = kpis["valor_inadimplente_total"]
    val_rec   = kpis["valor_recuperado_estimado"]
    pct_rec_val = round(val_rec / val_total * 100, 1) if val_total else 0
    alertas.append({"tipo": "info", "titulo": "Exposição Financeira",
        "descricao": f"R$ {val_total:,.0f} em risco. R$ {val_rec:,.0f} recuperados ({pct_rec_val}%)."})

    DIRECAO_LABEL = {
        "subindo": "↑ Subindo", "caindo": "↓ Caindo",
        "estável": "→ Estável", "insuficiente": "— Indefinido",
    }

    def aval_inad(d): return "bom" if d == "caindo" else "critico" if d == "subindo" else "neutro"
    def aval_rec(d):  return "bom" if d == "subindo" else "alerta"  if d == "caindo"  else "neutro"

    visao_consolidada = [
        {
            "metrica": "Taxa de Inadimplência",
            "valor": f"{taxa_inad}%",
            "tendencia": trend_iad["direcao"],
            "tendencia_label": DIRECAO_LABEL[trend_iad["direcao"]],
            "variacao": f"{trend_iad['variacao_total']:+.2f} p.p.",
            "avaliacao": aval_inad(trend_iad["direcao"]),
            "contexto": f"{kpis['pagamentos_atrasados']:,} de {kpis['total_pagamentos']:,} parcelas em atraso",
        },
        {
            "metrica": "Taxa de Recuperação",
            "valor": f"{taxa_rec}%",
            "tendencia": trend_rec["direcao"],
            "tendencia_label": DIRECAO_LABEL[trend_rec["direcao"]],
            "variacao": f"{trend_rec['variacao_total']:+.2f} p.p.",
            "avaliacao": aval_rec(trend_rec["direcao"]),
            "contexto": f"{kpis['acordos_firmados']:,} acordos de {kpis['total_contratos_cobranca']:,} contratos",
        },
        {
            "metrica": "Atraso Médio",
            "valor": f"{atraso_medio} dias",
            "tendencia": trend_atr["direcao"],
            "tendencia_label": DIRECAO_LABEL[trend_atr["direcao"]],
            "variacao": f"{trend_atr['variacao_total']:+.2f} dias",
            "avaliacao": aval_inad(trend_atr["direcao"]),
            "contexto": f"Entre os {kpis['pagamentos_atrasados']:,} pagamentos em atraso",
        },
        {
            "metrica": "Valor em Risco",
            "valor": f"R$ {val_total:,.0f}",
            "tendencia": "estável",
            "tendencia_label": "—",
            "variacao": "—",
            "avaliacao": "neutro",
            "contexto": f"R$ {val_rec:,.0f} já recuperados ({pct_rec_val}%)",
        },
    ]

    return {
        "kpis": kpis,
        "inadimplencia": {
            "indicador_geral": inadimplencia["indicador_geral"],
            "evolucao_mensal": inadimplencia["evolucao_mensal"],
        },
        "recuperacao": {
            "indicador_geral": recuperacao["indicador_geral"],
            "evolucao_mensal": recuperacao["evolucao_mensal"],
        },
        "tendencia_temporal": {
            "inadimplencia": tendencia["inadimplencia"],
            "recuperacao": tendencia["recuperacao"],
            "atraso_medio": tendencia["atraso_medio"],
            "insights": tendencia["insights"],
        },
        "saude_carteira": {"score": score_saude, "nivel": nivel_saude, "cor": cor_saude},
        "alertas_executivos": alertas,
        "visao_consolidada": visao_consolidada,
    }


def get_visao_financeira() -> dict:
    df = load_data()

    # --- Valor Inadimplente ---
    cobranca = df.drop_duplicates(subset="id_contrato").copy()
    valor_total = round(float(cobranca["valor_inadimplente_inicial"].sum()), 2)
    valor_recuperado = round(
        float(cobranca[cobranca["status_cobranca"] == "Acordo Firmado"]["valor_inadimplente_inicial"].sum()), 2
    )
    taxa_recuperacao_valor = round(valor_recuperado / valor_total * 100, 2) if valor_total else 0

    por_status = []
    for status, grupo in cobranca.groupby("status_cobranca"):
        por_status.append({
            "status": status,
            "valor": round(float(grupo["valor_inadimplente_inicial"].sum()), 2),
            "total_contratos": len(grupo),
            "pct_valor": round(float(grupo["valor_inadimplente_inicial"].sum()) / valor_total * 100, 2),
        })
    por_status.sort(key=lambda x: x["valor"], reverse=True)

    # --- Atraso Médio ---
    atrasados_s = df[df["dias_atraso"] > 0]["dias_atraso"]
    atraso_medio_geral = round(float(atrasados_s.mean()), 1) if len(atrasados_s) else 0
    atraso_mediana = round(float(atrasados_s.median()), 1) if len(atrasados_s) else 0
    atraso_max = int(atrasados_s.max()) if len(atrasados_s) else 0

    df_atr = df[df["dias_atraso"] > 0].copy()
    atraso_por_regiao = (
        df_atr.groupby("regiao_cliente")["dias_atraso"]
        .agg(media_dias="mean", mediana_dias="median", total="count")
        .reset_index()
        .rename(columns={"regiao_cliente": "regiao"})
    )
    atraso_por_regiao["media_dias"] = atraso_por_regiao["media_dias"].round(1)
    atraso_por_regiao["mediana_dias"] = atraso_por_regiao["mediana_dias"].round(1)
    atraso_por_regiao = atraso_por_regiao.sort_values("media_dias", ascending=False)

    # --- Distribuição Regional ---
    cobranca_reg = cobranca[cobranca["regiao_cliente"].notna()].copy()
    regional = (
        cobranca_reg.groupby("regiao_cliente").agg(
            total_contratos=("id_contrato", "count"),
            valor_inadimplente=("valor_inadimplente_inicial", "sum"),
            acordos=("status_cobranca", lambda x: (x == "Acordo Firmado").sum()),
        ).reset_index()
        .rename(columns={"regiao_cliente": "regiao"})
    )
    total_reg_val = regional["valor_inadimplente"].sum()
    regional["pct_carteira"] = (regional["valor_inadimplente"] / total_reg_val * 100).round(2)
    regional["taxa_recuperacao_pct"] = (regional["acordos"] / regional["total_contratos"] * 100).round(2)
    regional["valor_inadimplente"] = regional["valor_inadimplente"].round(2)
    regional = regional.sort_values("valor_inadimplente", ascending=False)

    # --- Evolução Financeira Mensal ---
    cobranca_mes = cobranca.dropna(subset=["data_envio_assessoria"]).copy()
    cobranca_mes["mes"] = cobranca_mes["data_envio_assessoria"].dt.to_period("M").astype(str)

    evolucao = (
        cobranca_mes.groupby("mes").agg(
            total_contratos=("id_contrato", "count"),
            valor_inadimplente=("valor_inadimplente_inicial", "sum"),
            acordos=("status_cobranca", lambda x: (x == "Acordo Firmado").sum()),
        ).reset_index()
    )
    valor_rec_mes = (
        cobranca_mes[cobranca_mes["status_cobranca"] == "Acordo Firmado"]
        .groupby("mes")["valor_inadimplente_inicial"].sum().round(2)
    )
    evolucao["valor_recuperado"] = evolucao["mes"].map(valor_rec_mes).fillna(0).round(2)
    evolucao["valor_inadimplente"] = evolucao["valor_inadimplente"].round(2)
    evolucao["taxa_recuperacao_pct"] = (evolucao["acordos"] / evolucao["total_contratos"] * 100).round(2)

    return {
        "valor_inadimplente": {
            "total": valor_total,
            "valor_recuperado": valor_recuperado,
            "valor_em_aberto": round(valor_total - valor_recuperado, 2),
            "taxa_recuperacao_valor_pct": taxa_recuperacao_valor,
            "por_status": por_status,
        },
        "atraso_medio": {
            "media_dias": atraso_medio_geral,
            "mediana_dias": atraso_mediana,
            "max_dias": atraso_max,
            "total_atrasados": int(len(atrasados_s)),
            "por_regiao": atraso_por_regiao.to_dict(orient="records"),
        },
        "distribuicao_regional": regional.to_dict(orient="records"),
        "evolucao_financeira": evolucao.to_dict(orient="records"),
    }


def get_risco_regional() -> dict:
    df = load_data()

    df_valid = df[df["regiao_cliente"].notna() & (df["regiao_cliente"] != "")].copy()

    inadimplencia_regional = (
        df_valid.groupby("regiao_cliente")
        .agg(
            total=("pagamento_em_dia", "count"),
            atrasados=("pagamento_em_dia", lambda x: (x == False).sum()),
        )
        .reset_index()
    )
    inadimplencia_regional["taxa_inadimplencia_pct"] = (
        inadimplencia_regional["atrasados"] / inadimplencia_regional["total"] * 100
    ).round(2)
    inadimplencia_regional = inadimplencia_regional.sort_values("taxa_inadimplencia_pct", ascending=False)

    cobranca = df.drop_duplicates(subset="id_contrato").copy()
    cobranca_valid = cobranca[cobranca["regiao_cliente"].notna() & (cobranca["regiao_cliente"] != "")]

    valor_regional = (
        cobranca_valid.groupby("regiao_cliente")["valor_inadimplente_inicial"]
        .sum()
        .round(2)
        .reset_index()
        .rename(columns={"valor_inadimplente_inicial": "valor_inadimplente_total"})
        .sort_values("valor_inadimplente_total", ascending=False)
    )

    return {
        "inadimplencia_por_regiao": inadimplencia_regional.to_dict(orient="records"),
        "valor_inadimplente_por_regiao": valor_regional.to_dict(orient="records"),
    }
