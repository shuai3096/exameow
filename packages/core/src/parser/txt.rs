use super::ParserError;

pub fn extract_txt(path: &str) -> Result<String, ParserError> {
    read_text_lossy(path)
}

pub(crate) fn read_text_lossy(path: &str) -> Result<String, ParserError> {
    let bytes = std::fs::read(path)?;
    read_text_from_bytes(&bytes)
}

pub(crate) fn read_text_from_bytes(bytes: &[u8]) -> Result<String, ParserError> {
    let text = if bytes.starts_with(&[0xFF, 0xFE]) {
        decode_or_reject(encoding_rs::UTF_16LE, bytes)?
    } else if bytes.starts_with(&[0xFE, 0xFF]) {
        decode_or_reject(encoding_rs::UTF_16BE, bytes)?
    } else if bytes.iter().take(8192).any(|&b| b == 0) {
        return Err(ParserError::Unsupported(
            "binary or unknown-encoding file".to_string(),
        ));
    } else {
        match std::str::from_utf8(bytes) {
            Ok(s) => s.to_string(),
            Err(_) => decode_or_reject(encoding_rs::GB18030, bytes)?,
        }
    };
    let text = text.trim_start_matches('\u{feff}').to_string();
    if text.trim().is_empty() {
        return Err(ParserError::Parse("file is empty".to_string()));
    }
    Ok(text)
}

fn decode_or_reject(
    encoding: &'static encoding_rs::Encoding,
    bytes: &[u8],
) -> Result<String, ParserError> {
    let (cow, _, had_errors) = encoding.decode(bytes);
    let replaced = cow.chars().filter(|&c| c == '\u{FFFD}').count();
    let total = cow.chars().count().max(1);
    if had_errors && replaced * 20 > total {
        return Err(ParserError::Unsupported(
            "binary or unknown-encoding file".to_string(),
        ));
    }
    Ok(cow.into_owned())
}
