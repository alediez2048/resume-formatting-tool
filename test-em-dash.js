/**
 * Quick test for em-dash format parsing
 * Tests the specific format: "T-Mobile — SEO Manager / Website Growth"
 */

import { parseResumeContent } from './src/utils/contentParser.js'

const testResume = `Jorge Alejandro Diez Magni
alediez2408@gmail.com | (512) 709-7014

years leading go-to-market, SEO, and content strategy for enterprise SaaS and consumer brands. Proven ability to bridge product and marketing, turn complex features into clear customer value, and equip GTM teams with positioning, messaging, and enablement materials that drive adoption and revenue.

WORK EXPERIENCE

T-Mobile — SEO Manager / Website Growth
2023 - Present
• Partnered with cross-functional teams to implement SEO strategy
• Led content optimization initiatives
• Drove organic traffic growth by 45%

Previous Company — Marketing Director  
2020 - 2023
• Developed go-to-market strategies
• Managed team of 5 marketing professionals
• Increased conversion rates by 30%

SKILLS

SEO, Content Strategy, Go-to-Market, Product Marketing, SaaS, B2B Marketing, Analytics

EDUCATION

University of Texas
Bachelor of Business Administration
2015 - 2019`

async function testEmDash() {
  console.log('🧪 Testing Em-Dash Format Parsing...\n')
  console.log('Testing line: "T-Mobile — SEO Manager / Website Growth"')
  console.log('Expected: Company="T-Mobile", Title="SEO Manager / Website Growth"\n')
  
  try {
    const result = await parseResumeContent(testResume, null)
    
    console.log('\n' + '='.repeat(80))
    console.log('RESULTS:')
    console.log('='.repeat(80))
    
    if (result.workExperience && result.workExperience.length > 0) {
      console.log(`✅ Found ${result.workExperience.length} work experience(s)`)
      
      result.workExperience.forEach((exp, idx) => {
        console.log(`\n${idx + 1}. Company: "${exp.company}"`)
        console.log(`   Title: "${exp.title}"`)
        console.log(`   Date: "${exp.date}"`)
        console.log(`   Bullets: ${exp.bullets?.length || 0}`)
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet, bIdx) => {
            console.log(`      ${bIdx + 1}. ${bullet}`)
          })
        }
      })
      
      // Check first experience
      const firstExp = result.workExperience[0]
      if (firstExp.company === 'T-Mobile' && firstExp.title && firstExp.title.includes('SEO Manager')) {
        console.log('\n✅ Em-dash format parsed correctly!')
      } else {
        console.log('\n❌ Em-dash format NOT parsed correctly')
        console.log(`   Got: Company="${firstExp.company}", Title="${firstExp.title}"`)
      }
      
      // Check bullets
      if (firstExp.bullets && firstExp.bullets.length >= 3) {
        console.log('✅ Bullets extracted correctly!')
      } else {
        console.log(`❌ Bullets missing or incomplete (found ${firstExp.bullets?.length || 0}, expected 3)`)
      }
      
    } else {
      console.log('❌ No work experience found!')
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

testEmDash()

