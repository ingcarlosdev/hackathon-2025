import pandas as pd

def validar_csv(file) -> dict:
    try:
        df = pd.read_csv(file, sep=None, engine="python")  # Detecta coma o tab
        df.columns = df.columns.str.strip().str.capitalize()

        columnas_requeridas = {"Lote", "Linea", "Palma", "Longitud", "Latitud"}
        if not columnas_requeridas.issubset(df.columns):
            return {
                "status": "error",
                "message": f"El CSV debe contener las columnas: {', '.join(columnas_requeridas)}"
            }

        errores = []
        coordenadas = []

        df = df.reset_index(drop=True)

        # 1️⃣ Verificar tipos y datos faltantes
        for i, row in df.iterrows():
            fila = int(i) + 1
            lote = row.get("Lote")
            linea = row.get("Linea")
            palma = row.get("Palma")
            longitud = row.get("Longitud")
            latitud = row.get("Latitud")

            # Validar faltantes
            if any(pd.isna(x) for x in [lote, linea, palma, longitud, latitud]):
                errores.append({
                    "tipo": "dato_faltante",
                    "descripcion": f"Fila {fila}: falta uno o más datos requeridos.",
                    "fila": fila
                })
                continue

            # Validar tipos
            for campo, valor in [("Linea", linea), ("Palma", palma), ("Longitud", longitud), ("Latitud", latitud)]:
                try:
                    float(valor)
                except ValueError:
                    errores.append({
                        "tipo": "dato_invalido",
                        "descripcion": f"Fila {fila}: el campo '{campo}' no es numérico ({valor}).",
                        "fila": fila
                    })
                    continue

            coordenadas.append({
                "lote": lote,
                "linea": linea,
                "palma": palma,
                "longitud": longitud,
                "latitud": latitud
            })

        # 2️⃣ Coordenadas duplicadas → agrupar todas las filas con la misma coordenada
        duplicadas = df[df.duplicated(subset=["Longitud", "Latitud"], keep=False)]
        if not duplicadas.empty:
            grupos = duplicadas.groupby(["Longitud", "Latitud"]).groups
            for (long, lat), idxs in grupos.items():
                filas = [int(i + 1) for i in idxs]
                errores.append({
                    "tipo": "coordenada_repetida",
                    "descripcion": f"Coordenada ({long}, {lat}) repetida en filas {filas}.",
                    "filas": filas
                })

        # 3️⃣ Palmas duplicadas → agrupar todas las filas con mismo Lote+Linea+Palma
        duplicadas_palma = df[df.duplicated(subset=["Lote", "Linea", "Palma"], keep=False)]
        if not duplicadas_palma.empty:
            grupos = duplicadas_palma.groupby(["Lote", "Linea", "Palma"]).groups
            for (lote, linea, palma), idxs in grupos.items():
                filas = [int(i + 1) for i in idxs]
                errores.append({
                    "tipo": "palma_repetida",
                    "descripcion": f"Palma (Lote {lote}, Línea {linea}, Palma {palma}) repetida en filas {filas}.",
                    "filas": filas
                })

        # 4️⃣ Coordenadas fuera de rango (solo si son numéricas válidas)
        try:
            df["Latitud_f"] = df["Latitud"].astype(float)
            df["Longitud_f"] = df["Longitud"].astype(float)

            fuera_rango = df[
                (df["Latitud_f"] < -90) | (df["Latitud_f"] > 90) |
                (df["Longitud_f"] < -180) | (df["Longitud_f"] > 180)
            ]
            for i, row in fuera_rango.iterrows():
                errores.append({
                    "tipo": "coordenada_fuera_rango",
                    "descripcion": f"Fila {int(i+1)}: coordenadas fuera del rango válido ({row['Longitud']}, {row['Latitud']}).",
                    "fila": int(i + 1)
                })
        except Exception:
            pass  # si no se pueden convertir, ya se reportó antes como inválido

        return {
            "status": "ok",
            "coordenadas": coordenadas,
            "errores": errores
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
