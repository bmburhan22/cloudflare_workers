import { renderPdf, sendEmail, generateId, generateAccessCode } from './utils.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const method = request.method

    if (method === 'GET' && url.pathname === '/') {
      return new Response(await getIndexHtml(), { 
        headers: { 'Content-Type': 'text/html' } 
      })
    }

    if (method === 'GET' && url.pathname.startsWith('/assets/')) {
      return handleAssets(request, env)
    }

    if (method === 'POST' && url.pathname === '/submit') {
      return handleSubmit(request, env)
    }

    if (method === 'GET' && url.pathname === '/admin/search') {
      return handleAdminSearch(request, env)
    }

    if (method === 'GET' && url.pathname === '/status') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Not Found', { status: 404 })
  }
}

async function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Activity Waiver System</title>
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`
}

async function handleAssets(request, env) {
  const url = new URL(request.url)
  const assetPath = url.pathname.replace('/assets/', '')
  
  try {
    const asset = await env.PDF_STORAGE.get(`assets/${assetPath}`)
    if (asset) {
      const contentType = getContentType(assetPath)
      return new Response(asset.body, {
        headers: { 'Content-Type': contentType }
      })
    }
  } catch (error) {
    console.error('Asset not found:', assetPath)
  }
  
  return new Response('Asset not found', { status: 404 })
}

function getContentType(path) {
  if (path.endsWith('.js')) return 'application/javascript'
  if (path.endsWith('.css')) return 'text/css'
  if (path.endsWith('.html')) return 'text/html'
  return 'application/octet-stream'
}

async function handleSubmit(request, env) {
  try {
    const data = await request.json()
    const { property, checkinDate, name, email, activities, initials, signature } = data

    if (!property || !checkinDate || !name || !email || !activities?.length || !initials || !signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const existingSubmission = await env.DB.prepare(`
      SELECT s.*, d.activity, d.storage_key, d.access_code
      FROM submissions s
      LEFT JOIN documents d ON s.id = d.submission_id
      WHERE s.name = ? AND s.email = ? AND s.property = ? AND s.checkin_date = ?
      ORDER BY s.created_at DESC
      LIMIT 1
    `).bind(name, email, property, checkinDate).all()

    if (existingSubmission.results.length > 0) {
      const submission = existingSubmission.results[0]
      const existingDocs = existingSubmission.results.filter(r => r.activity)
      
      const existingAccessCodes = {}
      const existingPdfs = []
      
      for (const doc of existingDocs) {
        if (activities.includes(doc.activity)) {
          existingAccessCodes[doc.activity] = doc.access_code
          existingPdfs.push({
            activity: doc.activity,
            key: doc.storage_key,
            accessCode: doc.access_code
          })
        }
      }

      const emailResult = await sendEmail(env, email, name, existingPdfs, existingAccessCodes)

      return new Response(JSON.stringify({
        success: emailResult.success,
        accessCodes: existingAccessCodes,
        message: emailResult.success ? 'Email sent with existing PDFs and access codes' : `Email failed: ${emailResult.message}`
      }), { headers: { 'Content-Type': 'application/json' } })
    }

    const submissionId = generateId()
    const date = new Date(checkinDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const pdfs = []
    const accessCodes = {}
    
    for (const activity of activities) {
      const accessCode = generateAccessCode()
      accessCodes[activity] = accessCode
      
      const pdf = await renderPdf(activity, { property, checkinDate, name, initials, signature }, accessCode, env)
      const key = `waivers/${year}/${month}/${day}/${property}/${activity}/${name.split(' ').pop()}-${name.split(' ')[0]}-${submissionId}.pdf`
      
      await env.PDF_STORAGE.put(key, pdf)
      pdfs.push({ activity, key, accessCode })
    }

    await env.DB.prepare(`
      INSERT INTO submissions (id, property, checkin_date, name, email, activities, initials, signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(submissionId, property, checkinDate, name, email, JSON.stringify(activities), initials, signature, new Date().toISOString()).run()

    for (const pdf of pdfs) {
      await env.DB.prepare(`
        INSERT INTO documents (submission_id, activity, storage_key, access_code, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(submissionId, pdf.activity, pdf.key, pdf.accessCode, new Date().toISOString()).run()
    }

    const emailResult = await sendEmail(env, email, name, pdfs, accessCodes)

    return new Response(JSON.stringify({
      success: emailResult.success,
      accessCodes: accessCodes,
      message: emailResult.success ? 'Email sent with PDFs and access codes' : `Email failed: ${emailResult.message}`
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleAdminSearch(request, env) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  
  if (!query) {
    return new Response(JSON.stringify({ error: 'Query parameter required' }), { status: 400 })
  }

  const results = await env.DB.prepare(`
    SELECT * FROM submissions 
    WHERE name LIKE ? OR email LIKE ? OR property LIKE ? OR checkin_date LIKE ?
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`).all()

  return new Response(JSON.stringify({ results: results.results }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
