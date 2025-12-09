/**
 * Test Script for Resume Parser
 * Run with: node test-parser.js
 */

import { parseResumeContent } from './src/utils/contentParser.js'

// Sample resume text with various formats
const sampleResume = `John Doe
john.doe@email.com | (555) 123-4567 | San Francisco, CA
linkedin.com/in/johndoe

Experienced software engineer with 8+ years building scalable web applications. Passionate about creating user-friendly products and mentoring junior developers. Proven track record of delivering high-impact projects in fast-paced environments.

WORK EXPERIENCE

Senior Software Engineer | Tech Company Inc. | 2020 - Present
San Francisco, CA · Remote
• Led development of microservices architecture serving 10M+ users
• Mentored team of 5 junior engineers, improving code quality by 40%
• Implemented CI/CD pipeline reducing deployment time by 60%
• Collaborated with product team to define technical roadmap

Software Engineer | Startup Co | 2018 - 2020
New York, NY
• Built RESTful APIs using Node.js and Express
• Developed React frontend components for customer dashboard
• Optimized database queries improving performance by 50%
• Participated in code reviews and architecture discussions

Junior Developer - Previous Company - 2016 - 2018
- Maintained legacy codebase and fixed critical bugs
- Contributed to migration from monolith to microservices
- Wrote unit tests increasing code coverage to 85%

SKILLS

Languages & Frameworks: JavaScript, TypeScript, React, Node.js, Python, Django
Tools & Technologies: Docker, Kubernetes, AWS, PostgreSQL, MongoDB
Soft Skills: Team Leadership, Agile Methodology, Technical Writing

EDUCATION

University of California, Berkeley
Bachelor of Science in Computer Science
2012 - 2016 | GPA: 3.8

General Assembly
Web Development Immersive Certificate | 2016`

async function testParser() {
  console.log('🧪 Testing Resume Parser...\n')
  console.log('=' .repeat(80))
  console.log('INPUT RESUME TEXT:')
  console.log('='.repeat(80))
  console.log(sampleResume)
  console.log('=' .repeat(80))
  console.log('\n')
  
  try {
    // Test without OpenAI (rule-based parsing)
    console.log('Testing rule-based parsing (no OpenAI)...\n')
    const result = await parseResumeContent(sampleResume, null)
    
    if (result.error) {
      console.error('❌ Parsing failed:', result.error)
      return
    }
    
    // Check results
    console.log('\n' + '='.repeat(80))
    console.log('TEST RESULTS:')
    console.log('='.repeat(80))
    
    let passedTests = 0
    let totalTests = 0
    
    // Test 1: Contact Info
    totalTests++
    if (result.contactInfo?.name === 'John Doe') {
      console.log('✅ Test 1: Name extracted correctly')
      passedTests++
    } else {
      console.log(`❌ Test 1: Name extraction failed. Got: "${result.contactInfo?.name}"`)
    }
    
    // Test 2: Email
    totalTests++
    if (result.contactInfo?.email === 'john.doe@email.com') {
      console.log('✅ Test 2: Email extracted correctly')
      passedTests++
    } else {
      console.log(`❌ Test 2: Email extraction failed. Got: "${result.contactInfo?.email}"`)
    }
    
    // Test 3: Personal Statement
    totalTests++
    if (result.personalStatement && result.personalStatement.length > 100) {
      console.log('✅ Test 3: Personal statement extracted correctly')
      console.log(`   Length: ${result.personalStatement.length} chars`)
      passedTests++
    } else {
      console.log(`❌ Test 3: Personal statement extraction failed. Got: "${result.personalStatement || 'null'}"`)
    }
    
    // Test 4: Work Experience Count
    totalTests++
    if (result.workExperience && result.workExperience.length === 3) {
      console.log('✅ Test 4: All 3 work experiences extracted')
      passedTests++
    } else {
      console.log(`❌ Test 4: Work experience count wrong. Got: ${result.workExperience?.length || 0}, Expected: 3`)
    }
    
    // Test 5: Bullets in First Experience
    totalTests++
    const firstExpBullets = result.workExperience?.[0]?.bullets?.length || 0
    if (firstExpBullets >= 4) {
      console.log(`✅ Test 5: Bullets extracted from first experience (${firstExpBullets} bullets)`)
      passedTests++
    } else {
      console.log(`❌ Test 5: Not enough bullets in first experience. Got: ${firstExpBullets}, Expected: 4+`)
    }
    
    // Test 6: Bullets in Second Experience
    totalTests++
    const secondExpBullets = result.workExperience?.[1]?.bullets?.length || 0
    if (secondExpBullets >= 4) {
      console.log(`✅ Test 6: Bullets extracted from second experience (${secondExpBullets} bullets)`)
      passedTests++
    } else {
      console.log(`❌ Test 6: Not enough bullets in second experience. Got: ${secondExpBullets}, Expected: 4+`)
    }
    
    // Test 7: Bullets in Third Experience (dash format)
    totalTests++
    const thirdExpBullets = result.workExperience?.[2]?.bullets?.length || 0
    if (thirdExpBullets >= 3) {
      console.log(`✅ Test 7: Bullets extracted from third experience (${thirdExpBullets} bullets)`)
      passedTests++
    } else {
      console.log(`❌ Test 7: Not enough bullets in third experience. Got: ${thirdExpBullets}, Expected: 3+`)
    }
    
    // Test 8: Skills
    totalTests++
    if (result.skills && result.skills.length > 50) {
      console.log('✅ Test 8: Skills extracted correctly')
      passedTests++
    } else {
      console.log(`❌ Test 8: Skills extraction failed. Got: "${result.skills || 'null'}"`)
    }
    
    // Test 9: Education Count
    totalTests++
    if (result.education && result.education.length >= 1) {
      console.log(`✅ Test 9: Education extracted (${result.education.length} entries)`)
      passedTests++
    } else {
      console.log(`❌ Test 9: Education extraction failed. Got: ${result.education?.length || 0} entries`)
    }
    
    // Test 10: Total bullets across all experiences
    totalTests++
    const totalBullets = result.workExperience?.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0) || 0
    if (totalBullets >= 11) {
      console.log(`✅ Test 10: Total bullets across all experiences (${totalBullets} bullets)`)
      passedTests++
    } else {
      console.log(`❌ Test 10: Not enough total bullets. Got: ${totalBullets}, Expected: 11+`)
    }
    
    console.log('\n' + '='.repeat(80))
    console.log(`FINAL SCORE: ${passedTests}/${totalTests} tests passed`)
    console.log('='.repeat(80))
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Parser is working correctly.')
    } else {
      console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Review the output above.`)
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testParser()

