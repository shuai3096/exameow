use super::ParserError;
use quick_xml::events::Event;
use quick_xml::Reader;

pub(crate) fn collect_texts(xml: &str, target: &[u8]) -> Result<Vec<String>, ParserError> {
    let mut reader = Reader::from_str(xml);
    reader.config_mut().trim_text(true);
    let mut texts = Vec::new();
    let mut buf = Vec::new();
    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) => {
                if e.local_name().as_ref() == target {
                    if let Ok(Event::Text(ref t)) = reader.read_event_into(&mut buf) {
                        let text = t.unescape().unwrap_or_default();
                        if !text.trim().is_empty() {
                            texts.push(text.to_string());
                        }
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(ParserError::Parse(format!("xml error: {e}"))),
            _ => {}
        }
        buf.clear();
    }
    Ok(texts)
}
