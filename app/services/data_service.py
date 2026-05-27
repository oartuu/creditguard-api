import pandas as pd

def load_data():
    df = pd.read_csv("app/data/cobranca_assessorias.csv")

    summary = {
        "total_rows": len(df),
        "columns": list(df.columns),
        "missing_values": df.isnull().sum().to_dict()
    }

    return summary