from pathlib import Path
import pandas as pd

PROCESSED_PATH = Path(__file__).resolve().parent.parent / "data" / "processed" / "unified_dataset.csv"

_cache = None


def load_data() -> pd.DataFrame:
    global _cache
    if _cache is not None:
        return _cache

    df = pd.read_csv(PROCESSED_PATH)

    df["data_vencimento"] = pd.to_datetime(df["data_vencimento"], errors="coerce")
    df["data_pagamento"] = pd.to_datetime(df["data_pagamento"], errors="coerce")
    df["data_envio_assessoria"] = pd.to_datetime(df["data_envio_assessoria"], errors="coerce")
    df["pagamento_em_dia"] = df["pagamento_em_dia"].map({"True": True, "False": False, True: True, False: False})
    df["dias_atraso"] = pd.to_numeric(df["dias_atraso"], errors="coerce").fillna(0)
    df["score_interno_risco"] = pd.to_numeric(df["score_interno_risco"], errors="coerce")
    df["valor_inadimplente_inicial"] = pd.to_numeric(df["valor_inadimplente_inicial"], errors="coerce").fillna(0)

    _cache = df
    return df
