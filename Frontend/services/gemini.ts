const API_URL = "http://localhost:5000/api";

/**
 * Classify user intent (career, mentorship, opportunities, etc.)
 */
export async function classifyIntent(
  text: string
): Promise<{ intent: string }> {
  const response = await fetch(`${API_URL}/intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to classify intent");
  }

  return response.json();
}

/**
 * Get mentor advice from Gemini / backend
 */
export async function getMentorAdvice(
  prompt: string
): Promise<{ advice: string }> {
  const response = await fetch(`${API_URL}/mentor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to get mentor advice");
  }

  return response.json();
}