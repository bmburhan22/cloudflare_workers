import { renderPdf, sendEmail, generateId } from './utils.js'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const method = request.method

    if (method === 'POST' && url.pathname === '/submit') {
      return handleSubmit(request, env, ctx)
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

async function handleSubmit(request, env, ctx) {
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

    // Save submission to database immediately
    await env.DB.prepare(`
      INSERT INTO submissions (id, property, checkin_date, name, email, activities, activity_initials, signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(submissionId, property, checkinDate, name, email, JSON.stringify(activities), JSON.stringify(activityInitials), signature, new Date().toISOString()).run()

    // Return immediate response
    const hasArchery = activities.includes('archery')
    const archeryPin = hasArchery ? env.ARCHERY_PIN : null

    // Start async PDF generation and email process
    ctx.waitUntil(processPdfsAndEmail(env, {
      submissionId,
      property,
      checkinDate,
      name,
      email,
      activities,
      activityInitials,
      signature,
      year,
      month,
      day,
      archeryPin
    }))

    return new Response(JSON.stringify({
      success: true,
      submissionId,
      archeryPin: hasArchery ? archeryPin : null,
      message: 'Submission received! PDFs are being generated and will be emailed shortly.'
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function processPdfsAndEmail(env, data) {
  const { submissionId, property, checkinDate, name, email, activities, activityInitials, signature, year, month, day, archeryPin } = data
  
  try {
    console.log(`Starting parallel PDF generation for ${activities.length} activities`)
    
    // Generate all PDFs in parallel
    const pdfPromises = activities.map(async (activity, index) => {
      const pin = activity === 'archery' ? archeryPin : null
      const key = `waivers/${year}/${month}/${day}/${property}/${activity}/${name.replace(' ', '-').toLowerCase()}-${submissionId}.pdf`
      
      try {
        console.log(`Generating PDF ${index + 1}/${activities.length} for activity: ${activity}`)
        
        const pdf = await renderPdf(activity, { 
          property, 
          checkinDate, 
          name, 
          initials: activityInitials[activity], 
          signature 
        }, pin, env)
        
        await env.PDF_STORAGE.put(key, pdf)
        
        // Save document record
        await env.DB.prepare(`
          INSERT INTO documents (submission_id, activity, storage_key, created_at)
          VALUES (?, ?, ?, ?)
        `).bind(submissionId, activity, key, new Date().toISOString()).run()
        
        return { activity, key, success: true }
      } catch (error) {
        console.error(`Failed to generate PDF for activity ${activity}:`, error.message)
        return { activity, key, success: false, error: error.message }
      }
    })

    // Wait for all PDFs to complete
    const pdfResults = await Promise.all(pdfPromises)
    const successfulPdfs = pdfResults.filter(pdf => pdf.success)
    
    console.log(`PDF generation complete: ${successfulPdfs.length}/${activities.length} successful`)
    
    // Send email with all successful PDFs
    if (successfulPdfs.length > 0) {
      const emailResult = await sendEmail(env, email, name, successfulPdfs, archeryPin)
      console.log('Email result:', emailResult)
    } else {
      console.error('No PDFs were generated successfully, skipping email')
    }
    
  } catch (error) {
    console.error('Error in async PDF processing:', error)
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
