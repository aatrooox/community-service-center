use log;
use tauri_plugin_log;
use tauri_plugin_notification;
use tauri_plugin_sql::{Migration, MigrationKind};
use tauri_plugin_store;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(tauri_plugin_notification::init())
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations(
          "sqlite:app.db",
          vec![
            // Migration 1: 创建 servers 表
            Migration {
              version: 1,
              description: "create_servers_table",
              sql: "CREATE TABLE IF NOT EXISTS servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                description TEXT,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );",
              kind: MigrationKind::Up,
            },
            // Migration 2: 创建 server_tokens 表
            Migration {
              version: 2,
              description: "create_server_tokens_table",
              sql: "CREATE TABLE IF NOT EXISTS server_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_url TEXT NOT NULL,
                token_name TEXT NOT NULL,
                token_value TEXT NOT NULL,
                description TEXT,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (server_url) REFERENCES servers (url) ON DELETE CASCADE
              );",
              kind: MigrationKind::Up,
            },
            // Migration 3: 创建 users 表
            Migration {
              version: 3,
              description: "create_users_table",
              sql: "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );",
              kind: MigrationKind::Up,
            },
            // Migration 4: 创建 settings 表
            Migration {
              version: 4,
              description: "create_settings_table",
              sql: "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );",
              kind: MigrationKind::Up,
            },
            // Migration 5: 创建 todo_categories 表
            Migration {
              version: 5,
              description: "create_todo_categories_table",
              sql: "CREATE TABLE IF NOT EXISTS todo_categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT NOT NULL,
                icon TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );",
              kind: MigrationKind::Up,
            },
            // Migration 6: 创建 todo_tags 表
            Migration {
              version: 6,
              description: "create_todo_tags_table",
              sql: "CREATE TABLE IF NOT EXISTS todo_tags (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                parent_id TEXT,
                level INTEGER NOT NULL DEFAULT 1,
                color TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES todo_tags (id) ON DELETE CASCADE
              );",
              kind: MigrationKind::Up,
            },
            // Migration 7: 创建 todos 表
            Migration {
              version: 7,
              description: "create_todos_table",
              sql: "CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN NOT NULL DEFAULT 0,
                priority INTEGER NOT NULL DEFAULT 2,
                due_date DATETIME,
                category_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES todo_categories (id) ON DELETE SET NULL
              );",
              kind: MigrationKind::Up,
            },
            // Migration 8: 创建 todo_tag_relations 表
            Migration {
              version: 8,
              description: "create_todo_tag_relations_table",
              sql: "CREATE TABLE IF NOT EXISTS todo_tag_relations (
                todo_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                PRIMARY KEY (todo_id, tag_id),
                FOREIGN KEY (todo_id) REFERENCES todos (id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES todo_tags (id) ON DELETE CASCADE
              );",
              kind: MigrationKind::Up,
            },
          ],
        )
        .build()
    )
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
