import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mic, Send, Volume2, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// CONFIGURACIÓN SUPABASE (REEMPLAZA CON TUS DATOS REALES)
const supabase = createClient(
  'TU_SUPABASE_URL', 
  'TU_SUPABASE_ANON_KEY'
);

// CONFIGURACIÓN OPENAI (USA UNA KEY TEMPORAL O VARIABLE DE ENTORNO)
const OPENAI_API_KEY = 'TU_OPENAI_API_KEY'; 

export default function ChinoAI() {
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Ola! Son Chiño, o teu colega celeste. Pregúntame o que queiras sobre a historia do Celta! ⚽💙', isAudio: false }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Función para hablar (TTS)
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Intentar buscar voz en español/gallego
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => v.lang.includes('es') || v.lang.includes('gl'));
      if (esVoice) utterance.voice = esVoice;
      utterance.rate = 1.1; // Un poco más rápido, dinámico
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Función para escuchar (STT)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-ES'; // O 'gl-ES' si el navegador lo soporta
    recognition.interimResults = false;
    
    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      handleSend(transcript); // Enviar automáticamente al hablar
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  };

  // Lógica Principal: Enviar mensaje a IA
  const handleSend = async (textOverride = null) => {
    const userText = textOverride || input;
    if (!userText.trim()) return;

    // 1. Añadir mensaje usuario
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Llamar a OpenAI (Simulando System Prompt de Chiño)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Eres Chiño AI, el agente oficial del RC Celta de Vigo. Fundado en 1923. Tu tono es celista, orgulloso, cercano y 'listillo'. Respondes en Gallego si te hablan en gallego, sino en Español. Sé breve (máximo 2 frases) para respuestas de voz. Datos clave: Iago Aspas es el máximo goleador. Balaídos es nuestro templo." },
            { role: "user", content: userText }
          ]
        })
      });

      const data = await response.json();
      const aiText = data.choices[0].message.content;

      // 3. Añadir respuesta IA
      setMessages(prev => [...prev, { role: 'agent', text: aiText }]);
      
      // 4. Reproducir Voz
      speak(aiText);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'agent', text: "Perdona, celetismo, estou tendo un problema técnico. Inténtao de novo!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col relative overflow-hidden">
      {/* Fondo Celeste Sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black opacity-90 z-0"></div>
      
      {/* Header */}
      <header className="z-10 p-4 bg-slate-800/80 backdrop-blur-md border-b border-blue-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Chiño AI</h1>
            <p className="text-xs text-blue-300">O teu colega celeste</p>
          </div>
        </div>
        <div className="text-xs bg-blue-900/50 px-2 py-1 rounded border border-blue-500/30">
          MVP 2026
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 z-10 space-y-4 pb-24">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 border border-blue-500/30 text-gray-100 rounded-bl-none shadow-lg'
              }`}>
                <p className="text-sm md:text-base">{msg.text}</p>
                {msg.role === 'agent' && (
                  <button onClick={() => speak(msg.text)} className="mt-2 text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                    <Volume2 size={12} /> Escutar
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-blue-500/30">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="z-10 p-4 bg-slate-900/90 backdrop-blur-md border-t border-blue-500/30 absolute bottom-0 w-full">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <button 
            onClick={startListening}
            className={`p-3 rounded-full transition-all ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <Mic size={24} className="text-white" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregúntale a Chiño..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/30"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-2">
          Chiño AI © 2026 - Real Club Celta de Vigo
        </p>
      </footer>
    </div>
  );
}