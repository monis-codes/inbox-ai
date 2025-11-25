// lib.ts - Replace the API_BASE constant
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchEmails(): Promise<Email[]> {
  const response = await fetch(`${API_BASE}/emails`);
  if (!response.ok) throw new Error('Failed to fetch emails');
  return response.json();
}

export async function fetchDrafts(): Promise<Draft[]> {
  const response = await fetch(`${API_BASE}/drafts`);
  if (!response.ok) throw new Error('Failed to fetch drafts');
  return response.json();
}

export async function fetchPrompts(): Promise<Prompts> {
  const response = await fetch(`${API_BASE}/settings/prompts`);
  if (!response.ok) throw new Error('Failed to fetch prompts');
  return response.json();
}

export async function generateReply(emailId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/drafts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailId })
  });
  if (!response.ok) throw new Error('Failed to generate reply');
  const data = await response.json();
  return data.content;
}

export async function saveDraft(draft: Omit<Draft, 'lastSaved'>): Promise<Draft> {
  const response = await fetch(`${API_BASE}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: draft.id,
      emailReferenceId: draft.emailReferenceId,
      emailSubject: draft.emailSubject,
      content: draft.content
    })
  });
  if (!response.ok) throw new Error('Failed to save draft');
  return response.json();
}

export async function updatePrompts(prompts: Prompts): Promise<Prompts> {
  const response = await fetch(`${API_BASE}/settings/prompts`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompts)
  });
  if (!response.ok) throw new Error('Failed to update prompts');
  return response.json();
}

export async function queryChat(query: string): Promise<string> {
  const response = await fetch(`${API_BASE}/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Failed to query chat');
  const data = await response.json();
  return data.answer;
}

// Add ingest endpoint
export async function ingestEmails(): Promise<{ message: string; processed_count: number }> {
  const response = await fetch(`${API_BASE}/emails/ingest`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to ingest emails');
  return response.json();
}