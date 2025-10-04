export function generateId() {
  return new Date().getTime().toString()
}

export async function renderPdf(activity, data, pin, env) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Activity Waiver - ${activity}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
            max-width: 800px;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .subtitle { 
            font-size: 12px; 
            margin-bottom: 5px; 
          }
          .content { 
            margin-bottom: 30px; 
          }
          .section-title { 
            font-size: 14px; 
            font-weight: bold; 
            margin-top: 20px; 
            margin-bottom: 10px; 
          }
          .paragraph { 
            margin-bottom: 10px; 
          }
          .list { 
            margin-left: 20px; 
            margin-bottom: 10px; 
          }
          .list-item { 
            margin-bottom: 5px; 
          }
          .signature-section { 
            margin-top: 40px; 
            border-top: 1px solid #ccc; 
            padding-top: 20px; 
          }
          .signature-box { 
            display: inline-block; 
            width: 200px; 
            height: 80px; 
            border: 1px solid #333; 
            margin: 10px 0; 
            vertical-align: top;
          }
          .signature-image { 
            max-width: 180px; 
            max-height: 70px; 
            object-fit: contain;
          }
          .access-code { 
            font-size: 20px; 
            font-weight: bold; 
            color: #d63031; 
            text-align: center; 
            margin: 20px 0; 
            background-color: #fff3cd; 
            padding: 15px; 
            border: 1px solid #ffeaa7; 
            border-radius: 4px;
          }
          .footer { 
            margin-top: 40px; 
            font-size: 10px; 
            color: #666; 
            text-align: center; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Activity Waiver - ${activity.toUpperCase()}</div>
          <div class="subtitle">Property: ${data.property} | Check-in: ${data.checkinDate}</div>
          <div class="subtitle">Participant: ${data.name} | Date: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="content">
          <div class="section-title">Release and Waiver of Liability</div>
          <div class="paragraph">
            I, ${data.name}, acknowledge that I am voluntarily participating in ${activity} activities at ${data.property}.
          </div>
          
          <div class="section-title">Risks and Hazards</div>
          <div class="paragraph">
            I understand that ${activity} involves inherent risks including but not limited to:
          </div>
          <div class="list">
            <div class="list-item">• Physical injury or death</div>
            <div class="list-item">• Equipment failure or malfunction</div>
            <div class="list-item">• Weather conditions</div>
            <div class="list-item">• Terrain hazards</div>
            <div class="list-item">• Other participants' actions</div>
          </div>

          <div class="section-title">Assumption of Risk</div>
          <div class="paragraph">
            I voluntarily assume all risks associated with participation in ${activity} activities.
          </div>

          <div class="section-title">Release of Liability</div>
          <div class="paragraph">
            I hereby release, waive, and discharge ${data.property} from any and all claims, demands, or causes of action arising from my participation.
          </div>

          <div class="section-title">Medical Treatment</div>
          <div class="paragraph">
            I consent to emergency medical treatment if necessary and agree to be responsible for all medical expenses.
          </div>

          <div class="section-title">Governing Law</div>
          <div class="paragraph">
            This waiver shall be governed by the laws of the jurisdiction where ${data.property} is located.
          </div>
        </div>

        <div class="signature-section">
          <div class="paragraph">
            <strong>Participant Initials:</strong> ${data.initials}
          </div>
          <div class="paragraph">
            <strong>Signature:</strong>
          </div>
          <div class="signature-box">
            ${data.signature ? `<img src="${data.signature}" class="signature-image" />` : ''}
          </div>
          <div class="paragraph">
            <strong>Date:</strong> ${new Date().toLocaleDateString()}
          </div>

          ${pin ? `
          <div class="access-code">
            <div>Archery Access PIN: ${pin}</div>
            <div style="font-size: 10px; margin-top: 5px;">
              Use this PIN to access the archery area
            </div>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <div>Document ID: ${generateId()}</div>
          <div>Generated: ${new Date().toISOString()}</div>
          <div>Version: ${env.VERSION || '1.0'}</div>
        </div>
      </body>
      </html>
    `

    if (env && env.BROWSER) {
      try {
        const puppeteer = await import('@cloudflare/puppeteer')
        const browser = await puppeteer.launch(env.BROWSER, {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        })
        const page = await browser.newPage()
        
        await page.setViewport({ width: 800, height: 600 })
        await page.setJavaScriptEnabled(false)
        
        await page.setContent(html, { waitUntil: 'networkidle0' })
        
        const pdf = await page.pdf({
          format: 'A4',
          margin: {
            top: '20px',
            right: '20px', 
            bottom: '20px',
            left: '20px'
          },
          printBackground: false,
          preferCSSPageSize: false,
          displayHeaderFooter: false,
          scale: 0.8
        })
        
        await browser.close()
        
        return new Uint8Array(pdf)
      } catch (browserError) {
        console.warn('Browser Rendering API failed, falling back to HTML:', browserError.message)
        return new TextEncoder().encode(html)
      }
    } else {
      return new TextEncoder().encode(html)
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`Failed to generate PDF: ${error.message}`)
  }
}

export async function sendEmail(env, email, name, pdfs, archeryPin) {
  try {
    if (!env.RESEND_API_KEY) {
      console.error('Resend API key not configured')
      return { success: false, message: 'Email service not configured. Set RESEND_API_KEY secret.' }
    }

    const attachments = []
    for (const pdf of pdfs) {
      try {
        const docData = await env.PDF_STORAGE.get(pdf.key)
        if (docData) {
          const docBuffer = await docData.arrayBuffer()
          const base64Doc = btoa(String.fromCharCode(...new Uint8Array(docBuffer)))
          attachments.push({
            filename: `${pdf.activity}-waiver.pdf`,
            content: base64Doc
          })
        }
      } catch (error) {
        console.error(`Error retrieving PDF ${pdf.key}:`, error)
      }
    }

    const htmlContent = `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Activity Waiver Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Thank you for completing your activity waivers. Your documents have been processed successfully.</p>

        <h3>Activities Covered:</h3>
        <ul>
          ${pdfs.map(pdf => `<li>${pdf.activity.charAt(0).toUpperCase() + pdf.activity.slice(1)}</li>`).join('')}
        </ul>

        ${archeryPin ? `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #d63031; margin-top: 0;">🏹 Archery Access PIN:</h3>
          <p style="font-size: 24px; font-weight: bold; color: #d63031;">${archeryPin}</p>
          <p><small>Use this PIN to access the archery area during your stay.</small></p>
        </div>
        ` : ''}

        <p>Please find your signed waiver documents attached to this email.</p>
        <p>Please keep this email for your records.</p>
        <p>Have a great time!</p>

        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This email was automatically generated. Please do not reply to this message.
        </p>
      </body>
      </html>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Activity Waiver Documents',
        html: htmlContent,
        attachments
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', result)
      return { success: false, message: result.message || 'Email sending failed' }
    }

    console.log('Email sent successfully via Resend:', result.id)
    return { success: true, message: 'Email sent successfully' }

  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, message: error.message }
  }
}
