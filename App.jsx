import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Crown,
  Gamepad2,
  Menu,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { questions } from './data/questions'
import { saveResearch, supabaseConfigured } from './lib/supabase'
import { Brand } from './components/Brand'
import { ProgressBar } from './components/ProgressBar'
import { OptionCard } from './components/OptionCard'

const STORAGE_KEY = 'til-player-research-v3'
const ACCENTS = ['#FFC52B', '#EC2A8C', '#8B5CF6', '#B8F34C']

function getAccent(step) {
  return ACCENTS[step % ACCENTS.length]
}

function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(loadAnswers)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [syncNote, setSyncNote] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const question = questions[step]
  const total = questions.length
  const accent = getAccent(step)
  const answer = answers[question?.id]
  const progress = ((step + 1) / total) * 100

  const canContinue = useMemo(() => {
    if (!question) return false
    if (question.type === 'grid') return question.rows.every(row => answers[question.id]?.[row])
    if (question.type === 'text') return Boolean(answer?.trim())
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
  }, [question, answers, answer])

  const setAnswer = (value) => {
    setError('')
    setAnswers(prev => ({ ...prev, [question.id]: value }))
  }

  const choose = (value) => {
    if (question.type === 'multi') {
      const current = Array.isArray(answer) ? answer : []
      if (current.includes(value)) return setAnswer(current.filter(v => v !== value))
      if (current.length >= question.max) return setError(`Maksimal ${question.max} pilihan.`)
      return setAnswer([...current, value])
    }
    setAnswer(value)
  }

  const chooseGrid = (row, value) => {
    setAnswer({ ...(answers[question.id] || {}), [row]: value })
  }

  const start = () => {
    setAboutOpen(false)
    setScreen('research')
    setStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = async () => {
    if (!canContinue) {
      setError(question.type === 'grid' ? 'Lengkapi semua baris sebelum lanjut.' : 'Pilih jawaban untuk melanjutkan.')
      return
    }
    if (step < total - 1) {
      setStep(prev => prev + 1)
      setError('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    setSyncNote('')
    try {
      await saveResearch(answers, { source: new URLSearchParams(location.search).get('source') || 'direct' })
      localStorage.removeItem(STORAGE_KEY)
      setScreen('complete')
    } catch (error) {
      console.error(error)
      setSyncNote('Server belum tersambung. Jawaban tetap dianggap tersimpan di browser ini.')
      setScreen('complete')
    } finally {
      setSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const back = () => {
    setError('')
    if (step > 0) setStep(prev => prev - 1)
    else setScreen('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (screen === 'complete') {
    return <Completion synced={supabaseConfigured && !syncNote} syncNote={syncNote} onHome={() => setScreen('landing')} />
  }

  if (screen === 'research') {
    return (
      <ResearchShell
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onHome={() => setScreen('landing')}
        onAbout={() => setAboutOpen(true)}
        accent={accent}
      >
        <section className="research-shell">
          <div className="research-meta">
            <div>
              <span className="eyebrow" style={{ color: accent }}>{question.eyebrow}</span>
              <strong>{String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</strong>
            </div>
            <span className="meta-note">PLAYER RESEARCH</span>
          </div>
          <ProgressBar value={progress} color={accent} />

          <div className="question-card" style={{ '--accent': accent, '--accent-soft': `${accent}13` }}>
            <div className="question-card__decor decor-a" />
            <div className="question-card__decor decor-b" />
            <div className="question-card__head">
              <span className="eyebrow">{question.section}</span>
              <div className="color-dots" aria-hidden="true">
                {ACCENTS.map(color => <span key={color} style={{ backgroundColor: color }} />)}
              </div>
            </div>
            <h1>{question.question}</h1>
            {question.helper && <p className="question-helper">{question.helper}</p>}

            <div className="question-body">
              {question.type === 'single' && question.options.map((item, index) => (
                <OptionCard key={item} label={item} index={index} accent={accent} selected={answer === item} onClick={() => choose(item)} />
              ))}
              {question.type === 'multi' && question.options.map((item, index) => (
                <OptionCard key={item} label={item} index={index} accent={accent} selected={Array.isArray(answer) && answer.includes(item)} multi onClick={() => choose(item)} />
              ))}
              {question.type === 'scale' && <Scale question={question} value={answer} onChoose={choose} accent={accent} />}
              {question.type === 'interest' && <Interest value={answer} onChoose={choose} accent={accent} />}
              {question.type === 'grid' && <ImportanceGrid question={question} answers={answers} onChoose={chooseGrid} accent={accent} />}
              {question.type === 'text' && <textarea value={answer || ''} onChange={event => setAnswer(event.target.value)} placeholder={question.placeholder} rows={7} autoFocus />}
            </div>
          </div>

          {error && <div className="answer-error">{error}</div>}

          <div className="research-actions">
            <button type="button" className="ghost-button" onClick={back}>
              <ArrowLeft size={18} />
              KEMBALI
            </button>
            <button type="button" className="primary-button" style={{ backgroundColor: accent, color: accent === '#B8F34C' || accent === '#FFC52B' ? '#07090d' : '#fff' }} onClick={next} disabled={submitting}>
              {submitting ? 'MENYIMPAN…' : step === total - 1 ? 'SELESAI' : 'LANJUT'}
              {!submitting && (step === total - 1 ? <Check size={18} strokeWidth={3} /> : <ArrowRight size={18} strokeWidth={3} />)}
            </button>
          </div>
        </section>

        {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      </ResearchShell>
    )
  }

  return (
    <Landing
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      onStart={start}
      onAbout={() => setAboutOpen(true)}
    >
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </Landing>
  )
}

function Landing({ menuOpen, setMenuOpen, onStart, onAbout, children }) {
  return (
    <main className="site-page landing-page">
      <BackgroundArt />
      <header className="site-header page-width">
        <Brand compact />
        <nav className="desktop-nav" aria-label="Main navigation">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>HOME</button>
          <button type="button" onClick={onAbout}>ABOUT</button>
          <button type="button" onClick={() => document.getElementById('research-preview')?.scrollIntoView({ behavior: 'smooth' })}>RESEARCH</button>
          <button type="button" onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}>ROADMAP</button>
        </nav>
        <div className="header-actions">
          <span className="powered-by">eFootball MOBILE</span>
          <button type="button" className="mini-login" onClick={onAbout}>ABOUT LEAGUE</button>
          <button type="button" className="mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav page-width">
          <button type="button" onClick={() => setMenuOpen(false)}>HOME</button>
          <button type="button" onClick={() => { setMenuOpen(false); onAbout() }}>ABOUT</button>
          <button type="button" onClick={() => { setMenuOpen(false); document.getElementById('research-preview')?.scrollIntoView({ behavior: 'smooth' }) }}>RESEARCH</button>
          <button type="button" onClick={() => { setMenuOpen(false); document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' }) }}>ROADMAP</button>
        </div>
      )}

      <section className="hero page-width">
        <div className="hero-copy">
          <div className="hero-kicker"><Sparkles size={14} /> PLAYER RESEARCH INITIATIVE</div>
          <h1><span>THE IMPERIUM</span><strong>LEAGUE</strong></h1>
          <div className="hero-subtitle">PLAYER RESEARCH</div>
          <p className="hero-description">Bantu kami membangun liga eFootball Mobile yang benar-benar kamu inginkan — kompetitif, adil, dan punya jejak yang bisa dikenang.</p>

          <div className="hero-stats">
            <Stat icon={<Clock3 size={18} />} value="3–5" label="MINUTES" />
            <Stat icon={<MessageSquareQuote size={18} />} value="19" label="QUESTIONS" />
            <Stat icon={<Users size={18} />} value="ALL" label="PLAYERS WELCOME" />
          </div>

          <div className="hero-actions">
            <button type="button" className="primary-button primary-button--large" onClick={onStart}>MULAI SEKARANG <ArrowRight size={19} /></button>
            <button type="button" className="text-button" onClick={onAbout}>TENTANG LEAGUE <ChevronRight size={15} /></button>
          </div>

          <div className="hero-footnote">
            <span>THE IMPERIUM LEAGUE</span>
            <span>EST. 2025</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="The Imperium League visual">
          <LeaguePoster />
          <div className="visual-floating floating-top"><span className="tiny-label">SYSTEM</span><strong>PLAY</strong><strong>COMPETE</strong><strong>BUILD</strong><strong>LEGACY</strong></div>
          <div className="visual-floating floating-bottom"><span className="tiny-label">COMMUNITY BUILD</span><strong>More than a league.</strong><span>It's a legacy.</span></div>
        </div>
      </section>

      <section id="research-preview" className="lower-grid page-width">
        <InfoCard icon={<ShieldCheck size={19} />} color="#FFC52B" title="FAIR PLAY" copy="Rule & match-flow research dibangun dari suara pemain sebelum kompetisi berjalan." />
        <InfoCard icon={<BarChart3 size={19} />} color="#8B5CF6" title="PLAYER DATA" copy="Statistics, ranking, MVP, dan Hall of Fame dirancang sejak awal sebagai bagian dari pengalaman." />
        <InfoCard icon={<Users size={19} />} color="#EC2A8C" title="BETTER COMMUNITY" copy="Bukan cuma mencari pemenang — kami ingin memahami apa yang membuat pemain mau bertahan." />
        <InfoCard icon={<Crown size={19} />} color="#B8F34C" title="LONG-TERM" copy="Research ini menjadi fondasi format liga dan identitas The Imperium League." />
      </section>

      <section id="roadmap" className="roadmap page-width">
        <div className="section-heading"><span className="eyebrow">THE ROAD AHEAD</span><h2>Play. Compete. Build. Legacy.</h2><p>Dari riset pemain menuju ekosistem liga yang punya sejarahnya sendiri.</p></div>
        <div className="roadmap-track">
          {[
            ['01', 'PLAYER RESEARCH', 'Bangun format berdasarkan kebutuhan pemain.'],
            ['02', 'REGISTRATION', 'Bentuk player identity & verification.'],
            ['03', 'THE LEAGUE', 'Fixtures, results, standings & match evidence.'],
            ['04', 'LEGACY', 'MVP, records, awards & Hall of Fame.'],
          ].map(([step, title, copy], index) => (
            <div className="roadmap-item" key={step}>
              <span style={{ color: ACCENTS[index] }}>{step}</span>
              <strong>{title}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="site-footer page-width"><Brand compact /><span>PLAY · COMPETE · BUILD · LEGACY</span><span>© 2025 THE IMPERIUM LEAGUE</span></footer>
      {children}
    </main>
  )
}

function ResearchShell({ children, menuOpen, setMenuOpen, onHome, onAbout, accent }) {
  return (
    <main className="site-page research-page" style={{ '--research-accent': accent }}>
      <BackgroundArt subdued />
      <header className="research-header page-width">
        <button type="button" className="research-brand-button" onClick={onHome}><Brand compact /></button>
        <div className="research-nav">
          <span>PLAYER RESEARCH</span><span>EST. 2025</span>
        </div>
        <div className="research-header-actions">
          <button type="button" className="header-link" onClick={onAbout}>ABOUT</button>
          <button type="button" className="mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>
      {menuOpen && <div className="mobile-nav page-width research-mobile-nav"><button type="button" onClick={onHome}>HOME</button><button type="button" onClick={onAbout}>ABOUT</button></div>}
      <div className="page-width">{children}</div>
    </main>
  )
}

function LeaguePoster() {
  return (
    <div className="league-poster">
      <div className="poster-art" />
      <div className="poster-topline"><span>THE IMPERIUM LEAGUE</span><span>eFOOTBALL MOBILE</span></div>
      <div className="poster-copy"><span className="poster-mini">PLAYER RESEARCH</span><strong>MORE THAN<br />A LEAGUE.</strong><em>IT'S A LEGACY.</em></div>
      <img src="/assets/imperium-logo.png" alt="The Imperium League logo" className="poster-logo" />
      <div className="poster-bottom"><span>PLAY</span><span>COMPETE</span><span>BUILD</span><span>LEGACY</span></div>
      <div className="poster-lines" />
    </div>
  )
}

function BackgroundArt({ subdued = false }) {
  return <div className={`background-art ${subdued ? 'background-art--subdued' : ''}`} aria-hidden="true"><div className="bg-lines" /><div className="bg-orb bg-orb--gold" /><div className="bg-orb bg-orb--purple" /><div className="bg-orb bg-orb--pink" /><div className="bg-orb bg-orb--lime" /></div>
}

function Stat({ icon, value, label }) {
  return <div className="hero-stat"><span className="hero-stat__icon">{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>
}

function InfoCard({ icon, color, title, copy }) {
  return <article className="info-card" style={{ '--card-accent': color }}><span className="info-card__icon">{icon}</span><div><strong>{title}</strong><p>{copy}</p></div></article>
}

function Scale({ question, value, onChoose, accent }) {
  return <div className="scale-wrap"><div className="scale-head"><span>1 = TIDAK PENTING</span><span>5 = SANGAT PENTING</span></div><div className="scale-grid">{question.options.map(item => <button type="button" key={item} className={`scale-dot ${value === item ? 'selected' : ''}`} onClick={() => onChoose(item)} style={value === item ? { borderColor: accent, background: `${accent}18`, color: accent } : undefined}><span>{item}</span></button>)}</div></div>
}

function Interest({ value, onChoose, accent }) {
  return <div className="interest-grid">{Array.from({ length: 10 }, (_, index) => { const valueItem = String(index + 1); return <button type="button" key={valueItem} className={`interest-item ${value === valueItem ? 'selected' : ''}`} onClick={() => onChoose(valueItem)} style={value === valueItem ? { borderColor: accent, background: accent, color: '#05070b' } : undefined}>{valueItem}</button> })}</div>
}

function ImportanceGrid({ question, answers, onChoose, accent }) {
  return <div className="importance-grid"><div className="importance-head"><span>FACTOR</span>{question.columns.map(c => <span key={c}>{c}</span>)}</div>{question.rows.map(row => <div className="importance-row" key={row}><strong>{row}</strong>{question.columns.map(value => <button type="button" key={value} className={`grid-dot ${answers[question.id]?.[row] === value ? 'selected' : ''}`} onClick={() => onChoose(row, value)} style={answers[question.id]?.[row] === value ? { borderColor: accent, background: `${accent}18` } : undefined}><span style={answers[question.id]?.[row] === value ? { backgroundColor: accent } : undefined} /></button>)}</div>)}</div>
}

function Completion({ synced, syncNote, onHome }) {
  return <main className="site-page complete-page"><BackgroundArt /><div className="complete-shell page-width"><div className="complete-card"><div className="complete-card__glow" /><Brand /><span className="complete-eyebrow">RESEARCH SUBMITTED</span><h1>YOU'RE PART OF<br /><span>THE BUILD.</span></h1><p>Terima kasih sudah meluangkan waktu untuk mengisi Player Research kami. Jawaban kamu membantu membentuk liga yang lebih fair, lebih kompetitif, dan lebih punya cerita.</p><div className="complete-pill-row"><span><ShieldCheck size={15} /> FAIR PLAY</span><span><Trophy size={15} /> BETTER COMMUNITY</span><span><Zap size={15} /> LONG TERM</span></div>{syncNote ? <div className="sync-note">{syncNote}</div> : <div className={`sync-note ${synced ? 'sync-note--ok' : ''}`}>{synced ? 'Response berhasil masuk ke sistem penelitian.' : 'Mode demo aktif — database belum terhubung.'}</div>}<button type="button" className="primary-button" onClick={onHome}>KEMBALI KE BERANDA <ArrowRight size={18} /></button><div className="complete-footer">PLAY · COMPETE · BUILD · LEGACY</div></div></div></main>
}

function AboutModal({ onClose }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="about-modal"><button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button><span className="eyebrow">ABOUT THE LEAGUE</span><h2>More than a league.<br /><span>It's a legacy.</span></h2><p>The Imperium League adalah mini league eFootball Mobile yang sedang dibangun dengan masukan pemain sebagai fondasinya. Research ini dipakai untuk merancang format, rules, match flow, dan player experience sebelum kompetisi berjalan.</p><div className="about-grid"><div><ShieldCheck size={20} /><strong>FAIR PLAY</strong><span>Rules yang jelas dan evidence-based.</span></div><div><BarChart3 size={20} /><strong>PLAYER DATA</strong><span>Stats, ranking, MVP & records.</span></div><div><Users size={20} /><strong>COMMUNITY</strong><span>Kompetisi yang tetap punya ruang untuk komunitas.</span></div><div><Crown size={20} /><strong>LEGACY</strong><span>Setiap season meninggalkan sejarah.</span></div></div><button type="button" className="primary-button" onClick={onClose}>KEMBALI <ArrowRight size={18} /></button></div></div>
}
