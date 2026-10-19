use crate::parser::ParserError;
use std::error::Error;

#[derive(Debug)]
pub enum CoreError {
    Parser(ParserError),
    AI(String),
    Exam(String),
    Export(String),
    Config(String),
}

impl std::fmt::Display for CoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CoreError::Parser(e) => write!(f, "Parser: {e}"),
            CoreError::AI(e) => write!(f, "AI: {e}"),
            CoreError::Exam(e) => write!(f, "Exam: {e}"),
            CoreError::Export(e) => write!(f, "Export: {e}"),
            CoreError::Config(e) => write!(f, "Config: {e}"),
        }
    }
}

impl From<ParserError> for CoreError {
    fn from(e: ParserError) -> Self { CoreError::Parser(e) }
}

impl From<reqwest::Error> for CoreError {
    fn from(e: reqwest::Error) -> Self {
        let mut msg = e.to_string();
        let mut source = e.source();
        while let Some(s) = source {
            msg.push_str(&format!("\n  caused by: {s}"));
            source = s.source();
        }
        CoreError::AI(msg)
    }
}

impl From<serde_json::Error> for CoreError {
    fn from(e: serde_json::Error) -> Self { CoreError::AI(e.to_string()) }
}
