export function generateId() {
  return new Date().getTime().toString()
}

export async function renderPdf(activity, data, pin, env) {
  try {
    // Create HTML content for PDF generation
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
          <div>Legal Version: v1.0</div>
        </div>
      </body>
      </html>
    `

    // Use Cloudflare Browser Rendering API to generate PDF
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
        
        // Optimize page settings for speed
        await page.setViewport({ width: 800, height: 600 })
        await page.setJavaScriptEnabled(false) // Disable JS for faster rendering
        
        // Set the HTML content
        await page.setContent(html, { waitUntil: 'networkidle0' })
        
        // Generate PDF with optimized settings for speed
        const pdf = await page.pdf({
          format: 'A4',
          margin: {
            top: '20px',
            right: '20px', 
            bottom: '20px',
            left: '20px'
          },
          printBackground: false, // Disable for speed
          preferCSSPageSize: false, // Disable for speed
          displayHeaderFooter: false, // Disable for speed
          scale: 0.8 // Smaller scale for faster rendering
        })
        
        // Close browser
        await browser.close()
        
        return new Uint8Array(pdf)
      } catch (browserError) {
        console.warn('Browser Rendering API failed, falling back to HTML:', browserError.message)
        // Fallback to HTML when browser API fails (rate limits, etc.)
        return new TextEncoder().encode(html)
      }
    } else {
      // Fallback for local development - return HTML
      return new TextEncoder().encode(html)
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`Failed to generate PDF: ${error.message}`)
  }
}

export async function sendEmail(env, email, name, pdfs, archeryPin) {
  try {
    if (!env.SEND_EMAIL) {
      console.error('Cloudflare Email binding is not configured')
      return { success: false, message: 'Email service not configured. Please add SEND_EMAIL binding to wrangler.toml.' }
    }

    const { EmailMessage } = await import('cloudflare:email')
    const { createMimeMessage } = await import('mimetext')

    const emailContent = `
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
          <h3 style="color: #d63031; margin-top: 0;">Archery Access PIN:</h3>
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

    // Create MIME message
    const msg = createMimeMessage()
    msg.setSender({ name: "Activity Waiver System", addr: env.EMAIL_FROM })
    msg.setRecipient(email)
    msg.setSubject('Activity Waiver Documents')
    msg.addMessage({
      contentType: 'text/html',
      data: emailContent
    })

    // Add attachments
    for (const pdf of pdfs) {
      try {
        const docData = await env.PDF_STORAGE.get(pdf.key)
        if (docData) {
          // Convert the document data to base64 for email attachment
          const docBuffer = await docData.arrayBuffer()
          const base64Doc = btoa(String.fromCharCode(...new Uint8Array(docBuffer)))
          
          // Determine file type based on content
          const filename = `${pdf.activity}-waiver.pdf`
          const contentType = 'application/pdf'
          
          msg.addAttachment({
            filename: filename,
            contentType: contentType,
            data: base64Doc,
            encoding: 'base64'
          })
        } else {
          console.error(`Document not found in storage: ${pdf.key}`)
        }
      } catch (error) {
        console.error(`Error retrieving PDF ${pdf.key}:`, error)
      }
    }

    // Create EmailMessage
    const message = new EmailMessage(
      env.EMAIL_FROM,
      email,
      msg.asRaw()
    )

    console.log('Sending email to:', email)
    
    // Send email using Cloudflare Email
    await env.SEND_EMAIL.send(message)
    console.log('Email sent successfully via Cloudflare Email')
    
    return { success: true, message: 'Email sent successfully' }
    
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, message: error.message }
  }
}
