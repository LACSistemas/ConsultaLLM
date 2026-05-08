import openpyxl


def extract_text(file_path: str) -> str:
    wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    rows = []
    for sheet in wb.worksheets:
        rows.append(f"=== Planilha: {sheet.title} ===")
        for row in sheet.iter_rows(values_only=True):
            rows.append("\t".join("" if c is None else str(c) for c in row))
    wb.close()
    return "\n".join(rows)
