from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"


def normalize_columns(df):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    return df


def convert_currency(value):

    if pd.isna(value):
        return 0

    value = str(value)

    value = (
        value
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .strip()
    )

    try:
        return float(value)
    except:
        return 0


def normalize_region(value):

    if pd.isna(value):
        return "Nao informado"

    value = (
        str(value)
        .strip()
        .lower()
    )

    mapping = {
        "norte": "Norte",
        "nordeste": "Nordeste",
        "sudeste": "Sudeste",
        "sul": "Sul",
        "centro oeste": "Centro-Oeste",
        "centro-oeste": "Centro-Oeste",
        "centrooeste": "Centro-Oeste"
    }

    return mapping.get(value, value.title())


def prepare_dataset():

    pagamentos_path = RAW_DIR / "fluxo_pagamentos.xlsx"
    cobranca_path = RAW_DIR / "cobranca_assessorias.csv"

    pagamentos_df = pd.read_excel(pagamentos_path)
    cobranca_df = pd.read_csv(cobranca_path)

    # =========================
    # PADRONIZAÇÃO DE COLUNAS
    # =========================

    pagamentos_df = normalize_columns(pagamentos_df)
    cobranca_df = normalize_columns(cobranca_df)

    # =========================
    # REMOVER DUPLICADOS
    # =========================

    pagamentos_df = pagamentos_df.drop_duplicates()
    cobranca_df = cobranca_df.drop_duplicates()

    # =========================
    # TRATAMENTO DE DATAS
    # =========================

    pagamentos_df["data_vencimento"] = pd.to_datetime(
        pagamentos_df["data_vencimento"],
        errors="coerce"
    )

    pagamentos_df["data_pagamento"] = pd.to_datetime(
        pagamentos_df["data_pagamento"],
        errors="coerce"
    )

    cobranca_df["data_envio_assessoria"] = pd.to_datetime(
        cobranca_df["data_envio_assessoria"],
        errors="coerce"
    )

    # =========================
    # PADRONIZAÇÃO DE REGIÕES
    # =========================

    if "regiao_cliente" in cobranca_df.columns:
        cobranca_df["regiao_cliente"] = (
            cobranca_df["regiao_cliente"]
            .apply(normalize_region)
        )

    # =========================
    # VALORES MONETÁRIOS
    # =========================

    cobranca_df["valor_inadimplente_inicial"] = (
        cobranca_df["valor_inadimplente_inicial"]
        .apply(convert_currency)
    )

    pagamentos_df["valor_parcela"] = pd.to_numeric(
        pagamentos_df["valor_parcela"],
        errors="coerce"
    )

    pagamentos_df["valor_pago"] = pd.to_numeric(
        pagamentos_df["valor_pago"],
        errors="coerce"
    )

    # =========================
    # SCORE DE RISCO
    # =========================

    cobranca_df["score_interno_risco"] = pd.to_numeric(
        cobranca_df["score_interno_risco"],
        errors="coerce"
    )

    cobranca_df["score_interno_risco"] = (
        cobranca_df["score_interno_risco"]
        .fillna(
            cobranca_df["score_interno_risco"].median()
        )
    )

    # =========================
    # FEATURE ENGINEERING
    # =========================

    pagamentos_df["dias_atraso"] = (
        pagamentos_df["data_pagamento"] -
        pagamentos_df["data_vencimento"]
    ).dt.days

    pagamentos_df["dias_atraso"] = (
        pagamentos_df["dias_atraso"]
        .fillna(0)
    )

    pagamentos_df["pagamento_em_dia"] = (
        pagamentos_df["dias_atraso"] <= 0
    )

    pagamentos_df["percentual_pago"] = (
        pagamentos_df["valor_pago"] /
        pagamentos_df["valor_parcela"]
    )

    # =========================
    # JOIN DOS DATASETS
    # =========================

    unified_df = pagamentos_df.merge(
        cobranca_df,
        on="id_contrato",
        how="left"
    )

    # =========================
    # LIMPEZA FINAL
    # =========================

    unified_df = unified_df.fillna("")

    # =========================
    # EXPORTAÇÃO
    # =========================

    PROCESSED_DIR.mkdir(exist_ok=True)

    output_path = PROCESSED_DIR / "unified_dataset.csv"

    unified_df.to_csv(output_path, index=False)

    return {
        "message": "Dataset preparado com sucesso",
        "rows": len(unified_df),
        "columns": list(unified_df.columns),
        "output": str(output_path)
    }