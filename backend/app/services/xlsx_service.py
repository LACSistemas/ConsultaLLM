import openpyxl


def extract_text(file_path: str, *, max_rows: int, max_chars: int) -> str:
    workbook = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    lines: list[str] = []
    row_count = 0
    char_count = 0

    try:
        for sheet in workbook.worksheets:
            heading = f"=== Planilha: {sheet.title} ==="
            if char_count + len(heading) + 1 > max_chars:
                break
            lines.append(heading)
            char_count += len(heading) + 1

            for row in sheet.iter_rows(values_only=True):
                row_count += 1
                if row_count > max_rows:
                    raise ValueError(f"Planilha excede o limite de {max_rows} linhas")

                line = "\t".join("" if cell is None else str(cell) for cell in row)
                remaining = max_chars - char_count
                if remaining <= 0:
                    return "\n".join(lines)
                lines.append(line[:remaining])
                char_count += min(len(line), remaining) + 1
    finally:
        workbook.close()

    return "\n".join(lines)
