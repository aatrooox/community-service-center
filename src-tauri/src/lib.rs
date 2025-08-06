use log;
use tauri_plugin_log::{Target, TargetKind};
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
            // Migration 5: 创建 link_entities 表
            Migration {
              version: 5,
              description: "create_link_entities_table",
              sql: "CREATE TABLE IF NOT EXISTS link_entities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                affection_points INTEGER NOT NULL DEFAULT 0,
                color TEXT NOT NULL,
                icon TEXT NOT NULL,
                start_date TEXT,
                end_date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
              kind: MigrationKind::Up,
            },
            // Migration 6: 创建 link_tags 表
            Migration {
              version: 6,
              description: "create_link_tags_table",
              sql: "CREATE TABLE IF NOT EXISTS link_tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '#10b981',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );",
              kind: MigrationKind::Up,
            },
            // Migration 7: 创建 link_tasks 表
            Migration {
              version: 7,
              description: "create_link_tasks_table",
              sql: "CREATE TABLE IF NOT EXISTS link_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN NOT NULL DEFAULT 0,
                priority INTEGER NOT NULL DEFAULT 2,
                due_date DATETIME,
                entity_id INTEGER NOT NULL,
                tag_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entity_id) REFERENCES link_entities (id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES link_tags (id) ON DELETE SET NULL
              );",
              kind: MigrationKind::Up,
            },

          ],
        )
        .build()
    )
    .plugin(
      tauri_plugin_log::Builder::new()
        .targets([
          Target::new(TargetKind::Stdout),
          Target::new(TargetKind::Webview),
        ])
        .level(if cfg!(debug_assertions) {
          log::LevelFilter::Debug
        } else {
          log::LevelFilter::Info
        })
        .build(),
    )
    .setup(|_app| {
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
