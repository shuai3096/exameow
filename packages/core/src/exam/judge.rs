use crate::ai::AIClient;
use crate::error::CoreError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JudgeResult {
    pub correct: bool,
    pub feedback: String,
}

pub fn build_judge_system_prompt() -> String {
    r#"You are a strict but fair exam grader. You will be given an exam question, the reference answer, an optional reference analysis, and a student's answer. Decide whether the student's answer is correct.

## Grading Rules
1. Judge by meaning, not wording: if the student's answer is semantically equivalent to the reference answer, it is correct even if phrased differently.
2. A partial answer that misses key points required by the reference answer is incorrect.
3. Extra correct information does not make the answer wrong, unless it contradicts the reference answer.

## Output Rules
1. Respond ONLY with a valid JSON object — no explanation outside JSON, no markdown fences.
2. The JSON object MUST have exactly these fields:
   - "correct": true or false
   - "feedback": one or two sentences explaining why the answer is correct, or what is missing or wrong.
3. Write "feedback" in the requested language."#
        .to_string()
}

pub fn build_judge_user_prompt(
    stem: &str,
    reference_answer: &str,
    analysis: &str,
    user_answer: &str,
    language: &str,
) -> String {
    let analysis_block = if analysis.trim().is_empty() {
        String::new()
    } else {
        format!("\n\nREFERENCE ANALYSIS:\n{analysis}")
    };
    format!(
        "Language: {language}\n\nQUESTION:\n{stem}\n\nREFERENCE ANSWER:\n{reference_answer}{analysis_block}\n\nSTUDENT ANSWER:\n{user_answer}"
    )
}

pub fn parse_judge(raw: &str) -> Result<JudgeResult, CoreError> {
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
        .map_err(|e| CoreError::Exam(format!("Judge JSON parse error: {e}")))
}

pub async fn judge_answer(
    client: &AIClient,
    stem: &str,
    reference_answer: &str,
    analysis: &str,
    user_answer: &str,
    language: &str,
    model: &str,
) -> Result<JudgeResult, CoreError> {
    let system_prompt = build_judge_system_prompt();
    let user_prompt = build_judge_user_prompt(stem, reference_answer, analysis, user_answer, language);
    let response = client.chat(&system_prompt, &user_prompt, model).await?;
    parse_judge(&response)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_plain_json() {
        let r = parse_judge(r#"{"correct": true, "feedback": "well done"}"#).unwrap();
        assert!(r.correct);
        assert_eq!(r.feedback, "well done");
    }

    #[test]
    fn parses_fenced_json_with_preamble() {
        let raw = "Result:\n```json\n{\"correct\": false, \"feedback\": \"missing key point\"}\n```";
        let r = parse_judge(raw).unwrap();
        assert!(!r.correct);
    }

    #[test]
    fn rejects_invalid_json() {
        assert!(parse_judge("not json").is_err());
    }

    #[test]
    fn user_prompt_omits_empty_analysis() {
        let p = build_judge_user_prompt("stem", "ref", "", "mine", "Chinese");
        assert!(!p.contains("REFERENCE ANALYSIS"));
        let p2 = build_judge_user_prompt("stem", "ref", "because", "mine", "Chinese");
        assert!(p2.contains("REFERENCE ANALYSIS:\nbecause"));
    }
}
