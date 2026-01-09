const API_URL = "http://localhost:5000/api";

/* -------- Intent -------- */

export async function classifyIntent(
  text: string
): Promise<{ intent: string }> {
  const response = await fetch(`${API_URL}/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error("Failed to classify intent");
  }

  return response.json();
}

/* -------- Skills -------- */

export async function getSkillPath(
  role: string
): Promise<{ skills: string[] }> {
  const response = await fetch(`${API_URL}/skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch skills");
  }

  return response.json();
}

/* -------- Mentorship -------- */

export async function getMentorAdvice(
  skills: string[]
): Promise<{ advice: string }> {
  const response = await fetch(`${API_URL}/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch mentor advice");
  }

  return response.json();
}

/* -------- Opportunities -------- */

export async function fetchOpportunities(
  skills: string[]
): Promise<{ opportunities: any[] }> {
  const response = await fetch(`${API_URL}/opportunities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch opportunities");
  }

  return response.json();
}
