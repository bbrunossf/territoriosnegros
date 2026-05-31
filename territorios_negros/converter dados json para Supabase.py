# -*- coding: utf-8 -*-
"""
Created on Fri May 29 22:35:28 2026

@author: Bruno
"""

import json
import csv

# Arquivos
ARQUIVO_JSON = "dados.json"
ARQUIVO_CSV = "territorios.csv"

# Ordem das colunas desejadas
CAMPOS = [
    "id",
    "nome",
    "local",
    "palavra",
    "ano",
    "imagem",
    "camadas",
    "contexto",
    "criacao",
    "funcao",
    "transformacoes",
    "status",
    "observacao",
    "descricao",
    "observar",
    "pergunta",
    "video",
    "idade_camadas",
]

# Carrega JSON
with open(ARQUIVO_JSON, "r", encoding="utf-8") as f:
    dados = json.load(f)

territorios = dados.get("territorios", {})

with open(ARQUIVO_CSV, "w", newline="", encoding="utf-8-sig") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=CAMPOS)
    writer.writeheader()

    for id_territorio, item in territorios.items():

        linha = {
            "id": id_territorio,
            "nome": item.get("nome", ""),
            "local": item.get("local", ""),
            "palavra": item.get("palavra", ""),
            "ano": item.get("ano", ""),
            "imagem": item.get("imagem", ""),
            "camadas": item.get("camadas", ""),
            "contexto": item.get("contexto", ""),
            "criacao": item.get("criacao", ""),
            "funcao": item.get("funcao", ""),
            "transformacoes": item.get("transformacoes", ""),
            "status": item.get("status", ""),
            "observacao": item.get("observacao", ""),
            "descricao": item.get("descricao", ""),
            "observar": " | ".join(item.get("observar", [])),
            "pergunta": item.get("pergunta", ""),
            "video": item.get("video", ""),
            "idade_camadas": json.dumps(
                item.get("idadeCamadas", []),
                ensure_ascii=False
            ),
        }

        writer.writerow(linha)

print(f"CSV gerado com sucesso: {ARQUIVO_CSV}")