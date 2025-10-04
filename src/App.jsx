import { useState, useRef } from 'react'

const ACTIVITIES = [
  { id: 'archery', name: '🏹 Archery', risk: 'Sharp objects and physical exertion' },
  { id: 'swimming', name: '🏊 Swimming', risk: 'Water hazards and physical exertion' },
  { id: 'hiking', name: '🥾 Hiking', risk: 'Uneven terrain and weather conditions' },
  { id: 'rock-climbing', name: '🧗 Rock Climbing', risk: 'Heights and physical exertion' },
  { id: 'kayaking', name: '🛶 Kayaking', risk: 'Water hazards and weather conditions' }
]

const PROPERTIES = [
  { id: 'resort-a', name: '🏨 Resort A' },
  { id: 'resort-b', name: '🏨 Resort B' },
  { id: 'campground', name: '🏕️ Campground' }
]

const getCanvasContext = (canvasRef) => {
  const canvas = canvasRef.current
  return { canvas, ctx: canvas.getContext('2d'), rect: canvas.getBoundingClientRect() }
}

const getPointerCoords = (e, rect) => ({
  x: (e.touches?.[0]?.clientX || e.clientX) - rect.left,
  y: (e.touches?.[0]?.clientY || e.clientY) - rect.top
})

const SignaturePad = ({ onSignatureChange }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const { ctx, rect } = getCanvasContext(canvasRef)
    const { x, y } = getPointerCoords(e, rect)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    const { ctx, rect } = getCanvasContext(canvasRef)
    const { x, y } = getPointerCoords(e, rect)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)
    onSignatureChange(canvasRef.current.toDataURL())
  }

  const clearSignature = () => {
    const { ctx, canvas } = getCanvasContext(canvasRef)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onSignatureChange('')
  }

  return (
    <div className="signature-section">
      <label className="signature-label">Digital Signature</label>
      <canvas
        ref={canvasRef}
        width={700}
        height={150}
        className="signature-pad"
        style={{ display: 'block', width: '100%', maxWidth: '700px' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button type="button" className="btn btn-danger clear-signature" onClick={clearSignature}>
        🗑️ Clear Signature
      </button>
    </div>
  )
}

const App = () => {
  const [form, setForm] = useState({ property: '', checkinDate: '', name: '', email: '', signature: '' })
  const [selected, setSelected] = useState([])
  const [initials, setInitials] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const updateInitials = (id, value) => setInitials({ ...initials, [id]: value })

  const toggleActivity = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id))
      const { [id]: _, ...rest } = initials
      setInitials(rest)
    } else {
      setSelected([...selected, id])
    }
  }

  const toggleAll = () => {
    if (selected.length === ACTIVITIES.length) {
      setSelected([])
      setInitials({})
    } else {
      setSelected(ACTIVITIES.map(a => a.id))
    }
  }

  const isValid = selected.length > 0 && selected.every(id => initials[id]?.trim())

  const submit = async (e) => {
    e.preventDefault()
    if (!isValid) return alert('Please select activities and enter initials')

    setSubmitting(true)
    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, activities: selected, activityInitials: initials })
      })
      const result = await response.json()
      result.success ? setSuccess(result) : alert('Error: ' + result.error)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const FormField = ({ label, name, type = 'text', ...props }) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={updateForm} required {...props} />
    </div>
  )

  if (success) return (
    <div className="container">
      <div className="header">
        <h1>Activity Waiver System</h1>
        <p>Complete your activity waivers and get instant access codes</p>
      </div>
      <div className="form-container">
        <div className="success">
          <h2>🎉 Success!</h2>
          <p className="success-message">{success.message}</p>
          {success.archeryPin && (
            <div className="access-codes">
              <h3>🎯 Archery Access PIN</h3>
              <div className="code-item">
                <div className="code-value" style={{ fontSize: '32px', fontWeight: 'bold', color: '#d63031' }}>
                  {success.archeryPin}
                </div>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Use this PIN to access the archery area
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="submit-btn btn btn-success"
            style={{ marginTop: '20px' }}
          >
            ← Submit Another Waiver
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container">
      <div className="header">
        <h1>Activity Waiver System</h1>
        <p>Complete your activity waivers and get instant access codes</p>
      </div>
      <div className="form-container">
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="property">Property</label>
              <select id="property" name="property" value={form.property} onChange={updateForm} required>
                <option value="">Select Property</option>
                {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <FormField label="Check-in Date" name="checkinDate" type="date" />
          </div>

          <div className="form-row">
            <FormField label="Full Name" name="name" placeholder="Enter your full name" />
            <FormField label="Email Address" name="email" type="email" placeholder="your.email@example.com" />
          </div>

          <div className="form-group">
            <label>Select Activities</label>
            <div className="activities">
              {ACTIVITIES.map(activity => {
                const isSelected = selected.includes(activity.id)
                return (
                  <div
                    key={activity.id}
                    className={`activity-item card ${isSelected ? 'selected' : ''}`}
                    style={{ borderColor: isSelected ? '#667eea' : '', background: isSelected ? 'white' : '' }}
                    onClick={() => toggleActivity(activity.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>{activity.name}</span>
                    </div>
                    {isSelected && (
                      <>
                        <div className="risk-text">{activity.risk}</div>
                        <input
                          type="text"
                          value={initials[activity.id] || ''}
                          onChange={(e) => { e.stopPropagation(); updateInitials(activity.id, e.target.value) }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Enter initials (e.g., JD)"
                          maxLength={5}
                          required
                        />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className={`btn ${selected.length === ACTIVITIES.length ? 'btn-danger' : ''}`}
              style={{
                marginTop: '15px',
                background: selected.length === ACTIVITIES.length ? '' : 'var(--gradient-primary)',
                fontSize: '14px'
              }}
            >
              {selected.length === ACTIVITIES.length ? '✕ Clear All' : '✓ Select All'}
            </button>
          </div>

          <div className="form-group">
            <label className="master-checkbox">
              <input type="checkbox" required />
              <span>✅ I accept all terms and conditions for selected activities</span>
            </label>
          </div>

          <div className="form-group">
            <SignaturePad onSignatureChange={(sig) => setForm({ ...form, signature: sig })} />
          </div>

          <button type="submit" className="submit-btn btn btn-success" disabled={submitting || !isValid}>
            {submitting ? <><span className="loading"></span> Processing...</> : 'Submit Waiver'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
