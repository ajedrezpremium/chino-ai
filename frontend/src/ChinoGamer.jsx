import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Trophy, Timer, Flame, Star, ArrowLeft, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.35)
      osc.type = 'sawtooth'
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } else if (type === 'tick') {
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    } else if (type === 'fanfare') {
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g)
        g.connect(ctx.destination)
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3)
        o.start(ctx.currentTime + i * 0.15)
        o.stop(ctx.currentTime + i * 0.15 + 0.3)
      })
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.001)
    }
  } catch {}
}

const TOTAL_QUESTIONS = 10
const TIME_PER_QUESTION = 15
const STORAGE_KEY = 'chino_seen_questions'

const getSeen = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
const saveSeen = (ids) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) } catch {}
}

export default function ChinoGamer({ supabase, speak, user }) {
  const { t } = useTranslation()
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

  useEffect(() => {
    if (tab === 'playing' && timer <= 5 && timer > 0) {
      playSound('tick')
    }
  }, [timer, tab])

  useEffect(() => {
    if (tab === 'result' && score > 500) {
      playSound('fanfare')
    }
  }, [tab, score])

  const fetchQuestions = async () => {
    const seen = getSeen()
    const { data } = await supabase
      .from('game_questions')
      .select('*')
      .limit(100)
    let pool
    if (data && data.length > 0) {
      pool = data.filter(q => !seen.includes(`db_${q.id}`))
      if (pool.length < TOTAL_QUESTIONS) { pool = data; saveSeen([]) }
      const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS)
      setQuestions(shuffled.map(q => ({ ...q, _qid: `db_${q.id}` })))
    } else {
      pool = fallbackQuestions.filter((_, i) => !seen.includes(`fb_${i}`))
      if (pool.length < TOTAL_QUESTIONS) { pool = fallbackQuestions; saveSeen([]) }
      const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS)
      setQuestions(shuffled.map((q, i) => ({ ...q, _qid: `fb_${fallbackQuestions.indexOf(q)}` })))
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
      playSound('correct')
      speak(t('gamer.correct'))
    } else {
      setStreak(0)
      playSound('wrong')
    }

    setScore(s => s + points)
    setTotalPossible(t => t + (100 + timeBonus))
    setAnswers(prev => [...prev, { question: q.question_text, correct: isCorrect, selected, answer: q.correct_option }])

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1)
      setTimer(TIME_PER_QUESTION)
    } else {
      setTab('result')
      const qids = questions.map(q => q._qid)
      saveSeen([...new Set([...getSeen(), ...qids])])
      if (supabase && user?.id) {
        supabase.from('game_sessions').insert({
          user_id: user.id,
          score: score + points,
          questions_answered: TOTAL_QUESTIONS
        }).then()
      }
    }
  }

  if (tab === 'intro') {
    return (
      <main className="flex-1 overflow-y-auto p-6 z-10 flex items-center justify-center">
        {questions.length === 0 ? (
          <div className="bg-slate-800/80 border-2 border-blue-500/40 rounded-2xl p-8 text-center max-w-md w-full">
            <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4" />
            <div className="skeleton h-8 w-48 mx-auto mb-3" />
            <div className="skeleton h-4 w-32 mx-auto mb-6" />
            <div className="flex justify-center gap-4 mb-6">
              <div className="skeleton h-4 w-20" /><div className="skeleton h-4 w-14" /><div className="skeleton h-4 w-14" />
            </div>
            <div className="skeleton h-12 w-40 mx-auto rounded-full" />
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800/80 border-2 border-blue-500/40 rounded-2xl p-8 text-center max-w-md w-full">
            <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-blue-400 mb-2">{t('gamer.title').toUpperCase()}</h2>
            <p className="text-gray-300 mb-2">{t('gamer.subtitle')}</p>
            <div className="flex justify-center gap-4 mb-6 text-sm text-slate-400">
              <span><Trophy size={14} className="inline mr-1" />{TOTAL_QUESTIONS} {t('gamer.questions')}</span>
              <span><Timer size={14} className="inline mr-1" />{TIME_PER_QUESTION}{t('gamer.seconds')}</span>
              <span><Flame size={14} className="inline mr-1" />{t('gamer.streak')}</span>
            </div>
            {questions.length > 0 && (
              <button onClick={startGame}
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-500/50 transition-all transform hover:scale-105 text-lg">
                {t('gamer.start').toUpperCase()}
              </button>
            )}
          </motion.div>
        )}
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
            <span className="text-blue-400 font-bold">{t('gamer.question')} {currentIdx + 1}/{TOTAL_QUESTIONS}</span>
            <span className="text-yellow-400 font-bold">{score} {t('gamer.points')}</span>
            <div className={`flex items-center gap-1 font-mono ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              <Timer size={16} /> {timer}{t('gamer.seconds')}
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-6">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {streak > 1 && (
            <div className="text-center mb-3 text-orange-400 font-bold text-sm animate-pulse">
              <Flame size={16} className="inline mr-1" />{t('gamer.streak')} {streak}!
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
    let grade = t('gamer.grade_novice')
    if (percent >= 80) grade = t('gamer.grade_legend')
    else if (percent >= 60) grade = t('gamer.grade_starter')
    else if (percent >= 40) grade = t('gamer.grade_promise')

    return (
      <main className="flex-1 overflow-y-auto p-6 z-10 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800/80 border-2 border-yellow-500/40 rounded-2xl p-8 text-center max-w-md w-full">
          <Trophy size={72} className="text-yellow-400 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white mb-1">{t('gamer.game_over')}</h2>
          <p className="text-5xl font-black text-blue-500 mb-2">{score} {t('gamer.points')}</p>
          <p className="text-slate-400 mb-4">{correct}/{TOTAL_QUESTIONS} · {t('gamer.grade')}: <span className="text-yellow-400 font-bold">{grade}</span></p>

          <div className="space-y-2 mb-6 text-left max-h-40 overflow-y-auto">
            {answers.map((a, i) => (
              <div key={i} className={`text-xs p-2 rounded ${a.correct ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                <span className="font-bold">{i + 1}.</span> {a.correct ? '✅' : '❌'} {a.question.substring(0, 50)}...
              </div>
            ))}
          </div>

          {score > 500 && (
            <div className="text-center mb-4 text-lg animate-bounce">{t('gamer.new_record')}</div>
          )}

          <button onClick={startGame}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105">
            <RefreshCw size={16} className="inline mr-2" />{t('gamer.play_again').toUpperCase()}
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
  { question_text: 'Cantas Copas do Rey gañou o Celta?', option_a: '0', option_b: '1', option_c: '2', option_d: '3', correct_option: 'A' },
  { question_text: 'Cal é a mellor clasificación do Celta en LaLiga?', option_a: '3º', option_b: '4º', option_c: '5º', option_d: '6º', correct_option: 'B' },
  { question_text: 'En que ano chegou o Celta a semifinais da Europa League?', option_a: '2015', option_b: '2016', option_c: '2017', option_d: '2018', correct_option: 'C' },
  { question_text: 'A que equipo eliminou o Celta en Anfield?', option_a: 'Manchester United', option_b: 'Arsenal', option_c: 'Liverpool', option_d: 'Chelsea', correct_option: 'C' },
  { question_text: 'Cal é a capacidade actual de Balaídos?', option_a: '25.000', option_b: '29.000', option_c: '35.000', option_d: '42.000', correct_option: 'B' },
  { question_text: 'Quen é o xogador con máis partidos na historia do Celta?', option_a: 'Aspas', option_b: 'Manolo Rodríguez', option_c: 'Míchel Salgado', option_d: 'Hugo Mallo', correct_option: 'B' },
  { question_text: 'De que dúas fusións naceu o Celta en 1923?', option_a: 'Real Fortuna e Sporting', option_b: 'Celta FC e Vigo FC', option_c: 'Real Vigo e Athletic', option_d: 'Fortuna e Celta', correct_option: 'A' },
  { question_text: 'Que xogador do Celta gañou un Mundial?', option_a: 'Mostovoi', option_b: 'Mazinho', option_c: 'Aspas', option_d: 'Makelele', correct_option: 'B' },
  { question_text: 'En que ano inaugurouse Balaídos?', option_a: '1923', option_b: '1928', option_c: '1935', option_d: '1940', correct_option: 'B' },
  { question_text: 'Cal é o alcume de Iago Aspas?', option_a: 'O Zar', option_b: 'O Príncipe das Bateas', option_c: 'O Mago', option_d: 'A Lenda', correct_option: 'B' },
  { question_text: 'Que adestrador levou ao Celta ás semifinais de 2017?', option_a: 'Víctor Fernández', option_b: 'Luis Enrique', option_c: 'Eduardo Berizzo', option_d: 'Claudio Giráldez', correct_option: 'C' },
  { question_text: 'Cal é o máximo asistente histórico do Celta?', option_a: 'Mostovoi', option_b: 'Gustavo López', option_c: 'Aspas', option_d: 'Karpin', correct_option: 'C' },
  { question_text: 'Que xogador do Celta foi ao Mundial 2018 con España?', option_a: 'Míngueza', option_b: 'Aspas', option_c: 'Nolito', option_d: 'Veiga', correct_option: 'B' },
  { question_text: 'A que equipo lle gañou o Celta 4-0 en UEFA en Balaídos?', option_a: 'Milan', option_b: 'Juventus', option_c: 'Inter', option_d: 'Barcelona', correct_option: 'B' },
  { question_text: 'Que dorsal leva Iago Aspas?', option_a: '7', option_b: '9', option_c: '10', option_d: '17', correct_option: 'C' },
  { question_text: 'En que ano descendeu o Celta a Segunda por última vez?', option_a: '2004', option_b: '2005', option_c: '2007', option_d: '2011', correct_option: 'C' },
  { question_text: 'Quen era "O Muro" do Celta nos 90?', option_a: 'Salgado', option_b: 'Veloso', option_c: 'Patxi Salinas', option_d: 'Juanfran', correct_option: 'A' },
  { question_text: 'Que xogador ruso foi icona do EuroCelta?', option_a: 'Karpin', option_b: 'Mostovoi', option_c: 'Osipov', option_d: 'Ivanov', correct_option: 'B' },
  { question_text: 'Que canteirán foi traspasado por 40M€ ao Al-Ahli?', option_a: 'Brais Méndez', option_b: 'Gabriel Veiga', option_c: 'Hugo Mallo', option_d: 'Aspas', correct_option: 'B' },
  { question_text: 'Cal é o maior rival do Celta?', option_a: 'Barcelona', option_b: 'Dépor', option_c: 'Madrid', option_d: 'Betis', correct_option: 'B' },
  { question_text: 'En que ano se fundou o RC Celta?', option_a: '1921', option_b: '1922', option_c: '1923', option_d: '1924', correct_option: 'C' },
  { question_text: 'Cal foi o resultado do Celta vs Juventus en UEFA 1999-00?', option_a: '2-0', option_b: '3-0', option_c: '4-0', option_d: '5-0', correct_option: 'C' },
  { question_text: 'Que porteiro xogou 250 partidos co Celta?', option_a: 'Pinto', option_b: 'Sergio Álvarez', option_c: 'Rubén Blanco', option_d: 'Yoel', correct_option: 'B' },
  { question_text: 'Quen é o máximo goleador estranxeiro do Celta?', option_a: 'Mostovoi', option_b: 'Gustavo López', option_c: 'Catanha', option_d: 'Makelele', correct_option: 'A' },
  { question_text: 'Cantos goles levaba Aspas ao final da 25-26?', option_a: '180', option_b: '200', option_c: '210+', option_d: '250', correct_option: 'C' },
  { question_text: 'Que adestrador actual dirixe o Celta?', option_a: 'Benítez', option_b: 'Giráldez', option_c: 'Coudet', option_d: 'Berizzo', correct_option: 'B' },
  { question_text: 'A que equipo lle marcou Aspas o gol do centenario?', option_a: 'Madrid', option_b: 'Barcelona', option_c: 'Dépor', option_d: 'Betis', correct_option: 'B' },
  { question_text: 'En que ano foi subcampeón de Copa o Celta?', option_a: '1948', option_b: '1971', option_c: '2001', option_d: 'Todas as anteriores', correct_option: 'D' },
  { question_text: 'Que xogador africano xogou no Celta 99-02?', option_a: 'Eto\'o', option_b: 'McCarthy', option_c: 'Drogba', option_d: 'Essien', correct_option: 'B' },
  { question_text: 'Cal é a cor principal do Celta?', option_a: 'Azul', option_b: 'Celeste', option_c: 'Verde', option_d: 'Branco', correct_option: 'B' },
  { question_text: 'En que cidade está Vigo?', option_a: 'A Coruña', option_b: 'Lugo', option_c: 'Galicia', option_d: 'Pontevedra', correct_option: 'D' },
  { question_text: 'Que patrocinador principal leva o Celta?', option_a: 'Adidas', option_b: 'Estrella Galicia', option_c: 'Abanca', option_d: 'Iberdrola', correct_option: 'B' },
  { question_text: 'Cal é o alcume do Celta?', option_a: 'O Equipo Celeste', option_b: 'O Fortín', option_c: 'A Tormenta', option_d: 'O Marea', correct_option: 'A' },
  { question_text: 'Que defensa xogou 350 partidos co Celta?', option_a: 'Míngueza', option_b: 'Hugo Mallo', option_c: 'Salgado', option_d: 'Juanfran', correct_option: 'B' },
  { question_text: 'Quen marcou o gol ao Liverpool en Anfield?', option_a: 'Aspas', option_b: 'Gustavo López', option_c: 'Mostovoi', option_d: 'Karpin', correct_option: 'B' },
  { question_text: 'Cal era o alcume de Gustavo López?', option_a: 'O Mago', option_b: 'El Cuervo', option_c: 'O Loco', option_d: 'O Mestre', correct_option: 'B' },
  { question_text: 'En que ano subiu o Celta con Paco Herrera?', option_a: '2010', option_b: '2011', option_c: '2012', option_d: '2013', correct_option: 'C' },
  { question_text: 'Que xogador do Celta foi Balón de Ouro?', option_a: 'Mostovoi', option_b: 'Ningún', option_c: 'Aspas', option_d: 'Makelele', correct_option: 'B' },
  { question_text: 'Cal foi a maior goleada do Celta ao Dépor?', option_a: '6-0', option_b: '7-0', option_c: '13-0', option_d: '10-0', correct_option: 'C' },
  { question_text: 'Que xogador brasileiro estivo no Celta e no Dépor?', option_a: 'Ronaldo', option_b: 'Mazinho', option_c: 'Silvinho', option_d: 'Djalminha', correct_option: 'C' },
  { question_text: 'Cantos partidos oficiais xogou Manolo Rodríguez?', option_a: '400', option_b: '450', option_c: '500', option_d: '512', correct_option: 'D' },
  { question_text: 'Que adestrador gañou o ascenso de 1998?', option_a: 'Víctor Fernández', option_b: 'Pepe Villar', option_c: 'Fernando Vázquez', option_d: 'Irureta', correct_option: 'B' },
  { question_text: 'Cal é o récord de puntos do Celta en LaLiga?', option_a: '60', option_b: '64', option_c: '68', option_d: '72', correct_option: 'B' },
  { question_text: 'En que ano xogou o Celta Champions League?', option_a: '2001', option_b: '2002', option_c: '2003', option_d: 'Nunca', correct_option: 'D' },
  { question_text: 'Quen foi o máximo goleador do Celta nos anos 40?', option_a: 'Veloso', option_b: 'Pahiño', option_c: 'Herminio', option_d: 'Mauro', correct_option: 'B' },
  { question_text: 'Que medio inglés marcou un hat-trick co Celta?', option_a: 'Beckham', option_b: 'Lita', option_c: 'Owen', option_d: 'Rooney', correct_option: 'B' },
  { question_text: 'Que xogador galego é o capitán actual?', option_a: 'Míngueza', option_b: 'Aspas', option_c: 'Mallo', option_d: 'Beltrán', correct_option: 'B' },
  { question_text: 'En que ano naceu Iago Aspas?', option_a: '1985', option_b: '1986', option_c: '1987', option_d: '1988', correct_option: 'C' },
  { question_text: 'Cantos goles ten Mostovoi co Celta?', option_a: '50', option_b: '62', option_c: '72', option_d: '85', correct_option: 'C' },
  { question_text: 'Que selección nacional defendeu Makelele?', option_a: 'Brasil', option_b: 'Portugal', option_c: 'Francia', option_d: 'España', correct_option: 'C' },
  { question_text: 'Que compañeira de rede social ten o Celta?', option_a: 'X', option_b: 'TikTok', option_c: 'Instagram', option_d: 'Todas', correct_option: 'D' },
  { question_text: 'Quen fabrica a camiseta do Celta?', option_a: 'Nike', option_b: 'Adidas', option_c: 'Hummel', option_d: 'Puma', correct_option: 'B' },
  { question_text: 'Cantos filiais ten o Celta?', option_a: 'Celta B', option_b: 'Celta C Gran Peña', option_c: 'Ambas', option_d: 'Ningún', correct_option: 'C' },
  { question_text: 'Que presidente recolleu o legado de Horacio Gómez?', option_a: 'Mouriño pai', option_b: 'Carlos Mouriño', option_c: 'Marián Mouriño', option_d: 'Abel Caballero', correct_option: 'C' },
  { question_text: 'En que ano morreu Mostovoi futbolisticamente para o Celta?', option_a: '2002', option_b: '2003', option_c: '2004', option_d: '2005', correct_option: 'C' },
  { question_text: 'Que equipo inglés eliminou ao Celta en 2017?', option_a: 'Arsenal', option_b: 'Chelsea', option_c: 'Manchester United', option_d: 'Liverpool', correct_option: 'C' },
  { question_text: 'Cal foi o marcador en Old Trafford 2017?', option_a: '1-0', option_b: '1-1', option_c: '2-0', option_d: '2-1', correct_option: 'B' },
  { question_text: 'Cantos partidos sen perder en casa tivo o Celta en 2015-16?', option_a: '10', option_b: '11', option_c: '12', option_d: '13', correct_option: 'D' },
  { question_text: 'Que xogador marcou o gol do ascenso 2012?', option_a: 'Aspas', option_b: 'De Lucas', option_c: 'Oubiña', option_d: 'Bermejo', correct_option: 'D' },
  { question_text: 'Cal é a porcentaxe de acerto de pase de Aspas?', option_a: '75%', option_b: '80%', option_c: '82%', option_d: '85%', correct_option: 'C' },
  { question_text: 'Que deportista ten unha rúa en Vigo?', option_a: 'Mostovoi', option_b: 'Aspas', option_c: 'Salgado', option_d: 'Ningún', correct_option: 'B' },
  { question_text: 'Cal é o himno do Celta?', option_a: 'O Himno Galego', option_b: 'O Himno Celeste', option_c: 'Celtiña', option_d: 'Balaídos Canta', correct_option: 'C' },
  { question_text: 'En que ano se estreou o himno actual?', option_a: '1990', option_b: '1998', option_c: '2003', option_d: '2015', correct_option: 'C' },
  { question_text: 'Que equipo vasco eliminou ao Celta en Copa 94?', option_a: 'Athletic', option_b: 'Real Sociedad', option_c: 'Zaragoza', option_d: 'Osasuna', correct_option: 'C' },
  { question_text: 'Que xogador do Celta xogou no Real Madrid?', option_a: 'Aspas', option_b: 'Salgado', option_c: 'Mostovoi', option_d: 'Gustavo López', correct_option: 'B' },
  { question_text: 'Cal era o alcume de Patxi Salinas?', option_a: 'O Muro', option_b: 'O León', option_c: 'A Roca vasca', option_d: 'O Toro', correct_option: 'C' },
  { question_text: 'Que xogador uruguaio xogou no Celta de Berizzo?', option_a: 'Suárez', option_b: 'Cavani', option_c: 'Maxi Gómez', option_d: 'Godín', correct_option: 'C' },
  { question_text: 'Cantos goles marcou Maxi Gómez co Celta?', option_a: '30', option_b: '40', option_c: '50', option_d: '60', correct_option: 'A' },
  { question_text: 'Que xogador do Celta foi internacional con Portugal?', option_a: 'Silvinho', option_b: 'Neno', option_c: 'Otávio', option_d: 'Ningún', correct_option: 'C' },
  { question_text: 'En que ano debutou Aspas co primeiro equipo?', option_a: '2006', option_b: '2007', option_c: '2008', option_d: '2009', correct_option: 'C' },
  { question_text: 'Que empresario galego preside o Celta?', option_a: 'Amancio Ortega', option_b: 'Marián Mouriño', option_c: 'Carlos Mouriño', option_d: 'Pablo Lago', correct_option: 'B' },
  { question_text: 'Cantos goles lle marcou o Celta ao Milan?', option_a: '1-0', option_b: '2-0', option_c: '3-0', option_d: '4-0', correct_option: 'C' },
  { question_text: 'En que ano se chamou por primeira vez "O noso Celta"?', option_a: '1923', option_b: '1948', option_c: '1970', option_d: '1992', correct_option: 'A' },
  { question_text: 'Que ten de especial o 23 de agosto?', option_a: 'Aniversario do Celta', option_b: 'Debut de Aspas', option_c: 'Inauguración de Balaídos', option_d: 'Nada', correct_option: 'A' },
  { question_text: 'Cantos ascensos ten o Celta?', option_a: '3', option_b: '4', option_c: '5', option_d: '6', correct_option: 'C' },
  { question_text: 'Cal foi o máximo goleador do Celta nos anos 90?', option_a: 'Mostovoi', option_b: 'Gudelj', option_c: 'Catanha', option_d: 'Salinas', correct_option: 'C' },
  { question_text: 'Que país visitou o Celta na súa primeira xira?', option_a: 'Portugal', option_b: 'Francia', option_c: 'Inglaterra', option_d: 'Italia', correct_option: 'B' },
  { question_text: 'Cal era o alcume de Vladimir Gudelj?', option_a: 'O Xigante', option_b: 'O Tanque', option_c: 'O Canón', option_d: 'A Torre', correct_option: 'B' },
  { question_text: 'Que xogador do Celta xogou 4 Mundiais?', option_a: 'Aspas', option_b: 'Mostovoi', option_c: 'Makelele', option_d: 'Mazinho', correct_option: 'C' },
  { question_text: 'En que ano se retirou Míchel Salgado?', option_a: '2006', option_b: '2008', option_c: '2010', option_d: '2012', correct_option: 'D' },
  { question_text: 'Cal foi o primeiro partido do Celta en Primeira?', option_a: '1923', option_b: '1929', option_c: '1935', option_d: '1940', correct_option: 'D' },
  { question_text: 'Cantos goles precisa Aspas para chegar a 250?', option_a: '30', option_b: '35', option_c: '40', option_d: '45', correct_option: 'C' },
  { question_text: 'Que adestrador do Celta gañou unha Champions?', option_a: 'Berizzo', option_b: 'Benítez', option_c: 'Luis Enrique', option_d: 'Víctor Fernández', correct_option: 'C' },
  { question_text: 'Cal é a posición natural de Míngueza?', option_a: 'Lateral', option_b: 'Central', option_c: 'Medio', option_d: 'Ambas', correct_option: 'D' },
  { question_text: 'Que di o lema do Celta?', option_a: 'A nosa forza', option_b: 'O noso Celta', option_c: 'Celta sempre', option_d: 'Todos xuntos', correct_option: 'B' },
  { question_text: 'Cal é a web oficial do Celta?', option_a: 'rccelta.es', option_b: 'celta.vigo.es', option_c: 'rcceltaoficial.com', option_d: 'rccelta.es', correct_option: 'D' },
  { question_text: 'En que ano morreu Pahiño?', option_a: '2008', option_b: '2010', option_c: '2012', option_d: '2015', correct_option: 'C' },
  { question_text: 'Que xogador xogou no Celta e no Barcelona?', option_a: 'Luis Enrique', option_b: 'Aspas', option_c: 'Nolito', option_d: 'Todos', correct_option: 'D' },
  { question_text: 'Cantos Balóns de Ouro ten un xogador do Celta?', option_a: '0', option_b: '1', option_c: '2', option_d: '3', correct_option: 'A' },
  { question_text: 'Cal é o alcume de Balaídos?', option_a: 'O Fortín', option_b: 'O Templo', option_c: 'A Catedral', option_d: 'O Coliseo', correct_option: 'A' },
  { question_text: 'Que adestrador galego dirixe o Celta 2026?', option_a: 'Berizzo', option_b: 'Giráldez', option_c: 'Vázquez', option_d: 'López Caro', correct_option: 'B' },
  { question_text: 'Cantos goles fixo Borja Iglesias na 25-26?', option_a: '10', option_b: '12', option_c: '14', option_d: '16', correct_option: 'C' },
  { question_text: 'Que xogador é coñecido como "O Panda"?', option_a: 'Aspas', option_b: 'Borja Iglesias', option_c: 'Pablo Durán', option_d: 'Sverre Nypan', correct_option: 'B' },
  { question_text: 'Que xogador noruegués xoga no Celta 2026?', option_a: 'Haaland', option_b: 'Nypan', option_c: 'Ødegaard', option_d: 'Sørloth', correct_option: 'B' },
  { question_text: 'En que ano xogou o Celta a Copa Intertoto?', option_a: '1999', option_b: '2000', option_c: '2001', option_d: '2002', correct_option: 'B' },
  { question_text: 'Contra quen debutou o Celta en 1923?', option_a: 'Boetticher', option_b: 'Fortuna', option_c: 'Dépor', option_d: 'Madrid', correct_option: 'A' },
  { question_text: 'Cantos goles marcou Catanha co Celta?', option_a: '35', option_b: '40', option_c: '45', option_d: '50', correct_option: 'C' },
  { question_text: 'Que lateral esquerdo xogou no Celta e Arsenal?', option_a: 'Silvinho', option_b: 'Roberto Lago', option_c: 'Javi López', option_d: 'Mathieu', correct_option: 'A' },
  { question_text: 'Que centrocampista galego xogou no Celta e Valencia?', option_a: 'Veiga', option_b: 'Brais Méndez', option_c: 'Oubiña', option_d: 'Beltrán', correct_option: 'B' },
  { question_text: 'Que popular xogador de México xogou no Celta?', option_a: 'Chicharito', option_b: 'Ningún', option_c: 'Guardado', option_d: 'Lozano', correct_option: 'C' },
  { question_text: 'Que equipo andaluz eliminou ao Celta en Copa 2001?', option_a: 'Sevilla', option_b: 'Betis', option_c: 'Zaragoza', option_d: 'Espanyol', correct_option: 'C' },
  { question_text: 'Cantos goles marcou Lubo Penev co Celta?', option_a: '15', option_b: '20', option_c: '25', option_d: '30', correct_option: 'B' },
  { question_text: 'Que xogador do Celta foi campión do Mundo 1994?', option_a: 'Mostovoi', option_b: 'Mazinho', option_c: 'Makelele', option_d: 'Salgado', correct_option: 'B' },
  { question_text: 'Cal foi o resultado Celta 7-0 Real Unión en que ano?', option_a: '1928', option_b: '1935', option_c: '1940', option_d: '1950', correct_option: 'A' },
  { question_text: 'Cal foi o récord de asistencia en Balaídos?', option_a: '35.000', option_b: '40.000', option_c: '42.000', option_d: '45.000', correct_option: 'D' },
  { question_text: 'Contra que equipo foi o 45.000 de Balaídos 1941?', option_a: 'Madrid', option_b: 'Barcelona', option_c: 'Athletic', option_d: 'Sevilla', correct_option: 'B' },
  { question_text: 'Que selección galega de fútbol existe?', option_a: 'Si', option_b: 'Non', option_c: 'Aínda non', option_d: 'Extinta', correct_option: 'C' },
  { question_text: 'Quen canta o himno Celtiña?', option_a: 'Milladoiro', option_b: 'Luís Emilio Batallán', option_c: 'Carlos Núñez', option_d: 'Siniestro Total', correct_option: 'B' },
  { question_text: 'En que ano se fundou a Federación Galega de Fútbol?', option_a: '1905', option_b: '1909', option_c: '1915', option_d: '1923', correct_option: 'B' },
  { question_text: 'Que presidente construíu Balaídos?', option_a: 'Bárcena', option_b: 'Dopazo', option_c: 'Mouriño', option_d: 'Cesáreo González', correct_option: 'B' },
  { question_text: 'Cal foi o primeiro partido do Celta en competición oficial?', option_a: 'vs Boetticher', option_b: 'vs Dépor', option_c: 'vs Fortuna', option_d: 'vs Madrid', correct_option: 'A' },
  { question_text: 'Que porteiro ten máis clean sheets na historia do Celta?', option_a: 'Sergio Álvarez', option_b: 'Rubén Blanco', option_c: 'Pinto', option_d: 'Cañizares', correct_option: 'A' },
  { question_text: 'Cantos partidos xogou Mostovoi co Celta?', option_a: '215', option_b: '225', option_c: '235', option_d: '245', correct_option: 'C' },
  { question_text: 'Quen é o máximo goleador do Celta en competicións europeas?', option_a: 'Aspas', option_b: 'Mostovoi', option_c: 'Catanha', option_d: 'Karpin', correct_option: 'A' },
  { question_text: 'En que ano gañou o Celta a Copa Intertoto?', option_a: '1998', option_b: '1999', option_c: '2000', option_d: 'Non a gañou', correct_option: 'D' },
  { question_text: 'Que xogador do Celta xogou no Barça e no Madrid?', option_a: 'Aspas', option_b: 'Luis Enrique', option_c: 'Nolito', option_d: 'Salgado', correct_option: 'B' },
  { question_text: 'Cal era o alcume de Fernando Cáceres?', option_a: 'O Muro', option_b: 'O Toro', option_c: 'O León', option_d: 'O Xigante', correct_option: 'B' },
  { question_text: 'Cantos goles marcou Pahiño en 1947-48?', option_a: '20', option_b: '23', option_c: '26', option_d: '30', correct_option: 'B' },
  { question_text: 'Que xogador do Celta foi campión de Europa 1998?', option_a: 'Mazinho', option_b: 'Makelele', option_c: 'Karpin', option_d: 'Ningún', correct_option: 'B' },
  { question_text: 'Cal é a derrota máis dura do Celta en UEFA?', option_a: '6-0 vs Barça', option_b: '7-0 vs Madrid', option_c: '5-1 vs Juventus', option_d: '4-0 vs Manchester', correct_option: 'C' },
  { question_text: 'Que adestrador dirixiu máis partidos ao Celta en Primeira?', option_a: 'Berizzo', option_b: 'Víctor Fernández', option_c: 'Roque Olsen', option_d: 'Claudio Giráldez', correct_option: 'C' },
  { question_text: 'Cantos goles lle marcou o Celta ao Barcelona en 2017?', option_a: '3', option_b: '4', option_c: '5', option_d: '6', correct_option: 'B' },
  { question_text: 'Que xogador do Celta foi máximo asistente de LaLiga en 2023?', option_a: 'Aspas', option_b: 'Brais Méndez', option_c: 'Veiga', option_d: 'Beltrán', correct_option: 'B' },
  { question_text: 'En que ano rematou o Celta 4º en LaLiga?', option_a: '1948 e 2003', option_b: '1999 e 2006', option_c: '2001 e 2017', option_d: '1971 e 1998', correct_option: 'A' },
  { question_text: 'Que di o artigo 1 dos estatutos do Celta?', option_a: 'O Celta é de Vigo', option_b: 'O Celta é de Galicia', option_c: 'O Celta é de todos', option_d: 'O Celta é celeste', correct_option: 'B' },
  { question_text: 'Que xogador do Celta marcou 15 goles nunha tempada de Segunda?', option_a: 'Pichi Lucas', option_b: 'Bermejo', option_c: 'Pahíño', option_d: 'Manolo', correct_option: 'A' },
  { question_text: 'Cantos partidos oficiais ten Iago Aspas co Celta?', option_a: '400', option_b: '425', option_c: '450+', option_d: '500+', correct_option: 'C' },
  { question_text: 'Que xogador do Celta foi subcampión do Mundo 2006?', option_a: 'Makelele', option_b: 'Mazinho', option_c: 'Ningún', option_d: 'Karpin', correct_option: 'C' },
  { question_text: 'Cal era o alcume de Manolo Rodríguez?', option_a: 'O Capitán', option_b: 'O Galego', option_c: 'O Muro', option_d: 'A Lenda', correct_option: 'A' },
  { question_text: 'En que ano se creou o Celta B?', option_a: '1927', option_b: '1937', option_c: '1947', option_d: '1957', correct_option: 'C' },
  { question_text: 'Que xogador do Celta se chamaba O\'Donell?', option_a: 'Un porteiro', option_b: 'Un dianteiro', option_c: 'Un defensa', option_d: 'Un medio', correct_option: 'B' },
  { question_text: 'Cantos goles marcou Nolete na 39-40?', option_a: '8', option_b: '10', option_c: '12', option_d: '14', correct_option: 'C' },
  { question_text: 'Que xogador do Celta é coñecido como "Panda"?', option_a: 'Aspas', option_b: 'Borja Iglesias', option_c: 'Pablo Durán', option_d: 'Sverre Nypan', correct_option: 'B' },
  { question_text: 'Cal foi o resultado Celta 4-0 Juventus en 1999?', option_a: 'Amistoso', option_b: 'UEFA', option_c: 'Copa', option_d: 'Champions', correct_option: 'B' },
  { question_text: 'Que xogador marcou o 4-0 ao Juventus?', option_a: 'Mostovoi', option_b: 'Karpin', option_c: 'McCarthy', option_d: 'Gustavo López', correct_option: 'C' },
  { question_text: 'En que ano ascendeu o Celta por primeira vez?', option_a: '1931', option_b: '1932', option_c: '1936', option_d: '1940', correct_option: 'C' },
  { question_text: 'Que adestrador levou ao Celta ao 4º posto en 1948?', option_a: 'Ricardo Comesaña', option_b: 'Pasarín', option_c: 'Roque Olsen', option_d: 'Luis Urquiri', correct_option: 'B' },
  { question_text: 'Cal é o segundo goleador histórico do Celta?', option_a: 'Gudelj', option_b: 'Pahiño', option_c: 'Mostovoi', option_d: 'Catanha', correct_option: 'B' },
  { question_text: 'Que xogador do Celta gañou 5 Ligas con outro club?', option_a: 'Makelele', option_b: 'Salgado', option_c: 'Luis Enrique', option_d: 'Todos', correct_option: 'D' },
  { question_text: 'En que ano se puxo céspede en Balaídos?', option_a: '1970', option_b: '1982', option_c: '1990', option_d: '2000', correct_option: 'B' },
  { question_text: 'Que empresa puxo o céspede artificial en 1982?', option_a: 'Google', option_b: 'Mondo', option_c: 'Nike', option_d: 'Adidas', correct_option: 'B' },
  { question_text: 'Quen é o xogador máis novo en debutar co Celta?', option_a: 'Aspas', option_b: 'Veiga', option_c: 'Sotelo', option_d: 'Mallo', correct_option: 'C' },
  { question_text: 'Cal foi o primeiro xogador do Celta en ir a un Mundial?', option_a: 'Pahiño', option_b: 'Herminio', option_c: 'Mazinho', option_d: 'Nolito', correct_option: 'B' },
]

