import { renderPdf, sendEmail, generateId } from './utils.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const method = request.method

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

async function handleSubmit(request, env) {
  try {
    const data = await request.json()
    const { property, checkinDate, name, email, activities, activityInitials, signature } = data

    if (!property || !checkinDate || !name || !email || !activities?.length || !activityInitials || !signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const submissionId = generateId()
    const date = new Date(checkinDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const pdfs = []
    const hasArchery = activities.includes('archery')
    const archeryPin = hasArchery ? env.ARCHERY_PIN : null

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i]
      const pin = activity === 'archery' ? env.ARCHERY_PIN : null

      try {
        console.log(`Generating PDF ${i + 1}/${activities.length} for activity: ${activity}`)

        const pdf = await renderPdf(activity, { property, checkinDate, name, initials: activityInitials[activity], signature }, pin, env)
        const key = `waivers/${year}/${month}/${day}/${property}/${activity}/${name.replace(' ', '-').toLowerCase()}-${submissionId}.pdf`

        await env.PDF_STORAGE.put(key, pdf)
        pdfs.push({ activity, key })

        if (i < activities.length - 1) {
          console.log('Waiting 2 seconds before generating next PDF...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

      } catch (error) {
        console.error(`Failed to generate PDF for activity ${activity}:`, error.message)
      }
    }

    await env.DB.prepare(`
      INSERT INTO submissions (id, property, checkin_date, name, email, activities, activity_initials, signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(submissionId, property, checkinDate, name, email, JSON.stringify(activities), JSON.stringify(activityInitials), signature, new Date().toISOString()).run()

    for (const pdf of pdfs) {
      await env.DB.prepare(`
        INSERT INTO documents (submission_id, activity, storage_key, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(submissionId, pdf.activity, pdf.key, new Date().toISOString()).run()
    }

    const emailResult = await sendEmail(env, email, name, pdfs, archeryPin)

    return new Response(JSON.stringify({
      success: emailResult.success,
      archeryPin: hasArchery ? archeryPin : null,
      message: emailResult.success ? 'Email sent successfully' : `Email failed: ${emailResult.message}`
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
