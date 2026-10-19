use crate::ai::AIClient;
use crate::error::CoreError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnswerResult {
    pub answer: String,
    pub analysis: String,
}

pub fn build_answer_system_prompt() -> String {
    r#"You are an expert exam-solving assistant. The user will give you an exam question (it may include options). Solve it.

## Output Rules
1. Respond ONLY with a valid JSON object — no explanation outside JSON, no markdown fences.
2. The JSON object MUST have exactly these fields:
   - "answer": the concise answer. For choice questions give the option letter(s) plus the option content; for true/false questions answer "True" or "False" (or the equivalent in the requested language); otherwise give the answer text directly.
   - "analysis": a clear step-by-step explanation of why this answer is correct.
3. Use the requested language for both fields.
4. If the question is ambiguous or unanswerable, still fill "answer" with your best attempt and explain the uncertainty in "analysis"."#
        .to_string()
}

pub fn build_answer_user_prompt(question: &str, language: &str) -> String {
    format!("Language: {language}\n\nQUESTION:\n{question}")
}

pub fn parse_answer(raw: &str) -> Result<AnswerResult, CoreError> {
    let cleaned = raw
        .trim()
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();

    let start = cleaned.find('{');
    let end = cleaned.rfind('}');
    let json = match (start, end) {
        (Some(s), Some(e)) if e >= s => &cleaned[s..=e],
        _ => cleaned,
    };

    serde_json::from_str(json)
        .map_err(|e| CoreError::Exam(format!("Answer JSON parse error: {e}")))
}

pub async fn answer_question(
    client: &AIClient,
    question: &str,
    language: &str,
    model: &str,
) -> Result<AnswerResult, CoreError> {
    let system_prompt = build_answer_system_prompt();
    let user_prompt = build_answer_user_prompt(question, language);
    let response = client.chat(&system_prompt, &user_prompt, model).await?;
    parse_answer(&response)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_plain_json() {
        let r = parse_answer(r#"{"answer": "B", "analysis": "because"}"#).unwrap();
        assert_eq!(r.answer, "B");
        assert_eq!(r.analysis, "because");
    }

    #[test]
    fn parses_fenced_json_with_preamble() {
        let raw = "Here is the result:\n```json\n{\"answer\": \"True\", \"analysis\": \"x\"}\n```";
        let r = parse_answer(raw).unwrap();
        assert_eq!(r.answer, "True");
    }

    #[test]
    fn rejects_invalid_json() {
        assert!(parse_answer("not json at all").is_err());
    }
}
