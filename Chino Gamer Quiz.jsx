import React, { useState, useEffect } from 'react';
import { Trophy, Timer, Flame, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient'; // Tu cliente configurado

const ChinoGamer = ({ user }) => {
  const [gameState, setGameState] = useState('intro'); // intro, playing, result
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(15); // 15 segundos por pregunta

  // Cargar preguntas al iniciar
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    // Trae 5 preguntas aleatorias
    const { data, error } = await supabase
      .from('game_questions')
      .select('*')
      .order('random()', { hinted: true }) // Nota: random() requiere configuración extra o usar lógica JS
      .limit(5);
    
    if (data) setQuestions(data);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setQuestionIndex(0);
    setCurrentQuestion(questions[0]);
    setTimer(15);
  };

  // Temporizador
  useEffect(() => {
    if (gameState === 'playing' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      handleAnswer(null); // Tiempo agotado
    }
  }, [timer, gameState]);

  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption === currentQuestion.correct_option;
    
    if (isCorrect) {
      // Puntos base + bonus por tiempo
      const points = 100 + (timer * 5);
      setScore(s => s + points);
      speak("¡Correcto! ¡Que clase!");
    } else {
      speak("Vaya... esa no era.");
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setCurrentQuestion(questions[questionIndex + 1]);
      setTimer(15);
    } else {
      finishGame(isCorrect ? score + 100 + (timer*5) : score);
    }
  };

  const finishGame = async (finalScore) => {
    setGameState('result');
    speak(`Fin del juego. Conseguiste ${finalScore} puntos. ¡Eres un crack!`);
    
    // Guardar en Supabase
    await supabase.from('game_sessions').insert({
      user_id: user.id,
      score: finalScore,
      questions_answered: questions.length
    });
    
    // Actualizar Racha y Puntos Totales (Lógica simplificada)
    // Aquí llamarías a una Function Edge de Supabase para actualizar el perfil de forma segura
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.2; // Más rápido, estilo gamer
    window.speechSynthesis.speak(utterance);
  };

  // --- RENDERIZADO ---

  if (gameState === 'intro') {
    return (
      <div className="bg-slate-900 p-6 rounded-xl border-2 border-blue-500 text-center">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">🎮 CHIÑO GAMER</h2>
        <p className="text-gray-300 mb-6">Demuestra cuánto sabes del Celta. 5 preguntas. 15 segundos cada una.</p>
        <button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/50 transition-all transform hover:scale-105">
          ¡JUGAR AHORA!
        </button>
      </div>
    );
  }

  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-blue-400 font-bold">Pregunta {questionIndex + 1}/5</span>
          <div className={`flex items-center gap-1 ${timer < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            <Timer size={18} /> {timer}s
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-6">{currentQuestion.question_text}</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {['A', 'B', 'C', 'D'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="p-4 bg-slate-700 hover:bg-blue-600 rounded-lg text-left transition-colors font-medium text-white border border-slate-600 hover:border-blue-400"
            >
              <span className="font-bold mr-2 text-blue-300">{opt})</span> 
              {currentQuestion[`option_${opt.toLowerCase()}`]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="bg-slate-900 p-8 rounded-xl border-2 border-yellow-500 text-center">
        <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">¡PARTIDA TERMINADA!</h2>
        <p className="text-5xl font-black text-blue-500 mb-6">{score} PTS</p>
        <p className="text-gray-400 mb-6">Has subido al ranking global. ¡Comparte tu puntuación!</p>
        <button onClick={() => setGameState('intro')} className="text-blue-400 underline">
          Volver al menú
        </button>
      </div>
    );
  }

  return null;
};

export default ChinoGamer;