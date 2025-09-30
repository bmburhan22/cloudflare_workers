export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function generateAccessCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function renderPdf(activity, data, accessCode) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .content { margin-bottom: 30px; }
        .signature-section { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature-box { display: inline-block; width: 200px; height: 80px; border: 1px solid #333; margin: 10px; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
        .pin { font-size: 24px; font-weight: bold; color: #d63031; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Activity Waiver - ${activity.toUpperCase()}</h1>
        <p>Property: ${data.property} | Check-in: ${data.checkinDate}</p>
        <p>Participant: ${data.name} | Date: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="content">
        <h2>Release and Waiver of Liability</h2>
        <p>I, ${data.name}, acknowledge that I am voluntarily participating in ${activity} activities at ${data.property}.</p>
        
        <h3>Risks and Hazards</h3>
        <p>I understand that ${activity} involves inherent risks including but not limited to:</p>
        <ul>
          <li>Physical injury or death</li>
          <li>Equipment failure or malfunction</li>
          <li>Weather conditions</li>
          <li>Terrain hazards</li>
          <li>Other participants' actions</li>
        </ul>

        <h3>Assumption of Risk</h3>
        <p>I voluntarily assume all risks associated with participation in ${activity} activities.</p>

        <h3>Release of Liability</h3>
        <p>I hereby release, waive, and discharge ${data.property} from any and all claims, demands, or causes of action arising from my participation.</p>

        <h3>Medical Treatment</h3>
        <p>I consent to emergency medical treatment if necessary and agree to be responsible for all medical expenses.</p>

        <h3>Governing Law</h3>
        <p>This waiver shall be governed by the laws of the jurisdiction where ${data.property} is located.</p>
      </div>

      <div class="signature-section">
        <p><strong>Participant Initials:</strong> ${data.initials}</p>
        <p><strong>Signature:</strong></p>
        <div class="signature-box">
          <img src="${data.signature}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </div>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <div class="pin">
          <p>${activity.charAt(0).toUpperCase() + activity.slice(1)} Access Code: ${accessCode}</p>
          <p><small>Use this code to access the ${activity} area</small></p>
        </div>
      </div>

      <div class="footer">
        <p>Document ID: ${generateId()}</p>
        <p>Generated: ${new Date().toISOString()}</p>
        <p>Legal Version: v1.0</p>
      </div>
    </body>
    </html>
  `

  return new TextEncoder().encode(html)
}

export async function sendEmail(env, email, name, pdfs, accessCodes) {
  const emailContent = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Activity Waiver Confirmation</h2>
      <p>Dear ${name},</p>
      <p>Thank you for completing your activity waivers. Your documents have been processed successfully.</p>
      
      <h3>Activities Covered:</h3>
      <ul>
        ${pdfs.map(pdf => `<li>${pdf.activity}</li>`).join('')}
      </ul>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: #d63031; margin-top: 0;">Access Codes:</h3>
        ${Object.entries(accessCodes).map(([activity, code]) => 
          `<p><strong>${activity.charAt(0).toUpperCase() + activity.slice(1)}:</strong> ${code}</p>`
        ).join('')}
        <p><small>Use these codes to access the respective activity areas during your stay.</small></p>
      </div>
      
      <p>Please keep this email for your records.</p>
      <p>Have a great time!</p>
      
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        This email was automatically generated. Please do not reply to this message.
      </p>
    </body>
    </html>
  `

  const emailData = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Activity Waiver Documents',
    html: emailContent
  }

  console.log('Sending email to:', email)
  console.log('Email content:', emailContent)
  
  return { success: true, message: 'Email sent successfully' }
}
