export const callGeminiAPI = async (prompt, systemInstruction = null) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

   
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let retries = 0;
  const maxRetries = 3;

  while (retries <= maxRetries) {
    try {
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
         throw new Error("API Key Missing");
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`HTTP Error: ${errData.error?.message || response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (retries === maxRetries) return `Connection error: ${error.message}`;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      retries++;
    }
  }
};