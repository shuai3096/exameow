use super::html::strip_html;
use super::ParserError;
use quick_xml::events::Event;
use quick_xml::Reader;
use std::collections::HashMap;
use std::io::Read;

pub fn extract_epub(path: &str) -> Result<String, ParserError> {
    let file = std::fs::File::open(path)?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| ParserError::Parse(format!("invalid epub zip: {e}")))?;

    let mut chapters: Vec<String> = Vec::new();
    if let Ok(container) = read_zip_string(&mut archive, "META-INF/container.xml") {
        if let Some(opf_path) = container_opf_path(&container) {
            if let Ok(opf) = read_zip_string(&mut archive, &opf_path) {
                let base = opf_path
                    .rsplit_once('/')
                    .map(|(d, _)| format!("{d}/"))
                    .unwrap_or_default();
                chapters = spine_chapter_paths(&opf, &base);
            }
        }
    }
    if chapters.is_empty() {
        chapters = (0..archive.len())
            .filter_map(|i| archive.by_index(i).ok().map(|f| f.name().to_string()))
            .filter(|n| n.ends_with(".xhtml") || n.ends_with(".html") || n.ends_with(".htm"))
            .collect();
        chapters.sort();
    }

    let mut out = String::new();
    for ch in &chapters {
        if let Ok(xml) = read_zip_string(&mut archive, ch) {
            let t = strip_html(&xml);
            if !t.trim().is_empty() {
                out.push_str(t.trim());
                out.push_str("\n\n");
            }
        }
    }
    if out.trim().is_empty() {
        return Err(ParserError::Parse("no text found in epub".to_string()));
    }
    Ok(out.trim_end().to_string())
}

fn read_zip_string(
    archive: &mut zip::ZipArchive<std::fs::File>,
    name: &str,
) -> Result<String, ParserError> {
    let mut s = String::new();
    archive
        .by_name(name)
        .map_err(|e| ParserError::Parse(format!("zip error: {e}")))?
        .read_to_string(&mut s)?;
    Ok(s)
}

fn container_opf_path(xml: &str) -> Option<String> {
    let mut reader = Reader::from_str(xml);
    let mut buf = Vec::new();
    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) | Ok(Event::Empty(ref e)) => {
                if e.local_name().as_ref() == b"rootfile" {
                    for attr in e.attributes().flatten() {
                        if attr.key.local_name().as_ref() == b"full-path" {
                            return Some(String::from_utf8_lossy(&attr.value).to_string());
                        }
                    }
                }
            }
            Ok(Event::Eof) | Err(_) => return None,
            _ => {}
        }
        buf.clear();
    }
}

fn spine_chapter_paths(opf: &str, base: &str) -> Vec<String> {
    let mut manifest: HashMap<String, String> = HashMap::new();
    let mut spine: Vec<String> = Vec::new();
    let mut reader = Reader::from_str(opf);
    let mut buf = Vec::new();
    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) | Ok(Event::Empty(ref e)) => {
                match e.local_name().as_ref() {
                    b"item" => {
                        let mut id = None;
                        let mut href = None;
                        for attr in e.attributes().flatten() {
                            match attr.key.local_name().as_ref() {
                                b"id" => id = Some(String::from_utf8_lossy(&attr.value).to_string()),
                                b"href" => href = Some(String::from_utf8_lossy(&attr.value).to_string()),
                                _ => {}
                            }
                        }
                        if let (Some(id), Some(href)) = (id, href) {
                            manifest.insert(id, href);
                        }
                    }
                    b"itemref" => {
                        for attr in e.attributes().flatten() {
                            if attr.key.local_name().as_ref() == b"idref" {
                                spine.push(String::from_utf8_lossy(&attr.value).to_string());
                            }
                        }
                    }
                    _ => {}
                }
            }
            Ok(Event::Eof) | Err(_) => break,
            _ => {}
        }
        buf.clear();
    }
    spine
        .into_iter()
        .filter_map(|id| manifest.get(&id).map(|h| format!("{base}{h}")))
        .collect()
}
