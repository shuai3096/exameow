use super::table::{clean_cell, rows_to_markdown};
use super::ParserError;

pub fn extract_csv(path: &str) -> Result<String, ParserError> {
    let raw = super::txt::read_text_lossy(path)?;
    let mut rdr = ::csv::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .from_reader(raw.as_bytes());
    let mut rows: Vec<Vec<String>> = Vec::new();
    for rec in rdr.records() {
        let rec = rec.map_err(|e| ParserError::Parse(format!("csv error: {e}")))?;
        let cells: Vec<String> = rec.iter().map(clean_cell).collect();
        if cells.iter().all(|c| c.is_empty()) {
            continue;
        }
        rows.push(cells);
    }
    if rows.is_empty() {
        return Err(ParserError::Parse("file is empty".to_string()));
    }
    Ok(rows_to_markdown(&rows))
}
