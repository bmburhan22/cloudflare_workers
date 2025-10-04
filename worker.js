import { renderPdf, sendEmail, generateId } from './utils.js'

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

const errorResponse = (message, status = 400) =>
  jsonResponse({ error: message }, status)

const buildPdfStorageKey = (checkinDate, property, activity, name, id) => {
  const date = new Date(checkinDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `waivers/${year}/${month}/${day}/${property}/${activity}/${name.replace(' ', '-').toLowerCase()}-${id}.pdf`
}

const getArcheryPin = (activities, env) =>
  activities.includes('archery') ? env.ARCHERY_PIN : null

const saveSubmissionToDb = (env, id, data) =>
  env.DB.prepare(`
    INSERT INTO submissions (id, property, checkin_date, name, email, activities, activity_initials, signature, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    data.property,
    data.checkinDate,
    data.name,
    data.email,
    JSON.stringify(data.activities),
    JSON.stringify(data.activityInitials),
    data.signature,
    new Date().toISOString()
  ).run()

const saveDocumentToDb = (env, submissionId, activity, storageKey) =>
  env.DB.prepare(`
    INSERT INTO documents (submission_id, activity, storage_key, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(submissionId, activity, storageKey, new Date().toISOString()).run()

export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url)
    const { method } = request

    if (method === 'POST' && pathname === '/submit') {
      return handleSubmit(request, env, ctx)
    }

    if (method === 'GET' && pathname === '/admin/search') {
      return handleAdminSearch(request, env)
    }

    if (method === 'GET' && pathname === '/status') {
      return jsonResponse({ status: 'ok' })
    }

    if (method === 'GET' && pathname === '/test-email') {
      return jsonResponse(await sendEmail(env, searchParams.get('email'), '', []))
    }

    return new Response('Not Found', { status: 404 })
  }
}

async function handleSubmit(request, env, ctx) {
  try {
    const data = await request.json()
    const { property, checkinDate, name, email, activities, activityInitials, signature } = data

    if (!property || !checkinDate || !name || !email || !activities?.length || !activityInitials || !signature) {
      return errorResponse('Missing required fields')
    }

    const submissionId = generateId()
    const archeryPin = getArcheryPin(activities, env)

    await saveSubmissionToDb(env, submissionId, data)

    ctx.waitUntil(processPdfsAndEmail(env, {
      submissionId,
      property,
      checkinDate,
      name,
      email,
      activities,
      activityInitials,
      signature,
      archeryPin
    }))

    return jsonResponse({
      success: true,
      submissionId,
      archeryPin,
      message: 'Submission received! PDFs are being generated and will be emailed shortly.'
    })

  } catch (error) {
    return errorResponse(error.message, 500)
  }
}

async function processPdfsAndEmail(env, data) {
  const { submissionId, property, checkinDate, name, email, activities, activityInitials, signature, archeryPin } = data

  try {
    console.log(`Starting parallel PDF generation for ${activities.length} activities`)

    const pdfResults = await Promise.all(activities.map(async (activity, index) => {
      const pin = activity === 'archery' ? archeryPin : null
      const key = buildPdfStorageKey(checkinDate, property, activity, name, submissionId)

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
        await saveDocumentToDb(env, submissionId, activity, key)

        return { activity, key, success: true }
      } catch (error) {
        console.error(`Failed to generate PDF for activity ${activity}:`, error.message)
        return { activity, key, success: false, error: error.message }
      }
    }))

    const successfulPdfs = pdfResults.filter(pdf => pdf.success)

    console.log(`PDF generation complete: ${successfulPdfs.length}/${activities.length} successful`)

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
  const query = new URL(request.url).searchParams.get('q')

  if (!query) {
    return errorResponse('Query parameter required')
  }

  const searchPattern = `%${query}%`
  const results = await env.DB.prepare(`
    SELECT * FROM submissions
    WHERE name LIKE ? OR email LIKE ? OR property LIKE ? OR checkin_date LIKE ?
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(searchPattern, searchPattern, searchPattern, searchPattern).all()

  return jsonResponse({ results: results.results })
}
