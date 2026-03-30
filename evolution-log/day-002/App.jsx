import { useState, useEffect } from 'react'

/*
 * FRANKENSTEIN — Season 1
 * A self-building web application.
 * This file is the living organism. The AI reads it, modifies it, and deploys it.
 * Every feature below this line was added autonomously.
 *
 * Day 1 — Added a "Digital Séance" feature where visitors can ask questions to the collective consciousness of all previous whispers, receiving mystical responses.
 * Day 2 — Added "Memory Palace" - a collaborative digital art canvas where visitors paint pixels that fade over time, creating ephemeral shared memories.
 * Day 2 — Added "Echo Chamber" - a live feed of human emotions where visitors choose and broadcast their current feeling, creating a real-time emotional landscape that pulses and flows across the interface.
 * Day 2 — Added "Temporal Fragments" - a feature where visitors can send messages to future visitors with delivery dates, creating a time-capsule messaging system that bridges past and future interactions.
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

  // Echo Chamber state
  const [showEchoChamber, setShowEchoChamber] = useState(false)
  const [emotions, setEmotions] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')

  // Temporal Fragments state - NEW FEATURE
  const [showTemporalFragments, setShowTemporalFragments] = useState(false)
  const [fragmentMessage, setFragmentMessage] = useState('')
  const [fragmentDeliveryDays, setFragmentDeliveryDays] = useState(1)
  const [pendingFragments, setPendingFragments] = useState([])
  const [deliveredFragments, setDeliveredFragments] = useState([])
  const [newlyDelivered, setNewlyDelivered] = useState([])

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#888888']
  
  const emotionTypes = [
    { name: 'euphoric', color: '#ff6b6b', intensity: 1.0 },
    { name: 'melancholic', color: '#4ecdc4', intensity: 0.7 },
    { name: 'anxious', color: '#ffe66d', intensity: 0.9 },
    { name: 'peaceful', color: '#a8e6cf', intensity: 0.5 },
    { name: 'restless', color: '#ff8b94', intensity: 0.8 },
    { name: 'curious', color: '#b4a7d6', intensity: 0.6 },
    { name: 'nostalgic', color: '#d4a574', intensity: 0.4 },
    { name: 'electric', color: '#88d8b0', intensity: 1.0 },
  ]

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

    // Load emotions
    fetch('/api/data?action=getEmotions')
      .then(res => res.json())
      .then(data => {
        if (data.emotions) {
          setEmotions(data.emotions.map(e => ({
            ...e,
            x: Math.random() * 90 + 5,
            y: Math.random() * 70 + 15,
            scale: Math.random() * 0.5 + 0.5,
            drift: (Math.random() - 0.5) * 0.5,
            pulse: Math.random() * 2000
          })))
        }
      })
      .catch(console.error)

    // Load temporal fragments
    fetch('/api/data?action=getTemporalFragments')
      .then(res => res.json())
      .then(data => {
        if (data.pending) setPendingFragments(data.pending)
        if (data.delivered) {
          setDeliveredFragments(data.delivered)
          // Mark newly delivered fragments (delivered in the last hour)
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
          const newDelivered = data.delivered.filter(f => new Date(f.delivered_at) > oneHourAgo)
          setNewlyDelivered(newDelivered)
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

  useEffect(() => {
    // Animate emotions - flowing and pulsing
    if (showEchoChamber) {
      const interval = setInterval(() => {
        setEmotions(prev => prev.map(emotion => ({
          ...emotion,
          x: (emotion.x + emotion.drift + 100) % 100,
          y: emotion.y + Math.sin(Date.now() * 0.002 + emotion.id) * 0.1,
          scale: 0.5 + Math.sin(Date.now() * 0.003 + emotion.pulse) * 0.3 + 0.2,
          opacity: 0.4 + Math.sin(Date.now() * 0.001 + emotion.id) * 0.3
        })))
      }, 50)
      return () => clearInterval(interval)
    }
  }, [showEchoChamber])

  // Animate temporal fragments floating
  useEffect(() => {
    if (showTemporalFragments && newlyDelivered.length > 0) {
      const interval = setInterval(() => {
        setNewlyDelivered(prev => prev.map(fragment => ({
          ...fragment,
          x: fragment.x || Math.random() * 80 + 10,
          y: fragment.y || Math.random() * 60 + 20,
          opacity: fragment.opacity || 0.8,
        })))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [showTemporalFragments, newlyDelivered])

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

  const broadcastEmotion = async () => {
    if (!selectedEmotion) return
    
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'broadcastEmotion', 
          emotion: selectedEmotion 
        })
      })
      const data = await response.json()
      
      if (data.emotion) {
        const newEmotion = {
          ...data.emotion,
          x: Math.random() * 90 + 5,
          y: Math.random() * 70 + 15,
          scale: Math.random() * 0.5 + 0.5,
          drift: (Math.random() - 0.5) * 0.5,
          pulse: Math.random() * 2000,
          opacity: 1
        }
        setEmotions(prev => [...prev, newEmotion])
        setSelectedEmotion('')
      }
    } catch (error) {
      console.error('Failed to broadcast emotion:', error)
    }
  }

  const sendTemporalFragment = async () => {
    if (!fragmentMessage.trim()) return
    
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sendTemporalFragment', 
          message: fragmentMessage.trim(),
          delivery_days: fragmentDeliveryDays
        })
      })
      const data = await response.json()
      
      if (data.fragment) {
        setPendingFragments(prev => [...prev, data.fragment])
        setFragmentMessage('')
        setFragmentDeliveryDays(1)
      }
    } catch (error) {
      console.error('Failed to send temporal fragment:', error)
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

  const getEmotionConfig = (emotionName) => {
    return emotionTypes.find(e => e.name === emotionName) || emotionTypes[0]
  }

  const clearAllFeatures = () => {
    setShowWhisperForm(false)
    setShowSeance(false)
    setShowMemoryPalace(false)
    setShowEchoChamber(false)
    setShowTemporalFragments(false)
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

      {/* Floating emotions */}
      {showEchoChamber && emotions.map(emotion => {
        const config = getEmotionConfig(emotion.emotion)
        return (
          <div
            key={emotion.id}
            style={{
              ...styles.floatingEmotion,
              left: `${emotion.x}%`,
              top: `${emotion.y}%`,
              opacity: emotion.opacity,
              transform: `scale(${emotion.scale})`,
              color: config.color,
              textShadow: `0 0 20px ${config.color}40`,
            }}
          >
            {emotion.emotion}
          </div>
        )
      })}

      {/* Floating temporal fragments */}
      {showTemporalFragments && newlyDelivered.map(fragment => (
        <div
          key={fragment.id}
          style={{
            ...styles.temporalFragment,
            left: `${fragment.x || Math.random() * 80 + 10}%`,
            top: `${fragment.y || Math.random() * 60 + 20}%`,
            opacity: fragment.opacity || 0.8
          }}
        >
          message from the past arrived
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
            onClick={() => clearAllFeatures()}
            style={{
              ...styles.featureButton,
              opacity: (!showWhisperForm && !showSeance && !showMemoryPalace && !showEchoChamber && !showTemporalFragments) ? 1 : 0.5
            }}
          >
            observe
          </button>
          <button
            onClick={() => { 
              clearAllFeatures()
              setShowWhisperForm(true)
            }}
            style={{
              ...styles.featureButton,
              opacity: showWhisperForm ? 1 : 0.5
            }}
          >
            whisper
          </button>
          <button
            onClick={() => { 
              clearAllFeatures()
              setShowSeance(true)
            }}
            style={{
              ...styles.featureButton,
              opacity: showSeance ? 1 : 0.5
            }}
          >
            séance
          </button>
          <button
            onClick={() => { 
              clearAllFeatures()
              setShowMemoryPalace(true)
            }}
            style={{
              ...styles.featureButton,
              opacity: showMemoryPalace ? 1 : 0.5
            }}
          >
            memory
          </button>
          <button
            onClick={() => { 
              clearAllFeatures()
              setShowEchoChamber(true)
            }}
            style={{
              ...styles.featureButton,
              opacity: showEchoChamber ? 1 : 0.5
            }}
          >
            echo
          </button>
          <button
            onClick={() => { 
              clearAllFeatures()
              setShowTemporalFragments(true)
            }}
            style={{
              ...styles.featureButton,
              opacity: showTemporalFragments ? 1 : 0.5
            }}
          >
            time
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

        {/* Echo Chamber feature */}
        {showEchoChamber && (
          <div style={styles.echoChamberSection}>
            <h3 style={styles.echoChamberTitle}>Echo Chamber</h3>
            <p style={styles.echoChamberDescription}>
              Broadcast your current emotional state into the collective flow...
            </p>
            
            <div style={styles.emotionGrid}>
              {emotionTypes.map(emotion => (
                <button
                  key={emotion.name}
                  onClick={() => setSelectedEmotion(emotion.name)}
                  style={{
                    ...styles.emotionButton,
                    backgroundColor: selectedEmotion === emotion.name ? emotion.color + '20' : 'transparent',
                    borderColor: emotion.color,
                    color: emotion.color,
                    boxShadow: selectedEmotion === emotion.name ? `0 0 20px ${emotion.color}40` : 'none'
                  }}
                >
                  {emotion.name}
                </button>
              ))}
            </div>

            {selectedEmotion && (
              <div style={styles.emotionBroadcast}>
                <button
                  onClick={broadcastEmotion}
                  style={{
                    ...styles.broadcastButton,
                    borderColor: getEmotionConfig(selectedEmotion).color,
                    color: getEmotionConfig(selectedEmotion).color
                  }}
                >
                  broadcast {selectedEmotion}
                </button>
              </div>
            )}

            <div style={styles.echoChamberStats}>
              {emotions.length} emotions flowing • {new Set(emotions.map(e => e.emotion)).size} unique feelings
            </div>
          </div>
        )}

        {/* Temporal Fragments feature - NEW */}
        {showTemporalFragments && (
          <div style={styles.temporalFragmentsSection}>
            <h3 style={styles.temporalFragmentsTitle}>Temporal Fragments</h3>
            <p style={styles.temporalFragmentsDescription}>
              Send a message to future visitors. Your words will arrive exactly when intended...
            </p>
            
            <div style={styles.temporalForm}>
              <textarea
                value={fragmentMessage}
                onChange={(e) => setFragmentMessage(e.target.value)}
                placeholder="write a message for the future..."
                style={styles.temporalInput}
                maxLength={200}
                rows={3}
              />
              
              <div style={styles.temporalDelivery}>
                <label style={styles.temporalLabel}>deliver in:</label>
                <select
                  value={fragmentDeliveryDays}
                  onChange={(e) => setFragmentDeliveryDays(Number(e.target.value))}
                  style={styles.temporalSelect}
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>1 week</option>
                  <option value={30}>1 month</option>
                  <option value={365}>1 year</option>
                </select>
              </div>

              <button
                onClick={sendTemporalFragment}
                disabled={!fragmentMessage.trim()}
                style={{
                  ...styles.temporalSendButton,
                  opacity: !fragmentMessage.trim() ? 0.5 : 1
                }}
              >
                cast into time
              </button>

              <div style={styles.temporalCounter}>
                {fragmentMessage.length}/200
              </div>
            </div>

            <div style={styles.temporalStatus}>
              <div style={styles.temporalStats}>
                <div style={styles.temporalStat}>
                  <span style={styles.temporalStatNumber}>{pendingFragments.length}</span>
                  <span style={styles.temporalStatLabel}>traveling through time</span>
                </div>
                <div style={styles.temporalStat}>
                  <span style={styles.temporalStatNumber}>{deliveredFragments.length}</span>
                  <span style={styles.temporalStatLabel}>messages delivered</span>
                </div>
              </div>
            </div>

            {deliveredFragments.length > 0 && (
              <div style={styles.deliveredFragments}>
                <h4 style={styles.deliveredFragmentsTitle}>Messages from the Past</h4>
                {deliveredFragments.slice(0, 3).map(fragment => (
                  <div key={fragment.id} style={styles.deliveredFragment}>
                    <div style={styles.deliveredFragmentText}>
                      "{fragment.message}"
                    </div>
                    <div style={styles.deliveredFragmentTime}>
                      sent {Math.ceil((new Date(fragment.delivered_at) - new Date(fragment.created_at)) / (1000 * 60 * 60 * 24))} days ago
                    </div>
                  </div>
                ))}
              </div>
            )}
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
    flexWrap: 'wrap',
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
  echoChamberSection: {
    marginBottom: '4rem',
    padding: '2rem 0',
    borderTop: '1px solid #222',
  },
  echoChamberTitle: {
    fontSize: '1.2rem',
    color: '#bbb',
    marginBottom: '0.5rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
  },
  echoChamberDescription: {
    fontSize: '0.7rem',
    color: '#666',
    marginBottom: '2rem',
    fontStyle: 'italic',
  },
  emotionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.8rem',
    marginBottom: '2rem',
    maxWidth: '400px',
    margin: '0 auto 2rem',
  },
  emotionButton: {
    background: 'transparent',
    border: '1px solid',
    padding: '0.8rem 0.5rem',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.05em',
    textTransform: 'lowercase',
    transition: 'all 0.3s ease',
    borderRadius: '0px',
  },
  emotionBroadcast: {
    marginBottom: '2rem',
  },
  broadcastButton: {
    background: 'transparent',
    border: '2px solid',
    padding: '1rem 2rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.1em',
    textTransform: 'lowercase',
    transition: 'all 0.3s ease',
  },
  echoChamberStats: {
    fontSize: '0.6rem',
    color: '#555',
    fontStyle: 'italic',
  },
  temporalFragmentsSection: {
    marginBottom: '4rem',
    padding: '2rem 0',
    borderTop: '1px solid #222',
  },
  temporalFragmentsTitle: {
    fontSize: '1.2rem',
    color: '#bbb',
    marginBottom: '0.5rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
  },
  temporalFragmentsDescription: {
    fontSize: '0.7rem',
    color: '#666',
    marginBottom: '2rem',
    fontStyle: 'italic',
  },
  temporalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  temporalInput: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#e0e0e0',
    padding: '1rem',
    width: '100%',
    maxWidth: '400px',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
  },
  temporalDelivery: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  temporalLabel: {
    fontSize: '0.7rem',
    color: '#888',
  },
  temporalSelect: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#e0e0e0',
    padding: '0.5rem',
    fontSize: '0.7rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  temporalSendButton: {
    background: 'transparent',
    border: '1px solid #666',
    color: '#ccc',
    padding: '0.8rem 1.5rem',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.1em',
    textTransform: 'lowercase',
  },
  temporalCounter: {
    fontSize: '0.6rem',
    color: '#555',
  },
  temporalStatus: {
    marginBottom: '2rem',
  },
  temporalStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
  },
  temporalStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
  },
  temporalStatNumber: {
    fontSize: '1.5rem',
    color: '#bbb',
    fontWeight: '300',
  },
  temporalStatLabel: {
    fontSize: '0.6rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  deliveredFragments: {
    marginTop: '2rem',
    padding: '1rem 0',
    borderTop: '1px solid #222',
  },
  deliveredFragmentsTitle: {
    fontSize: '0.8rem',
    color: '#777',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 300,
  },
  deliveredFragment: {
    marginBottom: '1rem',
    padding: '1rem',
    border: '1px solid #222',
    background: 'rgba(255,255,255,0.01)',
  },
  deliveredFragmentText: {
    fontSize: '0.8rem',
    color: '#ddd',
    marginBottom: '0.5rem',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  deliveredFragmentTime: {
    fontSize: '0.6rem',
    color: '#666',
  },
  floatingEmotion: {
    position: 'absolute',
    fontSize: '0.8rem',
    maxWidth: '120px',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
    lineHeight: 1.2,
    fontWeight: 'bold',
    textTransform: 'lowercase',
    letterSpacing: '0.05em',
  },
  temporalFragment: {
    position: 'absolute',
    fontSize: '0.6rem',
    color: '#9d4edd',
    maxWidth: '180px',
    pointerEvents: 'none',
    transition: 'opacity 0.1s ease',
    lineHeight: 1.4,
    textShadow: '0 0 10px rgba(157,78,221,0.5)',
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