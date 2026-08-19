import { FormEvent, useState } from 'react'
import { WORDS } from './data/words'
import type { Word } from './types'

type Screen = 'start' | 'learn' | 'quiz' | 'write' | 'result' | 'soon'
const TODAY = WORDS.slice(0, 5)

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const voice = new SpeechSynthesisUtterance(text)
  voice.lang = 'en-US'
  voice.rate = 0.85
  window.speechSynthesis.speak(voice)
}

function Header({ title, index, stage, home }: { title: string; index: number; stage: number; home: () => void }) {
  return <header className="game-header">
    <button onClick={home} aria-label="처음으로">×</button>
    <div><p>{title}</p><div className="progress"><span style={{ width: `${((stage * 5 + index + 1) / 15) * 100}%` }} /></div></div>
    <strong>{index + 1}<small>/5</small></strong>
  </header>
}

function Start({ start, soon }: { start: () => void; soon: () => void }) {
  return <main className="screen start">
    <div className="logo">A<span>가</span></div>
    <p className="kicker">매일 가볍게, 딱 다섯 개</p>
    <h1>오늘의<br /><em>5단어</em></h1>
    <p className="intro">보고, 고르고, 직접 쓰며<br />영어 단어를 익혀보세요.</p>
    <button className="primary" onClick={start}>게임 시작 <span>→</span></button>
    <button className="mini-menu" onClick={soon}>💬 이 말 영어로 뭐야? <small>준비 중</small></button>
  </main>
}

function WordView({ word, small = false }: { word: Word; small?: boolean }) {
  return <div className={`word-view ${small ? 'small' : ''}`}><div className="emoji">{word.emoji}</div><h2>{word.word}</h2><p>{word.meaning}</p></div>
}

function Learn({ index, next, home }: { index: number; next: () => void; home: () => void }) {
  const word = TODAY[index]
  return <main className="screen game"><Header title="단어 배우기" index={index} stage={0} home={home} />
    <section className="card"><WordView word={word} /><button className="speak" onClick={() => speak(word.word)} disabled={!('speechSynthesis' in window)}>🔊 발음 듣기</button><div className="example"><strong>{word.example}</strong><span>{word.exampleKorean}</span></div></section>
    <button className="primary bottom" onClick={next}>{index === 4 ? '문제 풀기' : '다음'} <span>→</span></button>
  </main>
}

function optionsFor(word: Word, index: number) {
  return [word, WORDS[index + 5], WORDS[(index + 7) % WORDS.length]].sort((a, b) => (a.word + word.word).localeCompare(b.word + word.word))
}

function Quiz({ index, score, answer, next, home }: { index: number; score: number; answer: (ok: boolean) => void; next: () => void; home: () => void }) {
  const word = TODAY[index]
  const [choice, setChoice] = useState<string | null>(null)
  const choose = (option: Word) => { if (choice) return; setChoice(option.word); answer(option.word === word.word) }
  return <main className="screen game" key={`q${index}`}><Header title="뜻 맞히기" index={index} stage={1} home={home} /><div className="score">⭐ {score}</div>
    <section className="question"><WordView word={word} small /><p>무슨 뜻일까요?</p></section>
    <div className="options">{optionsFor(word, index).map((option) => <button key={option.word} onClick={() => choose(option)} disabled={Boolean(choice)} className={choice ? option.word === word.word ? 'right' : option.word === choice ? 'wrong' : '' : ''}><span>{option.meaning}</span><b>{choice && option.word === word.word ? '✓' : choice === option.word ? '×' : ''}</b></button>)}</div>
    {choice && <Feedback correct={choice === word.word} wrongText={`정답은 '${word.meaning}'이에요.`} next={next} />}
  </main>
}

function Feedback({ correct, wrongText, next, last = false }: { correct: boolean; wrongText: string; next: () => void; last?: boolean }) {
  return <div className={`feedback ${correct ? 'right' : 'wrong'}`} role="status"><strong>{correct ? '정답! +1 ⭐' : wrongText}</strong><button onClick={next}>{last ? '결과 보기' : '다음'} →</button></div>
}

function Write({ index, score, answer, next, home }: { index: number; score: number; answer: (ok: boolean) => void; next: () => void; home: () => void }) {
  const word = TODAY[index]
  const [input, setInput] = useState('')
  const [correct, setCorrect] = useState<boolean | null>(null)
  const submit = (event: FormEvent) => { event.preventDefault(); if (!input.trim() || correct !== null) return; const ok = input.trim().toLowerCase() === word.word; setCorrect(ok); answer(ok) }
  return <main className="screen game" key={`w${index}`}><Header title="직접 쓰기" index={index} stage={2} home={home} /><div className="score">⭐ {score}</div>
    <section className="write-question"><div className="emoji">{word.emoji}</div><h2>{word.meaning}</h2><p>영어로 써보세요.</p></section>
    <form className="write-form" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="영어 단어 입력" aria-label="영어 단어 입력" autoCapitalize="none" autoComplete="off" disabled={correct !== null} autoFocus />{correct === null && <button className="primary" disabled={!input.trim()}>확인</button>}</form>
    {correct !== null && <Feedback correct={correct} wrongText={`정답은 ${word.word}예요.`} next={next} last={index === 4} />}
  </main>
}

function Result({ score, retry, home }: { score: number; retry: () => void; home: () => void }) {
  return <main className="screen result"><div className="party">🎉</div><p className="kicker">TODAY COMPLETE</p><h1>오늘의 5단어<br />완료!</h1><div className="result-score"><strong>{score} / 10</strong><span>정답</span></div><section className="learned"><p>오늘 배운 단어</p><div>{TODAY.map((word) => <span key={word.word}>{word.emoji} {word.word}</span>)}</div></section><button className="primary" onClick={retry}>다시 하기</button><button className="secondary" onClick={home}>처음으로</button></main>
}

function Soon({ home }: { home: () => void }) {
  return <main className="screen soon"><div className="soon-icon">💬</div><p className="kicker">COMING SOON</p><h1>이 말 영어로<br />뭐야?</h1><p>한국어를 쉬운 영어로 바꿔주는 기능을 준비하고 있어요.</p><button className="primary" onClick={home}>처음으로</button></main>
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const reset = (screen: Screen) => { setIndex(0); setScore(0); setScreen(screen) }
  const advance = (current: Screen, next: Screen) => index === 4 ? (setIndex(0), setScreen(next)) : setIndex(index + 1)
  const answer = (ok: boolean) => { if (ok) setScore((value) => value + 1) }
  if (screen === 'learn') return <Learn index={index} next={() => advance('learn', 'quiz')} home={() => reset('start')} />
  if (screen === 'quiz') return <Quiz key={`quiz-${index}`} index={index} score={score} answer={answer} next={() => advance('quiz', 'write')} home={() => reset('start')} />
  if (screen === 'write') return <Write key={`write-${index}`} index={index} score={score} answer={answer} next={() => advance('write', 'result')} home={() => reset('start')} />
  if (screen === 'result') return <Result score={score} retry={() => reset('learn')} home={() => reset('start')} />
  if (screen === 'soon') return <Soon home={() => reset('start')} />
  return <Start start={() => reset('learn')} soon={() => setScreen('soon')} />
}
