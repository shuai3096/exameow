use crate::routes::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use examine_core::exam::Question;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

type Err = (StatusCode, String);

fn err(status: StatusCode, code: &str) -> Err {
    (status, serde_json::json!({ "error": code }).to_string())
}

fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankImportReq {
    pub bank: Option<String>,
    pub questions: Vec<Question>,
}

#[derive(Serialize)]
pub struct BankImportRes {
    pub bank: String,
    pub imported: u32,
}

#[derive(Deserialize)]
pub struct BankDeleteReq {
    pub bank: Option<String>,
}

pub fn init_bank_db(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS banks (
          name TEXT PRIMARY KEY,
          question_count INTEGER NOT NULL DEFAULT 0,
          questions TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );",
    )
    .map_err(|e| e.to_string())
}

pub async fn bank_import_handler(
    State(state): State<Arc<AppState>>,
    Json(req): Json<BankImportReq>,
) -> Result<Json<BankImportRes>, Err> {
    let bank = req
        .bank
        .filter(|b| !b.trim().is_empty())
        .map(|b| b.trim().to_string())
        .unwrap_or_else(|| "default".to_string());
    let questions = req.questions;
    if questions.is_empty() {
        return Err(err(StatusCode::BAD_REQUEST, "empty_questions"));
    }
    if questions.len() > 20_000 {
        return Err(err(StatusCode::BAD_REQUEST, "too_many_questions"));
    }
    let questions_json =
        serde_json::to_string(&questions).map_err(|e| err(StatusCode::BAD_REQUEST, &e.to_string()))?;
    if questions_json.len() > 50 * 1024 * 1024 {
        return Err(err(StatusCode::BAD_REQUEST, "payload_too_large"));
    }

    let conn = state.relay.conn.lock().map_err(|_| err(StatusCode::INTERNAL_SERVER_ERROR, "db_lock"))?;
    conn.execute(
        "INSERT INTO banks (name, question_count, questions, created_at)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(name) DO UPDATE SET
           question_count = excluded.question_count,
           questions = excluded.questions,
           created_at = excluded.created_at",
        params![bank, questions.len() as i64, questions_json, now_ms()],
    )
    .map_err(|e| err(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;

    Ok(Json(BankImportRes {
        bank,
        imported: questions.len() as u32,
    }))
}

pub async fn bank_list_handler(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<serde_json::Value>>, Err> {
    let conn = state.relay.conn.lock().map_err(|_| err(StatusCode::INTERNAL_SERVER_ERROR, "db_lock"))?;
    let mut stmt = conn
        .prepare("SELECT name, question_count FROM banks ORDER BY name")
        .map_err(|e| err(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;
    let rows = stmt
        .query_map(params![], |r| {
            Ok(serde_json::json!({
                "bank": r.get::<_, String>(0)?,
                "count": r.get::<_, i64>(1)?,
            }))
        })
        .map_err(|e| err(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;
    let banks: Vec<serde_json::Value> = rows.filter_map(|r| r.ok()).collect();
    Ok(Json(banks))
}

pub async fn bank_get_handler(
    State(state): State<Arc<AppState>>,
    Path(bank): Path<String>,
) -> Result<Json<serde_json::Value>, Err> {
    let conn = state.relay.conn.lock().map_err(|_| err(StatusCode::INTERNAL_SERVER_ERROR, "db_lock"))?;
    let row: Option<String> = conn
        .query_row("SELECT questions FROM banks WHERE name = ?1", params![bank], |r| {
            r.get(0)
        })
        .ok();
    let Some(questions_json) = row else {
        return Err(err(StatusCode::NOT_FOUND, "bank_not_found"));
    };
    let questions: Vec<Question> = serde_json::from_str(&questions_json).map_err(|e| {
        err(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string())
    })?;
    Ok(Json(serde_json::json!({
        "bank": bank,
        "count": questions.len(),
        "questions": questions,
    })))
}

pub async fn bank_delete_handler(
    State(state): State<Arc<AppState>>,
    Json(req): Json<BankDeleteReq>,
) -> Result<Json<serde_json::Value>, Err> {
    let bank = req
        .bank
        .filter(|b| !b.trim().is_empty())
        .ok_or_else(|| err(StatusCode::BAD_REQUEST, "bank_required"))?;
    let conn = state.relay.conn.lock().map_err(|_| err(StatusCode::INTERNAL_SERVER_ERROR, "db_lock"))?;
    let n = conn
        .execute("DELETE FROM banks WHERE name = ?1", params![bank])
        .map_err(|e| err(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()))?;
    Ok(Json(serde_json::json!({ "deleted": n, "bank": bank })))
}
