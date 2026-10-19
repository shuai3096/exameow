use super::xml_text::collect_texts;
use super::ParserError;
use std::io::Read;

pub fn extract_pptx(path: &str) -> Result<String, ParserError> {
    let file = std::fs::File::open(path)?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| ParserError::Parse(format!("invalid pptx zip: {e}")))?;

    let mut slide_names: Vec<String> = (0..archive.len())
        .filter_map(|i| archive.by_index(i).ok().map(|f| f.name().to_string()))
        .filter(|n| n.starts_with("ppt/slides/slide") && n.ends_with(".xml"))
        .collect();
    slide_names.sort_by_key(|n| slide_number(n));

    let mut out = String::new();
    for name in &slide_names {
        let mut xml = String::new();
        archive
            .by_name(name)
            .map_err(|e| ParserError::Parse(format!("zip error: {e}")))?
            .read_to_string(&mut xml)?;
        let texts = collect_texts(&xml, b"t")?;
        if texts.is_empty() {
            continue;
        }
        out.push_str(&format!("### Slide {}\n\n{}\n\n", slide_number(name), texts.join("\n")));
    }
    if out.trim().is_empty() {
        return Err(ParserError::Parse("no text found in pptx".to_string()));
    }
    Ok(out.trim_end().to_string())
}

fn slide_number(name: &str) -> u32 {
    name.trim_start_matches("ppt/slides/slide")
        .trim_end_matches(".xml")
        .parse()
        .unwrap_or(0)
}
