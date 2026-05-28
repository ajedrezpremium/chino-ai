// Ejemplo de llamada al agente desde tu Frontend (React)

const callChinoAI = async (userMessage, userLang, isSubscriber, userId) => {
  
  // 1. Preparar el contexto del usuario
  const userContext = {
    lang: userLang, // 'gl', 'es', 'en'
    isSubscriber: isSubscriber,
    userId: userId, // Para personalizar si es abonado
    currentSeason: '2025-2026'
  };

  // 2. Construir el payload para tu Backend (Python/FastAPI o Node)
  const payload = {
    model: "qwen-2.5-max", // O el modelo que estés usando
    messages: [
      { role: "system", content: SYSTEM_PROMPT_CHINO_AI }, // El mega prompt de arriba
      { role: "user", content: userMessage },
      { role: "context", content: JSON.stringify(userContext) }
    ],
    tools: [
      { type: "function", function: { name: "get_live_match_data" } },
      { type: "function", function: { name: "search_historical_db" } },
      { type: "function", function: { name: "get_subscriber_benefits" } }
    ]
  };

  // 3. Enviar y recibir respuesta
  const response = await fetch('/api/chino-chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  
  // 4. Procesar salida para TTS (Texto a Voz)
  // Si la respuesta es larga, dividirla en párrafos para mejor síntesis de voz
  return {
    text: data.choices[0].message.content,
    audioUrl: await generateTTS(data.choices[0].message.content, userLang)
  };
};