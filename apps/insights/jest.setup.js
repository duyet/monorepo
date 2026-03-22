import "@testing-library/jest-dom";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.GITHUB_TOKEN = "test-token";
process.env.CLICKHOUSE_HOST = "localhost";
process.env.CLICKHOUSE_DATABASE = "test_db";
process.env.CLICKHOUSE_PORT = "8123";
process.env.CLICKHOUSE_USER = "test_user";
process.env.CLICKHOUSE_PASSWORD = "test_password";
