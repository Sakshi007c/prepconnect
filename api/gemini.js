const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY on server." });
  }

  try {
    const { prompt, systemInstruction = null } = req.body ?? {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error?.message || `Gemini error: ${response.status}`;
      return res.status(response.status).json({ error: errorMessage });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
}
