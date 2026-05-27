import sqlite3
import os

DB_PATH = "/Users/rio/tesla-timeline-tracker/db/tesla_tracker.db"

def init_db():
    print(f"Initializing database at: {DB_PATH}")
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop existing tables to ensure a clean updated schema migration
    cursor.execute("DROP TABLE IF EXISTS timeline_events;")
    cursor.execute("DROP TABLE IF EXISTS topics;")

    # Create topics table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        summary TEXT,
        category TEXT,
        meta_title TEXT,
        meta_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Create timeline_events table with full_details
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS timeline_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER,
        timestamp INTEGER NOT NULL,
        source_name TEXT NOT NULL,
        source_url TEXT,
        image_url TEXT,
        quick_take TEXT NOT NULL,
        full_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
    );
    """)

    # Create triggers to automatically update updated_at on topics
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS update_topics_timestamp
    AFTER UPDATE ON topics
    FOR EACH ROW
    BEGIN
        UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
    END;
    """)

    conn.commit()
    conn.close()
    print("Database and tables initialized successfully with new schema!")

if __name__ == "__main__":
    init_db()
