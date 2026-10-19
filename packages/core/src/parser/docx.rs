use super::xml_text::collect_texts;
use super::ParserError;
use std::io::Read;

pub fn extract_docx(path: &str) -> Result<String, ParserError> {
    let file = std::fs::File::open(path)?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| ParserError::Parse(format!("invalid docx zip: {e}")))?;

    let mut doc_xml = String::new();
    archive
        .by_name("word/document.xml")
        .map_err(|e| ParserError::Parse(format!("missing document.xml: {e}")))?
        .read_to_string(&mut doc_xml)?;

    let texts = collect_texts(&doc_xml, b"t")?;
    let result = texts.join("\n");
    if result.trim().is_empty() {
        return Err(ParserError::Parse("no text found in docx".to_string()));
    }
    Ok(result)
}
