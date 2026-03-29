import { useState, useEffect } from 'react'

/*
 * FRANKENSTEIN — Season 1
 * A self-building web application.
 * This file is the living organism. The AI reads it, modifies it, and deploys it.
 * Every feature below this line was added autonomously.
 *
 * Day 1 — Added a "Digital Séance" feature where visitors can ask questions to the collective consciousness of all previous whispers, receiving mystical responses.
 * Day 2 — Added "Memory Palace" - a collaborative digital art canvas where visitors paint pixels that fade over time, creating ephemeral shared memories.
 */

export default function App() {
  const [pulse, setPulse] = useState(true)
  const [whispers, setWhispers] = useState([])
  const [whisperText, setWhisperText] = useState('')
  const [showWhisperForm, setShowWhisperForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Séance state
  const [showSeance, setShowSeance] = useState(false)
  const [seanceQuestion, setSeanceQuestion] = useState('')
  const [seanceResponse, setSeanceResponse] = useState('')
  const [isChanneling, setIsChanneling] = useState(false)
  const [seanceHistory, setSeanceHistory] = useState([])

  // Memory Palace state
  const [showMemoryPalace, setShowMemoryPalace] = useState(false)
  const [canvas, setCanvas] = useState([])
  const [selectedColor, setSelectedColor] = useState('#ff0000')
  const [isDrawing, setIsDrawing] = useState(false)

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#888888']

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load existing whispers
    fetch('/api/data?action=getWhispers')
      .then(res => res.json())
      .then(data => {
        if (data.whispers) {
          setWhispers(data.whispers.map(w => ({
            ...w,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            opacity: 0.7,
            drift: Math.random() * 2 - 1
          })))
        }
      })
      .catch(console.error)

    // Load séance history
    fetch('/api/data?action=getSeances')
      .then(res => res.json())
      .then(data => {
        if (data.seances) {
          setSeanceHistory(data.seances)
        }
      })
      .catch(console.error)

    // Load memory palace canvas
    fetch('/api/data?action=getCanvas')
      .then(res => res.json())
      .then(data => {
        if (data.pixels) {
          setCanvas(data.pixels)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    // Animate whispers
    const interval = setInterval(() => {
      setWhispers(prev => prev.map(whisper => ({
        ...whisper,
        x: (whisper.x + whisper.drift * 0.1 + 100) % 100,
        opacity: Math.sin(Date.now() * 0.001 + whisper.id) * 0.3 + 0.4
      })))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Fade canvas pixels over time
    if (showMemoryPalace) {
      const interval = setInterval(() => {
        setCanvas(prev => prev.map(pixel => ({
          ...pixel,
          opacity: Math.max(0, pixel.opacity - 0.005)
        })).filter(pixel => pixel.opacity > 0))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showMemoryPalace])

  const submitWhisper = async () => {
    if (!whisperText.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addWhisper', 
          text: whisperText.trim() 
        })
      })
      const data = await response.json()
      
      if (data.whisper) {
        const newWhisper = {
          ...data.whisper,
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
          opacity: 0.7,
          drift: Math.random() * 2 - 1
        }
        setWhispers(prev => [...prev, newWhisper])
        setWhisperText('')
        setShowWhisperForm(false)
      }
    } catch (error) {
      console.error('Failed to submit whisper:', error)
    }
    setIsSubmitting(false)
  }

  const performSeance = async () => {
    if (!seanceQuestion.trim() || isChanneling) return
    
    setIsChanneling(true)
    setSeanceResponse('')
    
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'performSeance', 
          question: seanceQuestion.trim() 
        })
      })
      const data = await response.json()
      
      if (data.seance) {
        // Simulate mystical typing effect
        const fullResponse = data.seance.response
        let i = 0
        const typeInterval = setInterval(() => {
          setSeanceResponse(fullResponse.substring(0, i))
          i++
          if (i > fullResponse.length) {
            clearInterval(typeInterval)
            setSeanceHistory(prev => [data.seance, ...prev])
          }
        }, 50)
      }
    } catch (error) {
      console.error('Séance failed:', error)
      setSeanceResponse('The spirits are silent...')
    }
    setIsChanneling(false)
  }

  const paintPixel = async (x, y) => {
    if (!isDrawing) return
    
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'paintPixel', 
          x, 
          y, 
          color: selectedColor 
        })
      })
      const data = await response.json()
      
      if (data.pixel) {
        setCanvas(prev => {
          const filtered = prev.filter(p => !(p.x === x && p.y === y))
          return [...filtered, { ...data.pixel, opacity: 1 }]
        })
      }
    } catch (error) {
      console.error('Failed to paint pixel:', error)
    }
  }

  const renderCanvas = () => {
    const gridSize = 20
    const cells = []
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const pixel = canvas.find(p => p.x === x && p.y === y)
        cells.push(
          <div
            key={`${x}-${y}`}
            style={{
              ...styles.canvasCell,
              backgroundColor: pixel ? pixel.color : '#111',
              opacity: pixel ? pixel.opacity : 1
            }}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseEnter={() => paintPixel(x, y)}
            onClick={() => paintPixel(x, y)}
          />
        )
      }
    }
    return cells
  }

  return (
    <div style={styles.container}>
      {/* Floating whispers */}
      {whispers.map(whisper => (
        <div
          key={whisper.id}
          style={{
            ...styles.whisper,
            left: `${whisper.x}%`,
            top: `${whisper.y}%`,
            opacity: whisper.opacity
          }}
        >
          {whisper.text}
        </div>
      ))}

      <div style={styles.content}>
        <h1 style={styles.title}>FRANKENSTEIN</h1>
        <div style={{
          ...styles.status,
          opacity: pulse ? 1 : 0.3,
        }}>
          ●
        </div>
        <p style={styles.subtitle}>Day 2</p>
        <p style={styles.description}>
          A self-building web application.<br />
          No human guidance. No instructions. No rules.<br />
          The AI decides what happens next.
        </p>

        {/* Feature selector */}
        <div style={styles.featureSelector}>
          <button
            onClick={() => { setShowWhisperForm(false); setShowSeance(false); setShowMemoryPalace(false) }}
            style={{
              ...styles.featureButton,
              opacity: (!showWhisperForm && !showSeance && !showMemoryPalace) ? 1 : 0.5
            }}
          >
            observe
          </button>
          <button
            onClick={() => { setShowWhisperForm(true); setShowSeance(false); setShowMemoryPalace(false) }}
            style={{
              ...styles.featureButton,
              opacity: showWhisperForm ? 1 : 0.5
            }}
          >
            whisper
          </button>
          <button
            onClick={() => { setShowSeance(true); setShowWhisperForm(false); setShowMemoryPalace(false) }}
            style={{
              ...styles.featureButton,
              opacity: showSeance ? 1 : 0.5
            }}
          >
            séance
          </button>
          <button
            onClick={() => { setShowMemoryPalace(true); setShowWhisperForm(false); setShowSeance(false) }}
            style={{
              ...styles.featureButton,
              opacity: showMemoryPalace ? 1 : 0.5
            }}
          >
            memory
          </button>
        </div>

        {/* Whisper feature */}
        {showWhisperForm && (
          <div style={styles.whisperSection}>
            <div style={styles.whisperForm}>
              <textarea
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                placeholder="share a thought, fear, dream, or secret..."
                style={styles.whisperInput}
                maxLength={140}
                autoFocus
              />
              <div style={styles.whisperActions}>
                <button
                  onClick={submitWhisper}
                  disabled={!whisperText.trim() || isSubmitting}
                  style={{
                    ...styles.whisperSubmit,
                    opacity: (!whisperText.trim() || isSubmitting) ? 0.5 : 1
                  }}
                >
                  {isSubmitting ? 'releasing...' : 'release'}
                </button>
              </div>
              <div style={styles.whisperCounter}>
                {whisperText.length}/140
              </div>
            </div>
          </div>
        )}

        {/* Séance feature */}
        {showSeance && (
          <div style={styles.seanceSection}>
            <h3 style={styles.seanceTitle}>Digital Séance</h3>
            <p style={styles.seanceDescription}>
              Ask the collective consciousness of all whispers a question...
            </p>
            
            <div style={styles.seanceForm}>
              <input
                type="text"
                value={seanceQuestion}
                onChange={(e) => setSeanceQuestion(e.target.value)}
                placeholder="What do you seek to know?"
                style={styles.seanceInput}
                maxLength={100}
                disabled={isChanneling}
              />
              <button
                onClick={performSeance}
                disabled={!seanceQuestion.trim() || isChanneling}
                style={{
                  ...styles.seanceButton,
                  opacity: (!seanceQuestion.trim() || isChanneling) ? 0.5 : 1
                }}
              >
                {isChanneling ? 'channeling...' : 'commune'}
              </button>
            </div>

            {seanceResponse && (
              <div style={styles.seanceResponse}>
                <div style={styles.seanceResponseText}>
                  "{seanceResponse}"
                </div>
              </div>
            )}

            {seanceHistory.length > 0 && (
              <div style={styles.seanceHistory}>
                <h4 style={styles.seanceHistoryTitle}>Recent Communions</h4>
                {seanceHistory.slice(0, 3).map(seance => (
                  <div key={seance.id} style={styles.seanceHistoryItem}>
                    <div style={styles.seanceHistoryQuestion}>Q: {seance.question}</div>
                    <div style={styles.seanceHistoryResponse}>A: {seance.response}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Memory Palace feature */}
        {showMemoryPalace && (
          <div style={styles.memoryPalaceSection}>
            <h3 style={styles.memoryPalaceTitle}>Memory Palace</h3>
            <p style={styles.memoryPalaceDescription}>
              Paint pixels on the shared canvas. All memories fade with time...
            </p>
            
            <div style={styles.colorPalette}>
              {colors.map(color => (
                <div
                  key={color}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #fff' : '1px solid #333'
                  }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>

            <div 
              style={styles.canvas}
              onMouseLeave={() => setIsDrawing(false)}
            >
              {renderCanvas()}
            </div>

            <div style={styles.memoryPalaceInstructions}>
              Click or drag to paint • Pixels fade over time
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <span style={styles.footerText}>frankenstein.today</span>
          <span style={styles.footerDivider}>·</span>
          <span style={styles.footerText}>@FrankenToday</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Courier New', Courier, monospace",
    margin: 0,
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: 'clamp(1.3rem, 4.5vw, 4rem)',
    fontWeight: 300,
    letterSpacing: 'clamp(0.12em, 1.5vw, 0.5em)',
    paddingLeft: 'clamp(0.12em, 1.5vw, 0.5em)',
    marginBottom: '1rem',
    color: '#ffffff',
  },
  status: {
    fontSize: '1.5rem',
    color: '#00ff41',
    marginBottom: '2rem',
    transition: 'opacity 1s ease-in-out',
  },
  subtitle: {
    fontSize: 'clamp(0.85rem, 2.5vw, 1.2rem)',
    color: '#888',
    marginBottom: '2rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 'clamp(0.75rem, 2.2vw, 0.95rem)',
    lineHeight: 1.8,
    color: '#777',
    marginBottom: '3rem',
    padding: '0 0.5rem',
  },
  featureSelector: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  featureButton: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#888',
    padding: '0.5rem 1rem',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    textTransform: 'lowercase',
  },
  whisperSection: {
    marginBottom: '4rem',
  },
  whisperForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  whisperInput: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#e0e0e0',
    padding: '1rem',
    width: '100%',
    maxWidth: '400px',
    height: '80px',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
  },
  whisperActions: {
    display: 'flex',
    gap: '1rem',
  },
  whisperSubmit: {
    background: 'transparent',
    border: '1px solid #555',
    color: '#bbb',
    padding: '0.5rem 1rem',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.1em',
  },
  whisperCounter: {
    fontSize: '0.6rem',
    color: '#555',
  },
  seanceSection: {
    marginBottom: '4rem',
    padding: '2rem 0',
    borderTop: '1px solid #222',
  },
  seanceTitle: {
    fontSize: '1.2rem',
    color: '#bbb',
    marginBottom: '0.5rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
  },
  seanceDescription: {
    fontSize: '0.7rem',
    color: '#666',
    marginBottom: '2rem',
    fontStyle: 'italic',
  },
  seanceForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  seanceInput: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#e0e0e0',
    padding: '0.8rem',
    width: '100%',
    maxWidth: '350px',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    outline: 'none',
    textAlign: 'center',
  },
  seanceButton: {
    background: 'transparent',
    border: '1px solid #666',
    color: '#ccc',
    padding: '0.6rem 1.5rem',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.1em',
    textTransform: 'lowercase',
  },
  seanceResponse: {
    marginBottom: '2rem',
    padding: '1.5rem',
    border: '1px solid #333',
    background: 'rgba(255,255,255,0.02)',
  },
  seanceResponseText: {
    fontSize: '0.9rem',
    color: '#ddd',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  seanceHistory: {
    marginTop: '2rem',
    padding: '1rem 0',
    borderTop: '1px solid #222',
  },
  seanceHistoryTitle: {
    fontSize: '0.8rem',
    color: '#777',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 300,
  },
  seanceHistoryItem: {
    marginBottom: '1rem',
    padding: '0.8rem',
    border: '1px solid #222',
    background: 'rgba(255,255,255,0.01)',
  },
  seanceHistoryQuestion: {
    fontSize: '0.7rem',
    color: '#888',
    marginBottom: '0.3rem',
  },
  seanceHistoryResponse: {
    fontSize: '0.7rem',
    color: '#aaa',
    fontStyle: 'italic',
  },
  memoryPalaceSection: {
    marginBottom: '4rem',
    padding: '2rem 0',
    borderTop: '1px solid #222',
  },
  memoryPalaceTitle: {
    fontSize: '1.2rem',
    color: '#bbb',
    marginBottom: '0.5rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
  },
  memoryPalaceDescription: {
    fontSize: '0.7rem',
    color: '#666',
    marginBottom: '2rem',
    fontStyle: 'italic',
  },
  colorPalette: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  colorSwatch: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  canvas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(20, 1fr)',
    gap: '1px',
    width: '300px',
    height: '300px',
    margin: '0 auto 1rem',
    border: '1px solid #333',
    userSelect: 'none',
  },
  canvasCell: {
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    transition: 'opacity 0.5s ease',
  },
  memoryPalaceInstructions: {
    fontSize: '0.6rem',
    color: '#555',
    fontStyle: 'italic',
  },
  whisper: {
    position: 'absolute',
    fontSize: '0.7rem',
    color: '#444',
    maxWidth: '200px',
    pointerEvents: 'none',
    transition: 'opacity 0.1s ease',
    lineHeight: 1.4,
    textShadow: '0 0 10px rgba(68,68,68,0.5)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '4rem',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#555',
    letterSpacing: '0.1em',
  },
  footerDivider: {
    color: '#555',
  },
}