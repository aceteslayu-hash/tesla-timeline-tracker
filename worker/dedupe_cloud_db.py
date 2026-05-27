import os
import re
import requests
from dotenv import load_dotenv

# Load env variables
load_dotenv(dotenv_path="/Users/rio/tesla-timeline-tracker/.env")

def parse_hrana_val(v):
    t = v.get("type")
    if t == "null":
        return None
    elif t in ["integer", "float"]:
        val_str = str(v.get("value", "0"))
        if "." in val_str:
            return float(val_str)
        return int(val_str)
    return v.get("value")

class DatabaseAdapter:
    """Unified Database Connection Handler supporting Cloud Turso via pure-Python HTTP requests"""
    def __init__(self):
        self.url = os.environ.get("TURSO_DATABASE_URL")
        self.auth_token = os.environ.get("TURSO_AUTH_TOKEN")
        if not self.url:
            raise Exception("TURSO_DATABASE_URL environment variable is required!")
            
    def _execute_turso_http(self, sql, params):
        http_url = self.url
        if http_url.startswith("libsql://"):
            http_url = "https://" + http_url[9:]
            
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        args = []
        for p in params:
            if p is None:
                args.append({"type": "null"})
            elif isinstance(p, bool):
                args.append({"type": "integer", "value": "1" if p else "0"})
            elif isinstance(p, int):
                args.append({"type": "integer", "value": str(p)})
            elif isinstance(p, float):
                args.append({"type": "float", "value": str(p)})
            else:
                args.append({"type": "text", "value": str(p)})
                
        payload = {
            "requests": [
                {
                    "type": "execute",
                    "stmt": {
                        "sql": sql,
                        "args": args
                    }
                },
                {
                    "type": "close"
                }
            ]
        }
        
        resp = requests.post(f"{http_url}/v2/pipeline", json=payload, headers=headers, timeout=10)
        if resp.status_code != 200:
            raise Exception(f"Turso HTTP Error ({resp.status_code}): {resp.text}")
            
        res_data = resp.json()
        exec_res = res_data["results"][0]
        if exec_res["type"] == "error":
            raise Exception(f"Turso SQL Error: {exec_res['error']['message']}")
            
        result = exec_res["response"]["result"]
        cols = [c["name"] for c in result["cols"]]
        
        rows = []
        for r in result["rows"]:
            row_vals = []
            for cell in r:
                row_vals.append(parse_hrana_val(cell))
            rows.append(dict(zip(cols, row_vals)))
            
        class LibsqlResult:
            def __init__(self, rows, last_insert_id):
                self.rows = rows
                self.last_rowid = last_insert_id
            def fetchall(self):
                return self.rows
            def fetchone(self):
                return self.rows[0] if self.rows else None
                
        last_id_val = result.get("last_insert_rowid")
        last_id = int(last_id_val) if last_id_val is not None else 0
        return LibsqlResult(rows, last_id)
            
    def execute(self, sql, params=None):
        if params is None:
            params = []
        return self._execute_turso_http(sql, params)
            
    def fetchall(self, sql, params=None):
        if params is None:
            params = []
        res = self._execute_turso_http(sql, params)
        return res.fetchall()

def deduplicate_db():
    print("=========================================")
    print("Starting Cloud Database Deduplication...")
    print("=========================================")
    
    db = DatabaseAdapter()
    
    # 1. Fetch all topics
    topics = db.fetchall("SELECT id, title FROM topics")
    print(f"Loaded {len(topics)} topics from cloud.")
    
    deleted_count = 0
    
    for t in topics:
        topic_id = t["id"]
        title = t["title"]
        print(f"\nAnalyzing Topic ID {topic_id}: \"{title[:45]}...\"")
        
        # 2. Fetch all timeline events for this topic, sorted by timestamp ascending (keep the oldest event)
        events = db.fetchall("SELECT id, quick_take, source_name FROM timeline_events WHERE topic_id = ? ORDER BY timestamp ASC", (topic_id,))
        print(f"  Found {len(events)} events under this topic.")
        
        # We will keep a list of unique quick takes we have preserved
        preserved_takes = []
        
        for ev in events:
            ev_id = ev["id"]
            take = ev["quick_take"]
            source = ev["source_name"]
            
            # Check similarity with already preserved takes for this topic
            is_duplicate = False
            for p_take in preserved_takes:
                words_p = set(re.findall(r'\w+', p_take.lower()))
                words_ev = set(re.findall(r'\w+', take.lower()))
                
                if words_p and words_ev:
                    intersection = words_p.intersection(words_ev)
                    similarity = len(intersection) / min(len(words_p), len(words_ev))
                    if similarity > 0.65:
                        is_duplicate = True
                        break
            
            if is_duplicate:
                print(f"  [DEDUPE] Deleting duplicate event ID {ev_id} (\"{take[:40]}...\" from {source})")
                db.execute("DELETE FROM timeline_events WHERE id = ?", (ev_id,))
                deleted_count += 1
            else:
                preserved_takes.append(take)
                
    print("\n=========================================")
    print(f"Deduplication Complete! Deleted {deleted_count} duplicate events.")
    print("=========================================")

if __name__ == "__main__":
    deduplicate_db()
