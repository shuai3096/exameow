use super::ParserError;

pub fn extract_html(path: &str) -> Result<String, ParserError> {
    let raw = super::txt::read_text_lossy(path)?;
    let text = strip_html(&raw);
    if text.trim().is_empty() {
        return Err(ParserError::Parse("no text found in html".to_string()));
    }
    Ok(text)
}

pub(crate) fn strip_html(html: &str) -> String {
    let s = remove_blocks(html, "<script", "</script>");
    let s = remove_blocks(&s, "<style", "</style>");
    let s = remove_blocks(&s, "<!--", "-->");
    let s = tags_to_text(&s);
    let s = decode_entities(&s);
    collapse_whitespace(&s)
}

fn find_ci(haystack: &str, needle: &str, from: usize) -> Option<usize> {
    let h = haystack.as_bytes();
    let n = needle.as_bytes();
    if n.is_empty() || h.len() < n.len() || from > h.len() - n.len() {
        return None;
    }
    (from..=h.len() - n.len()).find(|&i| h[i..i + n.len()].eq_ignore_ascii_case(n))
}

fn remove_blocks(input: &str, open: &str, close: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut pos = 0;
    while let Some(start) = find_ci(input, open, pos) {
        out.push_str(&input[pos..start]);
        match find_ci(input, close, start + open.len()) {
            Some(end) => pos = end + close.len(),
            None => return out,
        }
    }
    out.push_str(&input[pos..]);
    out
}

fn tags_to_text(s: &str) -> String {
    const BLOCK_TAGS: [&str; 18] = [
        "p", "div", "br", "li", "ul", "ol", "tr", "table", "h1", "h2", "h3", "h4", "h5",
        "h6", "section", "article", "blockquote", "pre",
    ];
    let mut out = String::with_capacity(s.len());
    let mut rest = s;
    while let Some(idx) = rest.find('<') {
        out.push_str(&rest[..idx]);
        let after = &rest[idx..];
        match after.find('>') {
            Some(end) => {
                let inner = &after[1..end];
                let name: String = inner
                    .trim_start_matches('/')
                    .chars()
                    .take_while(|c| c.is_ascii_alphanumeric())
                    .collect::<String>()
                    .to_ascii_lowercase();
                if BLOCK_TAGS.contains(&name.as_str()) {
                    out.push('\n');
                } else if name == "td" || name == "th" {
                    out.push(' ');
                }
                rest = &after[end + 1..];
            }
            None => return out,
        }
    }
    out.push_str(rest);
    out
}

fn decode_numeric_entities(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut rest = s;
    while let Some(idx) = rest.find("&#") {
        out.push_str(&rest[..idx]);
        let tail = &rest[idx + 2..];
        let semi = tail.find(';').filter(|&e| e > 0 && e <= 8);
        let decoded = semi.and_then(|end| {
            let code = &tail[..end];
            let parsed = if let Some(hex) = code.strip_prefix(['x', 'X']) {
                u32::from_str_radix(hex, 16).ok()
            } else {
                code.parse::<u32>().ok()
            };
            parsed.and_then(char::from_u32).map(|c| (c, end))
        });
        match decoded {
            Some((c, end)) => {
                out.push(c);
                rest = &tail[end + 1..];
            }
            None => {
                out.push_str("&#");
                rest = tail;
            }
        }
    }
    out.push_str(rest);
    out
}

fn decode_entities(s: &str) -> String {
    decode_numeric_entities(s)
        .replace("&nbsp;", " ")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&apos;", "'")
        .replace("&amp;", "&")
}

fn collapse_whitespace(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut blank_pending = false;
    for line in s.lines() {
        let t = line.trim();
        if t.is_empty() {
            blank_pending = !out.is_empty();
        } else {
            if !out.is_empty() {
                out.push('\n');
                if blank_pending {
                    out.push('\n');
                }
            }
            out.push_str(t);
            blank_pending = false;
        }
    }
    out
}
