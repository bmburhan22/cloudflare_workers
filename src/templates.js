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
    <h1>Activity Waiver System</h1>
    
    <form id="waiverForm">
      <div class="form-group">
        <label for="property">Property:</label>
        <select id="property" required>
          <option value="">Select Property</option>
          <option value="resort-a">Resort A</option>
          <option value="resort-b">Resort B</option>
          <option value="campground">Campground</option>
        </select>
      </div>

      <div class="form-group">
        <label for="checkinDate">Check-in Date:</label>
        <input type="date" id="checkinDate" required>
      </div>

      <div class="form-group">
        <label for="name">Full Name:</label>
        <input type="text" id="name" required>
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" required>
      </div>

      <div class="form-group">
        <label>Activities:</label>
        <div class="activities">
          <label class="activity-item">
            <input type="checkbox" value="archery" data-risk="Archery involves sharp objects and physical exertion">
            <span>Archery</span>
          </label>
          <label class="activity-item">
            <input type="checkbox" value="swimming" data-risk="Swimming involves water hazards and physical exertion">
            <span>Swimming</span>
          </label>
          <label class="activity-item">
            <input type="checkbox" value="hiking" data-risk="Hiking involves uneven terrain and weather conditions">
            <span>Hiking</span>
          </label>
          <label class="activity-item">
            <input type="checkbox" value="rock-climbing" data-risk="Rock climbing involves heights and physical exertion">
            <span>Rock Climbing</span>
          </label>
          <label class="activity-item">
            <input type="checkbox" value="kayaking" data-risk="Kayaking involves water hazards and weather conditions">
            <span>Kayaking</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="master-checkbox">
          <input type="checkbox" id="masterAccept" required>
          <span>I accept all terms and conditions for selected activities</span>
        </label>
      </div>

      <div class="form-group">
        <label for="initials">Initials for each selected activity:</label>
        <input type="text" id="initials" placeholder="Enter your initials" required>
      </div>

      <div class="form-group">
        <label>Signature:</label>
        <canvas id="signaturePad" width="400" height="200"></canvas>
        <button type="button" id="clearSignature">Clear</button>
      </div>

      <button type="submit" id="submitBtn">Submit Waiver</button>
    </form>

    <div id="success" class="hidden">
      <h2>Success!</h2>
      <p id="successMessage"></p>
      <div id="accessCodes" class="hidden">
        <h3>Access Codes:</h3>
        <div id="codesList"></div>
      </div>
    </div>
  </div>

  <script>${js}</script>
</body>
</html>`

export const css = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
h1 { text-align: center; margin-bottom: 30px; color: #333; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 5px; font-weight: 500; color: #555; }
input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
.activities { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px; }
.activity-item { display: flex; align-items: center; padding: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
.activity-item:hover { background: #f9f9f9; }
.activity-item input { width: auto; margin-right: 8px; }
.risk-text { font-size: 12px; color: #666; margin-top: 5px; }
.master-checkbox { display: flex; align-items: center; }
.master-checkbox input { width: auto; margin-right: 8px; }
#signaturePad { border: 1px solid #ddd; border-radius: 4px; cursor: crosshair; }
#clearSignature { margin-top: 10px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
#submitBtn { width: 100%; padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
#submitBtn:hover { background: #45a049; }
#submitBtn:disabled { background: #ccc; cursor: not-allowed; }
.hidden { display: none; }
#success { text-align: center; padding: 20px; background: #e8f5e8; border-radius: 4px; margin-top: 20px; }
#accessCodes { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-top: 15px; }
.code-item { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border: 1px solid #ddd; }
.code-value { font-size: 20px; font-weight: bold; color: #d63031; }
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
    this.ctx.strokeStyle = '#000'
    this.ctx.lineWidth = 2
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

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
      submitBtn.disabled = true
      submitBtn.textContent = 'Processing...'

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
        submitBtn.textContent = 'Submit Waiver'
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
        codeItem.innerHTML = `
          <div><strong>${activity.charAt(0).toUpperCase() + activity.slice(1)}:</strong></div>
          <div class="code-value">${code}</div>
        `
        codesList.appendChild(codeItem)
      })
    }
  }
}

new WaiverForm()
`
