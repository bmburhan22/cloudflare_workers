export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activity Waiver System</title>
  <style>${css}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Activity Waiver System</h1>
      <p>Complete your activity waivers and get instant access codes</p>
    </div>
    
    <div class="form-container">
      <form id="waiverForm">
        <div class="form-row">
          <div class="form-group">
            <label for="property">Property</label>
            <select id="property" required>
              <option value="">Select Property</option>
              <option value="resort-a">🏨 Resort A</option>
              <option value="resort-b">🏨 Resort B</option>
              <option value="campground">🏕️ Campground</option>
            </select>
          </div>

          <div class="form-group">
            <label for="checkinDate">Check-in Date</label>
            <input type="date" id="checkinDate" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" placeholder="Enter your full name" required>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" placeholder="your.email@example.com" required>
          </div>
        </div>

        <div class="form-group">
          <label>Select Activities</label>
          <div class="activities">
            <label class="activity-item">
              <input type="checkbox" value="archery" data-risk="Archery involves sharp objects and physical exertion">
              <span>🏹 Archery</span>
            </label>
            <label class="activity-item">
              <input type="checkbox" value="swimming" data-risk="Swimming involves water hazards and physical exertion">
              <span>🏊 Swimming</span>
            </label>
            <label class="activity-item">
              <input type="checkbox" value="hiking" data-risk="Hiking involves uneven terrain and weather conditions">
              <span>🥾 Hiking</span>
            </label>
            <label class="activity-item">
              <input type="checkbox" value="rock-climbing" data-risk="Rock climbing involves heights and physical exertion">
              <span>🧗 Rock Climbing</span>
            </label>
            <label class="activity-item">
              <input type="checkbox" value="kayaking" data-risk="Kayaking involves water hazards and weather conditions">
              <span>🛶 Kayaking</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="master-checkbox">
            <input type="checkbox" id="masterAccept" required>
            <span>✅ I accept all terms and conditions for selected activities</span>
          </label>
        </div>

        <div class="form-group">
          <label for="initials">Initials for Selected Activities</label>
          <input type="text" id="initials" placeholder="Enter your initials (e.g., JD)" required>
        </div>

        <div class="form-group">
          <div class="signature-section">
            <label class="signature-label">Digital Signature</label>
            <canvas id="signaturePad" width="400" height="200"></canvas>
            <button type="button" id="clearSignature">🗑️ Clear Signature</button>
          </div>
        </div>

        <button type="submit" id="submitBtn">
          <span id="submitText">Submit Waiver</span>
          <span id="submitLoading" class="hidden">
            <span class="loading"></span> Processing...
          </span>
        </button>
      </form>

      <div id="success" class="hidden">
        <h2>🎉 Success!</h2>
        <p id="successMessage"></p>
        <div id="accessCodes" class="hidden">
          <h3>🔑 Your Access Codes</h3>
          <div id="codesList"></div>
        </div>
      </div>
    </div>
  </div>

  <script>${js}</script>
</body>
</html>`

export const css = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}
.container { 
  max-width: 800px; 
  margin: 0 auto; 
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(10px);
  border-radius: 20px; 
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
}
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
}
.header h1 { 
  font-size: 2.5rem; 
  font-weight: 700; 
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.header p {
  opacity: 0.9;
  font-size: 1.1rem;
}
.form-container {
  padding: 40px 30px;
}
.form-group { 
  margin-bottom: 30px; 
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
label { 
  display: block; 
  margin-bottom: 8px; 
  font-weight: 600; 
  color: #374151;
  font-size: 0.95rem;
}
input, select { 
  width: 100%; 
  padding: 15px 20px; 
  border: 2px solid #e5e7eb; 
  border-radius: 12px; 
  font-size: 16px; 
  transition: all 0.3s ease;
  background: #f9fafb;
}
input:focus, select:focus { 
  outline: none; 
  border-color: #667eea; 
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}
.activities { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 15px; 
  margin-top: 15px; 
}
.activity-item { 
  display: flex; 
  align-items: center; 
  padding: 20px; 
  border: 2px solid #e5e7eb; 
  border-radius: 12px; 
  cursor: pointer; 
  transition: all 0.3s ease;
  background: #f9fafb;
}
.activity-item:hover { 
  border-color: #667eea;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}
.activity-item input { 
  width: auto; 
  margin-right: 12px; 
  transform: scale(1.2);
}
.activity-item span {
  font-weight: 500;
  color: #374151;
}
.risk-text { 
  font-size: 0.85rem; 
  color: #6b7280; 
  margin-top: 8px; 
  font-style: italic;
}
.master-checkbox { 
  display: flex; 
  align-items: center; 
  padding: 20px;
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 12px;
}
.master-checkbox input { 
  width: auto; 
  margin-right: 12px; 
  transform: scale(1.3);
}
.master-checkbox span {
  font-weight: 600;
  color: #0c4a6e;
}
.signature-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 25px;
  border: 2px solid #e5e7eb;
}
.signature-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  display: block;
}
#signaturePad { 
  border: 2px solid #d1d5db; 
  border-radius: 12px; 
  cursor: crosshair; 
  background: white;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}
#clearSignature { 
  margin-top: 15px; 
  padding: 12px 24px; 
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: 600;
  transition: all 0.3s ease;
}
#clearSignature:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
#submitBtn { 
  width: 100%; 
  padding: 18px; 
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white; 
  border: none; 
  border-radius: 12px; 
  font-size: 18px; 
  font-weight: 600;
  cursor: pointer; 
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
#submitBtn:hover { 
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}
#submitBtn:disabled { 
  background: #9ca3af; 
  cursor: not-allowed; 
  transform: none;
  box-shadow: none;
}
.hidden { display: none; }
#success { 
  text-align: center; 
  padding: 40px 30px; 
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 12px; 
  margin-top: 30px; 
  border: 2px solid #10b981;
}
#success h2 {
  color: #065f46;
  font-size: 2rem;
  margin-bottom: 20px;
}
#successMessage {
  color: #047857;
  font-size: 1.1rem;
  margin-bottom: 20px;
}
#accessCodes { 
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b; 
  border-radius: 12px; 
  padding: 25px; 
  margin-top: 20px; 
}
#accessCodes h3 {
  color: #92400e;
  margin-bottom: 20px;
  font-size: 1.3rem;
}
.code-item { 
  margin: 15px 0; 
  padding: 20px; 
  background: white; 
  border-radius: 8px; 
  border: 1px solid #f59e0b;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.code-value { 
  font-size: 24px; 
  font-weight: 700; 
  color: #dc2626; 
  text-align: center;
  margin-top: 8px;
}
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .activities {
    grid-template-columns: 1fr;
  }
  .container {
    margin: 10px;
    border-radius: 15px;
  }
  .header h1 {
    font-size: 2rem;
  }
}
`

export const js = `
class WaiverForm {
  constructor() {
    this.form = document.getElementById('waiverForm')
    this.signaturePad = document.getElementById('signaturePad')
    this.ctx = this.signaturePad.getContext('2d')
    this.isDrawing = false
    this.init()
  }

  init() {
    this.setupSignaturePad()
    this.setupActivityCheckboxes()
    this.setupFormSubmit()
    this.setupClearSignature()
  }

  setupSignaturePad() {
    this.ctx.strokeStyle = '#374151'
    this.ctx.lineWidth = 3
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.shadowColor = 'rgba(0,0,0,0.1)'
    this.ctx.shadowBlur = 2

    this.signaturePad.addEventListener('mousedown', (e) => this.startDrawing(e))
    this.signaturePad.addEventListener('mousemove', (e) => this.draw(e))
    this.signaturePad.addEventListener('mouseup', () => this.stopDrawing())
    this.signaturePad.addEventListener('mouseout', () => this.stopDrawing())

    this.signaturePad.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = this.signaturePad.getBoundingClientRect()
      this.startDrawing({ clientX: touch.clientX - rect.left, clientY: touch.clientY - rect.top })
    })

    this.signaturePad.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = this.signaturePad.getBoundingClientRect()
      this.draw({ clientX: touch.clientX - rect.left, clientY: touch.clientY - rect.top })
    })

    this.signaturePad.addEventListener('touchend', (e) => {
      e.preventDefault()
      this.stopDrawing()
    })
  }

  setupActivityCheckboxes() {
    const checkboxes = document.querySelectorAll('.activity-item input[type="checkbox"]')
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const activityItem = checkbox.closest('.activity-item')
        if (checkbox.checked) {
          const riskText = document.createElement('div')
          riskText.className = 'risk-text'
          riskText.textContent = checkbox.dataset.risk
          activityItem.appendChild(riskText)
        } else {
          const riskText = activityItem.querySelector('.risk-text')
          if (riskText) riskText.remove()
        }
      })
    })
  }

  setupFormSubmit() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const submitBtn = document.getElementById('submitBtn')
      const submitText = document.getElementById('submitText')
      const submitLoading = document.getElementById('submitLoading')
      
      submitBtn.disabled = true
      submitText.classList.add('hidden')
      submitLoading.classList.remove('hidden')

      try {
        const formData = new FormData(this.form)
        const selectedActivities = Array.from(document.querySelectorAll('.activity-item input[type="checkbox"]:checked')).map(cb => cb.value)
        
        if (selectedActivities.length === 0) {
          alert('Please select at least one activity')
          return
        }

        const data = {
          property: formData.get('property') || document.getElementById('property').value,
          checkinDate: formData.get('checkinDate') || document.getElementById('checkinDate').value,
          name: formData.get('name') || document.getElementById('name').value,
          email: formData.get('email') || document.getElementById('email').value,
          activities: selectedActivities,
          initials: formData.get('initials') || document.getElementById('initials').value,
          signature: this.signaturePad.toDataURL()
        }

        const response = await fetch('/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })

        const result = await response.json()

        if (result.success) {
          this.showSuccess(result)
        } else {
          alert('Error: ' + result.error)
        }
      } catch (error) {
        alert('Error: ' + error.message)
      } finally {
        submitBtn.disabled = false
        submitText.classList.remove('hidden')
        submitLoading.classList.add('hidden')
      }
    })
  }

  setupClearSignature() {
    document.getElementById('clearSignature').addEventListener('click', () => {
      this.ctx.clearRect(0, 0, this.signaturePad.width, this.signaturePad.height)
    })
  }

  startDrawing(e) {
    this.isDrawing = true
    this.ctx.beginPath()
    this.ctx.moveTo(e.clientX, e.clientY)
  }

  draw(e) {
    if (!this.isDrawing) return
    this.ctx.lineTo(e.clientX, e.clientY)
    this.ctx.stroke()
  }

  stopDrawing() {
    this.isDrawing = false
  }

  showSuccess(result) {
    document.getElementById('waiverForm').classList.add('hidden')
    document.getElementById('success').classList.remove('hidden')
    document.getElementById('successMessage').textContent = result.message

    if (result.accessCodes) {
      document.getElementById('accessCodes').classList.remove('hidden')
      const codesList = document.getElementById('codesList')
      codesList.innerHTML = ''
      
      Object.entries(result.accessCodes).forEach(([activity, code]) => {
        const codeItem = document.createElement('div')
        codeItem.className = 'code-item'
        codeItem.innerHTML = \`
          <div><strong>\${activity.charAt(0).toUpperCase() + activity.slice(1)}:</strong></div>
          <div class="code-value">\${code}</div>
        \`
        codesList.appendChild(codeItem)
      })
    }
  }
}

new WaiverForm()
`
