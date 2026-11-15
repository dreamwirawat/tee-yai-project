"""Convert the Tee Yai transactions workbook into data/transactions.json.

Usage: python -X utf8 -I scripts/xlsx_to_json.py <input.xlsx> <output.json>
"""
import json
import sys

import openpyxl

KEYS = [
    "id", "ts", "branch", "pkg", "guests", "promo", "pay",
    "net", "foodCost", "bevCost", "cost", "gp", "gpPct",
]


def main(src: str, dst: str) -> None:
    ws = openpyxl.load_workbook(src, data_only=True)["Transactions"]
    rows = []
    for r in list(ws.iter_rows(values_only=True))[1:]:
        if r[0] is None:
            continue
        rows.append(dict(zip(KEYS, r[:13])))
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {len(rows)} rows -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
