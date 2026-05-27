import { createClient, Client } from "@libsql/client";

// Global connection
let libsqlClientInstance: Client | null = null;

export function getDbClient(): Client {
  if (libsqlClientInstance) return libsqlClientInstance;

  const url = process.env.TURSO_DATABASE_URL || "file:/Users/rio/tesla-timeline-tracker/db/tesla_tracker.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || "";

  libsqlClientInstance = createClient({
    url,
    authToken,
  });
  
  return libsqlClientInstance;
}

export interface Topic {
  id: number;
  title: string;
  summary: string;
  category: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
  event_count?: number;
  image_url?: string;
}

export interface TimelineEvent {
  id: number;
  topic_id: number;
  timestamp: number;
  source_name: string;
  source_url: string;
  image_url: string;
  quick_take: string;
  full_details: string;
  created_at: string;
}

export async function getAllTopics(): Promise<Topic[]> {
  const query = `
    SELECT t.*, 
           COUNT(e.id) as event_count,
           (SELECT image_url FROM timeline_events WHERE topic_id = t.id ORDER BY timestamp DESC LIMIT 1) as image_url
    FROM topics t
    LEFT JOIN timeline_events e ON t.id = e.topic_id
    GROUP BY t.id
    ORDER BY t.updated_at DESC
  `;

  const client = getDbClient();
  const result = await client.execute(query);
  return result.rows.map((row) => ({
    id: Number(row.id),
    title: String(row.title),
    summary: String(row.summary),
    category: String(row.category),
    meta_title: String(row.meta_title),
    meta_description: String(row.meta_description),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    event_count: Number(row.event_count),
    image_url: row.image_url ? String(row.image_url) : undefined,
  }));
}

export async function getTopicById(id: number | string): Promise<Topic | null> {
  const query = `SELECT * FROM topics WHERE id = ?`;

  const client = getDbClient();
  const result = await client.execute({ sql: query, args: [id] });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: Number(row.id),
    title: String(row.title),
    summary: String(row.summary),
    category: String(row.category),
    meta_title: String(row.meta_title),
    meta_description: String(row.meta_description),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getTimelineEventsByTopicId(topicId: number | string): Promise<TimelineEvent[]> {
  const query = `
    SELECT * FROM timeline_events 
    WHERE topic_id = ? 
    ORDER BY timestamp DESC
  `;

  const client = getDbClient();
  const result = await client.execute({ sql: query, args: [topicId] });
  return result.rows.map((row) => ({
    id: Number(row.id),
    topic_id: Number(row.topic_id),
    timestamp: Number(row.timestamp),
    source_name: String(row.source_name),
    source_url: String(row.source_url),
    image_url: String(row.image_url),
    quick_take: String(row.quick_take),
    full_details: String(row.full_details),
    created_at: String(row.created_at),
  }));
}
