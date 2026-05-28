import React, { useState, useEffect, useCallback } from 'react'
import { Trophy, Timer, Flame, Star, ArrowLeft, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TOTAL_QUESTIONS = 5
const TIME_PER_QUESTION = 15

export default function ChinoGamer({ supabase, speak }) {
  const [tab, setTab] = useState('intro')
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timer, setTimer] = useState(TIME_PER_QUESTION)
  const [answers, setAnswers] = useState([])
  const [totalPossible, setTotalPossible] = useState(0)

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    if (tab === 'playing' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    } else if (tab === 'playing' && timer === 0) {
      handleAnswer(null)
    }
  }, [timer, tab])

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('game_questions')
      .select('*')
      .limit(TOTAL_QUESTIONS)
    if (data && data.length > 0) {
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS)
      setQuestions(shuffled)
    } else {
      setQuestions(fallbackQuestions)
    }
  }

  const startGame = () => {
    setTab('playing')
    setCurrentIdx(0)
    setScore(0)
    setStreak(0)
    setTimer(TIME_PER_QUESTION)
    setAnswers([])
    setTotalPossible(0)
  }

  const handleAnswer = (selected) => {
    if (currentIdx >= questions.length) return

    const q = questions[currentIdx]
    const isCorrect = selected === q.correct_option
    const timeBonus = timer * 10
    const streakBonus = streak * 25
    const points = isCorrect ? (100 + timeBonus + streakBonus) : 0

    if (isCorrect) {
      setStreak(s => s + 1)
      speak('Correcto! Boa xogada!')
    } else {
      setStreak(0)
    }

    setScore(s => s + points)
    setTotalPossible(t => t + (100 + timeBonus))
    setAnswers(prev => [...prev, { question: q.question_text, correct: isCorrect, selected, answer: q.correct_option }])

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1)
      setTimer(TIME_PER_QUESTION)
    } else {
      setTab('result')
      if (supabase) {
        supabase.from('game_sessions').insert({
          score: score + points,
          questions_answered: TOTAL_QUESTIONS
        }).then()
      }
    }
  }

  if (tab === 'intro') {
    return (
      <main className="flex-1 overflow-y-auto p-6 z-10 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800/80 border-2 border-blue-500/40 rounded-2xl p-8 text-center max-w-md w-full">
          <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-blue-400 mb-2">CHIÑO GAMER</h2>
          <p className="text-gray-300 mb-2">O Desafío Celeste</p>
          <div className="flex justify-center gap-4 mb-6 text-sm text-slate-400">
            <span><Trophy size={14} className="inline mr-1" />{TOTAL_QUESTIONS} preguntas</span>
            <span><Timer size={14} className="inline mr-1" />{TIME_PER_QUESTION}s</span>
            <span><Flame size={14} className="inline mr-1" />Rachas</span>
          </div>
          {questions.length > 0 && (
            <button onClick={startGame}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-500/50 transition-all transform hover:scale-105 text-lg">
              XOGAR AGORA
            </button>
          )}
        </motion.div>
      </main>
    )
  }

  if (tab === 'playing' && questions.length > 0) {
    const q = questions[currentIdx]
    const progress = ((currentIdx) / TOTAL_QUESTIONS) * 100

    return (
      <main className="flex-1 overflow-y-auto p-4 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="text-blue-400 font-bold">Pregunta {currentIdx + 1}/{TOTAL_QUESTIONS}</span>
            <span className="text-yellow-400 font-bold">{score} pts</span>
            <div className={`flex items-center gap-1 font-mono ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              <Timer size={16} /> {timer}s
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-6">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {streak > 1 && (
            <div className="text-center mb-3 text-orange-400 font-bold text-sm animate-pulse">
              <Flame size={16} className="inline mr-1" />Racha de {streak}!
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={currentIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <h3 className="text-lg font-bold text-white mb-6">{q.question_text}</h3>
              <div className="grid grid-cols-1 gap-3">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <button key={opt} onClick={() => handleAnswer(opt)}
                    className="p-4 bg-slate-700/80 hover:bg-blue-600 rounded-xl text-left transition-all font-medium text-white border border-slate-600 hover:border-blue-400 active:scale-[0.98]">
                    <span className="font-bold mr-2 text-blue-300">{opt})</span>{q[`option_${opt.toLowerCase()}`]}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    )
  }

  if (tab === 'result') {
    const correct = answers.filter(a => a.correct).length
    const percent = Math.round((correct / TOTAL_QUESTIONS) * 100)
    let grade = 'Novato'
    if (percent >= 80) grade = 'Lenda'
    else if (percent >= 60) grade = 'Titular'
    else if (percent >= 40) grade = 'Promesa'

    return (
      <main className="flex-1 overflow-y-auto p-6 z-10 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800/80 border-2 border-yellow-500/40 rounded-2xl p-8 text-center max-w-md w-full">
          <Trophy size={72} className="text-yellow-400 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white mb-1">PARTIDA COMPLETA!</h2>
          <p className="text-5xl font-black text-blue-500 mb-2">{score} pts</p>
          <p className="text-slate-400 mb-4">{correct}/{TOTAL_QUESTIONS} acertadas · Nivel: <span className="text-yellow-400 font-bold">{grade}</span></p>

          <div className="space-y-2 mb-6 text-left max-h-40 overflow-y-auto">
            {answers.map((a, i) => (
              <div key={i} className={`text-xs p-2 rounded ${a.correct ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                <span className="font-bold">{i + 1}.</span> {a.correct ? '✅' : '❌'} {a.question.substring(0, 50)}...
              </div>
            ))}
          </div>

          {score > 500 && (
            <div className="text-center mb-4 text-lg animate-bounce">🎉 NOVO RÉCORD! 🎉</div>
          )}

          <button onClick={startGame}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105">
            <RefreshCw size={16} className="inline mr-2" />XOGAR DE NOVO
          </button>
        </motion.div>
      </main>
    )
  }

  return null
}

const fallbackQuestions = [
  { question_text: 'En que ano se fundou o Celta?', option_a: '1906', option_b: '1923', option_c: '1931', option_d: '1945', correct_option: 'B' },
  { question_text: 'Quen é o máximo goleador histórico?', option_a: 'Mostovoi', option_b: 'Salgado', option_c: 'Iago Aspas', option_d: 'Gustavo López', correct_option: 'C' },
  { question_text: 'Como se chama o estadio do Celta?', option_a: 'Riazor', option_b: 'San Mamés', option_c: 'Balaídos', option_d: 'O Molinón', correct_option: 'C' },
  { question_text: 'Que xogador era O Zar?', option_a: 'Mazinho', option_b: 'Mostovoi', option_c: 'Veloso', option_d: 'Salinas', correct_option: 'B' },
  { question_text: 'Primeiro presidente do Celta?', option_a: 'Mouriño', option_b: 'Bárcena', option_c: 'Muñoz', option_d: 'Fernández', correct_option: 'B' },
]
