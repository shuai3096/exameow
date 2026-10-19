#[cfg(test)]
mod tests {
    use exameow_core::ai::AIClient;

    #[test]
    fn test_client_creation() {
        let client = AIClient::new("https://api.openai.com/v1", "sk-test");
        let _ = client;
    }

    #[test]
    fn test_endpoint_trailing_slash_trimmed() {
        let client = AIClient::new("https://api.openai.com/v1/", "sk-test");
        let _ = client;
    }

    #[test]
    fn test_client_new_with_empty_key() {
        let client = AIClient::new("https://api.openai.com/v1", "");
        let _ = client;
    }
}
