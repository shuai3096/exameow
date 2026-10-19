use super::table::{clean_cell, rows_to_markdown};
use super::ParserError;
use calamine::{open_workbook_auto, Data, Reader};

pub fn extract_excel(path: &str) -> Result<String, ParserError> {
    let mut wb = open_workbook_auto(path)
        .map_err(|e| ParserError::Parse(format!("spreadsheet open error: {e}")))?;
    let names: Vec<String> = wb.sheet_names().to_vec();
    let multi = names.len() > 1;
    let mut out = String::new();
    for name in names {
        let range = match wb.worksheet_range(&name) {
            Ok(r) => r,
            Err(_) => continue,
        };
        let mut rows: Vec<Vec<String>> = Vec::new();
        for row in range.rows() {
            let cells: Vec<String> = row
                .iter()
                .map(|d| clean_cell(&cell_to_string(d)))
                .collect();
            if cells.iter().all(|c| c.is_empty()) {
                continue;
            }
            rows.push(cells);
        }
        if rows.is_empty() {
            continue;
        }
        if multi {
            out.push_str(&format!("### {name}\n\n"));
        }
        out.push_str(&rows_to_markdown(&rows));
        out.push('\n');
    }
    if out.trim().is_empty() {
        return Err(ParserError::Parse("no data found in spreadsheet".to_string()));
    }
    Ok(out.trim_end().to_string())
}

fn cell_to_string(d: &Data) -> String {
    match d {
        Data::Empty => String::new(),
        other => other.to_string(),
    }
}
