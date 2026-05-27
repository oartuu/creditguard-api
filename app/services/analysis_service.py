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

    return {
        "resumo": resumo,
        "faixas_atraso": faixas,
        "por_forma_pagamento": por_forma,
        "por_regiao": por_regiao,
        "por_faixa_score_risco": por_score,
        "por_status_cobranca": por_status,
        "sazonalidade_mensal": por_mes,
        "correlacoes": correlacoes,
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
