export const callGeminiAPI = async (prompt, systemInstruction = null) => {
  const localApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  let retries = 0;
  const maxRetries = 3;

  while (retries <= maxRetries) {
    try {
      const isLocalFallback = import.meta.env.DEV && localApiKey;
      const response = await fetch(
        isLocalFallback
          ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${localApiKey}`
          : '/api/gemini',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isLocalFallback
              ? {
                  contents: [{ parts: [{ text: prompt }] }],
                  ...(systemInstruction
                    ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
                    : {})
                }
              : { prompt, systemInstruction }
          )
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`HTTP Error: ${errData.error?.message || response.status}`);
      }

      const data = await response.json();
      return isLocalFallback
        ? data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated."
        : data.text || "No response generated.";
    } catch (error) {
      if (retries === maxRetries) return `Connection error: ${error.message}`;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      retries++;
    }
  }
};
