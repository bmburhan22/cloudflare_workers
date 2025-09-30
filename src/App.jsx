import { useState, useRef, useEffect } from 'react'

const activities = [
  { id: 'archery', name: '🏹 Archery', risk: 'Archery involves sharp objects and physical exertion' },
  { id: 'swimming', name: '🏊 Swimming', risk: 'Swimming involves water hazards and physical exertion' },
  { id: 'hiking', name: '🥾 Hiking', risk: 'Hiking involves uneven terrain and weather conditions' },
  { id: 'rock-climbing', name: '🧗 Rock Climbing', risk: 'Rock climbing involves heights and physical exertion' },
  { id: 'kayaking', name: '🛶 Kayaking', risk: 'Kayaking involves water hazards and weather conditions' }
]

const properties = [
  { id: 'resort-a', name: '🏨 Resort A' },
  { id: 'resort-b', name: '🏨 Resort B' },
  { id: 'campground', name: '🏕️ Campground' }
]

function SignaturePad({ onSignatureChange }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 2
  }, [])

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    onSignatureChange(canvas.toDataURL())
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onSignatureChange('')
  }

  return (
    <div className="signature-section">
      <label className="signature-label">Digital Signature</label>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="signature-pad"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault()
          const touch = e.touches[0]
          const canvas = canvasRef.current
          const rect = canvas.getBoundingClientRect()
          startDrawing({ clientX: touch.clientX, clientY: touch.clientY })
        }}
        onTouchMove={(e) => {
          e.preventDefault()
          const touch = e.touches[0]
          draw({ clientX: touch.clientX, clientY: touch.clientY })
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          stopDrawing()
        }}
      />
      <button type="button" className="clear-signature" onClick={clearSignature}>
        🗑️ Clear Signature
      </button>
    </div>
  )
}

function App() {
  const [formData, setFormData] = useState({
    property: '',
    checkinDate: '',
    name: '',
    email: '',
    initials: '',
    signature: ''
  })
  const [selectedActivities, setSelectedActivities] = useState([])
  const [masterAccept, setMasterAccept] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleActivityChange = (activityId) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedActivities.length === 0) {
      alert('Please select at least one activity')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          activities: selectedActivities
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(result)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="container">
        <div className="header">
          <h1>Activity Waiver System</h1>
          <p>Complete your activity waivers and get instant access codes</p>
        </div>
        
        <div className="form-container">
          <div className="success">
            <h2>🎉 Success!</h2>
            <p className="success-message">{success.message}</p>
            
            {success.accessCodes && Object.keys(success.accessCodes).length > 0 && (
              <div className="access-codes">
                <h3>🔑 Your Access Codes</h3>
                {Object.entries(success.accessCodes).map(([activity, code]) => (
                  <div key={activity} className="code-item">
                    <div><strong>{activity.charAt(0).toUpperCase() + activity.slice(1)}:</strong></div>
                    <div className="code-value">{code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Activity Waiver System</h1>
        <p>Complete your activity waivers and get instant access codes</p>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="property">Property</label>
              <select
                id="property"
                name="property"
                value={formData.property}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Property</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="checkinDate">Check-in Date</label>
              <input
                type="date"
                id="checkinDate"
                name="checkinDate"
                value={formData.checkinDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Select Activities</label>
            <div className="activities">
              {activities.map(activity => (
                <label key={activity.id} className="activity-item">
                  <input
                    type="checkbox"
                    value={activity.id}
                    checked={selectedActivities.includes(activity.id)}
                    onChange={() => handleActivityChange(activity.id)}
                  />
                  <span>{activity.name}</span>
                  {selectedActivities.includes(activity.id) && (
                    <div className="risk-text">{activity.risk}</div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="master-checkbox">
              <input
                type="checkbox"
                checked={masterAccept}
                onChange={(e) => setMasterAccept(e.target.checked)}
                required
              />
              <span>✅ I accept all terms and conditions for selected activities</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="initials">Initials for Selected Activities</label>
            <input
              type="text"
              id="initials"
              name="initials"
              value={formData.initials}
              onChange={handleInputChange}
              placeholder="Enter your initials (e.g., JD)"
              required
            />
          </div>

          <div className="form-group">
            <SignaturePad onSignatureChange={(signature) => setFormData({ ...formData, signature })} />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading"></span> Processing...
              </>
            ) : (
              'Submit Waiver'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
