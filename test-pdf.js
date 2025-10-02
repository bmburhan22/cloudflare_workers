import { renderPdf, generateId, generateAccessCode } from './utils.js'
import { writeFileSync } from 'fs'
async function testPdfGeneration() {
  console.log('🧪 Testing PDF generation...')
  
  try {
    // Test data
    const testData = {
      property: 'Test Resort',
      checkinDate: '2024-01-15',
      name: 'John Doe',
      initials: 'JD',
      signature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIiBzdHJva2U9IiMzMzMiLz4KPHRleHQgeD0iMTAwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Kb2huIERvZTwvdGV4dD4KPC9zdmc+'
    }
    
    const activity = 'kayaking'
    const accessCode = generateAccessCode()
    
    console.log('📝 Generating PDF for:', activity)
    console.log('👤 Participant:', testData.name)
    console.log('🏨 Property:', testData.property)
    console.log('🔑 Access Code:', accessCode)
    
    // Generate the PDF (will return HTML for local testing)
    const pdfContent = await renderPdf(activity, testData, accessCode)
    
    // Save to file
    const filename = `test-waiver-${activity}-${Date.now()}.html`
    writeFileSync(filename, pdfContent)
    
    console.log('✅ HTML generated successfully!')
    console.log(`📄 File saved as: ${filename}`)
    console.log('🌐 Open the file in your browser and use Ctrl+P to save as PDF')
    console.log('📝 Note: In Cloudflare Workers, this will generate a real PDF file')
    console.log('')
    console.log('📋 Test Summary:')
    console.log(`   - Activity: ${activity}`)
    console.log(`   - Participant: ${testData.name}`)
    console.log(`   - Property: ${testData.property}`)
    console.log(`   - Access Code: ${accessCode}`)
    console.log(`   - File: ${filename}`)
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testPdfGeneration()
