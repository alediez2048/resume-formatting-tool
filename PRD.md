# Product Requirements Document (PRD)
## Resume Formatting Tool

**Version:** 1.0  
**Date:** December 2024  
**Status:** Planning

---

## 1. Product Overview

### 1.1 Vision
The Resume Formatting Tool is a web application that enables users to format new resume content to match the exact styling, layout, and design of a reference resume. The tool extracts design specifications from a reference resume and applies them consistently to new resume content, ensuring professional, consistent formatting across multiple resume versions.

### 1.2 Problem Statement
Users often need to create multiple versions of their resume for different applications while maintaining consistent professional formatting. Manually matching fonts, spacing, margins, and layout across different resumes is time-consuming and error-prone. This tool automates the formatting process by learning from a reference resume and applying those specifications to new content.

### 1.3 Target Users
- Job seekers creating multiple tailored resume versions
- Career professionals updating their resumes regularly
- Recruiters formatting candidate resumes to company standards
- Anyone needing consistent resume formatting

---

## 2. Core Features

### 2.1 Feature 1: Reference Resume Upload & Analysis

**Description:**  
Users can provide a reference resume (via text input or file upload) that serves as the design template. The system analyzes and extracts all styling specifications from this reference.

**Key Capabilities:**
- Accept reference resume input (text paste or file upload)
- Extract and store styling specifications:
  - Font family, sizes for each element type
  - Section titles (formatting, case, spacing)
  - Contact information layout and formatting
  - Bullet point styles and indentation
  - Margins (top, bottom, left, right)
  - Line spacing and paragraph spacing
  - Section spacing and distances
  - Character length limits per section
  - Page layout (one-page constraint)
  - Color scheme (if applicable)
  - Border styles and dividers
  - Header/footer formatting

**User Flow:**
1. User navigates to "Set Reference Resume" section
2. User pastes reference resume text or uploads a file
3. System parses and analyzes the resume structure
4. System extracts and displays detected styling specifications
5. User can review and confirm the extracted specifications
6. System stores reference template for future use

**Acceptance Criteria:**
- ✅ System correctly identifies all major sections (Header, Personal Statement, Work Experience, Skills, Education, etc.)
- ✅ System extracts font sizes for name, section titles, body text, contact info
- ✅ System measures and records spacing between sections
- ✅ System identifies bullet point style and indentation
- ✅ System calculates margins and page layout constraints
- ✅ Reference template is saved and can be reused across sessions

---

### 2.2 Feature 2: New Resume Content Input

**Description:**  
Users provide the raw text content of a new resume they want formatted. The system accepts unstructured text and identifies the content sections.

**Key Capabilities:**
- Accept new resume content via text input (paste)
- Parse and identify content sections:
  - Name and contact information
  - Personal Statement/Summary
  - Work Experience (companies, roles, dates, bullet points)
  - Skills
  - Education
  - Any other sections present in reference
- Content validation and error handling
- Preview of parsed content before formatting

**User Flow:**
1. User navigates to "Format New Resume" section
2. User pastes new resume content text
3. System parses content and identifies sections
4. System displays parsed content preview for user confirmation
5. User can edit/correct parsed content if needed
6. User proceeds to formatting

**Acceptance Criteria:**
- ✅ System correctly identifies name, email, phone, location from contact info
- ✅ System extracts work experience entries with companies, titles, dates, and bullet points
- ✅ System identifies skills section content
- ✅ System extracts education information
- ✅ System handles various text formats and structures
- ✅ User can review and edit parsed content before formatting

---

### 2.3 Feature 3: Style Matching & Formatting Engine

**Description:**  
The core engine that applies the reference resume's styling specifications to the new resume content, ensuring pixel-perfect matching.

**Key Capabilities:**
- Apply reference font specifications to all matching elements
- Match section title formatting (case, size, spacing, styling)
- Preserve contact information layout and formatting style
- Apply bullet point styles and indentation from reference
- Apply margins and spacing measurements
- Maintain one-page constraint (auto-adjust content if needed)
- Preserve section order and structure from reference
- Handle content overflow intelligently (truncate, adjust font size, etc.)

**Styling Elements to Match:**
- **Fonts:** Family, sizes for each element type (name, titles, body, contact)
- **Titles:** Section titles formatting (e.g., "WORK EXPERIENCE", "Personal Statement", etc.)
- **Contact Details:** Layout, separator style, font size
- **Bullet Points:** Style (•, -, etc.), indentation, line spacing
- **Margins:** Top, bottom, left, right page margins
- **Distances:** Spacing between sections, spacing within sections
- **Character Length:** Max characters per line, per section (if applicable)
- **Layout:** One-page constraint, content distribution

**User Flow:**
1. System receives new resume content
2. System loads reference template specifications
3. System applies styling to each content element
4. System ensures one-page fit (adjusts if necessary)
5. System generates formatted resume preview

**Acceptance Criteria:**
- ✅ New resume uses exact same fonts as reference
- ✅ Section titles match reference formatting exactly
- ✅ Contact information layout matches reference
- ✅ Bullet points use same style and indentation as reference
- ✅ Margins and spacing match reference measurements
- ✅ Resume fits on one page (same as reference)
- ✅ Content is intelligently adjusted if overflow occurs
- ✅ Visual appearance is visually identical to reference (except content)

---

### 2.4 Feature 4: Resume Preview

**Description:**  
Users can preview the formatted resume before exporting to ensure it matches their expectations.

**Key Capabilities:**
- Real-time preview of formatted resume
- Side-by-side comparison with reference (optional)
- Zoom in/out functionality
- Page break visualization
- Highlight styling differences (if any)

**User Flow:**
1. After formatting, system displays preview
2. User reviews formatted resume
3. User can request adjustments if needed
4. User confirms and proceeds to export

**Acceptance Criteria:**
- ✅ Preview accurately represents final PDF output
- ✅ Preview shows one-page layout
- ✅ Preview displays all content correctly formatted
- ✅ Preview updates in real-time if user makes changes

---

### 2.5 Feature 5: PDF Export

**Description:**  
Export the formatted resume as a PDF file that matches the reference resume's styling exactly.

**Key Capabilities:**
- Generate PDF with exact styling specifications
- Ensure PDF matches preview
- One-page PDF output
- High-quality rendering
- Download to user's device

**User Flow:**
1. User reviews preview and confirms
2. User clicks "Export PDF" button
3. System generates PDF
4. PDF downloads to user's device

**Acceptance Criteria:**
- ✅ PDF matches preview exactly
- ✅ PDF uses correct fonts and styling
- ✅ PDF fits on one page
- ✅ PDF is high quality and professional
- ✅ PDF downloads successfully

---

## 3. User Stories

### Epic 1: Reference Resume Setup
- **As a user**, I want to provide a reference resume so that the system can learn my preferred formatting style.
- **As a user**, I want to see what styling specifications were extracted from my reference resume so that I can verify accuracy.
- **As a user**, I want to save my reference template so that I can reuse it for future resumes.

### Epic 2: New Resume Formatting
- **As a user**, I want to paste my new resume content so that it can be formatted automatically.
- **As a user**, I want to see how my content was parsed so that I can correct any mistakes.
- **As a user**, I want my new resume to look exactly like my reference resume (except for content) so that I maintain consistent branding.

### Epic 3: Export & Download
- **As a user**, I want to preview my formatted resume so that I can verify it looks correct.
- **As a user**, I want to export my resume as a PDF so that I can use it for job applications.

---

## 4. Technical Requirements

### 4.1 Technology Stack
- **Frontend:** React (current)
- **PDF Generation:** @react-pdf/renderer (current)
- **Styling Analysis:** Text parsing and measurement algorithms
- **Storage:** Local storage for reference templates (or backend if needed)

### 4.2 Key Technical Components

#### 4.2.1 Reference Resume Parser
- Parse text input to identify structure
- Extract styling specifications
- Measure spacing, margins, font sizes
- Store template specifications

#### 4.2.2 Content Parser
- Parse new resume text content
- Identify sections and extract structured data
- Handle various input formats

#### 4.2.3 Style Application Engine
- Apply reference styling to new content
- Handle one-page constraint
- Auto-adjust content if overflow
- Generate styled document

#### 4.2.4 PDF Generator
- Generate PDF with exact styling
- Ensure one-page output
- High-quality rendering

### 4.3 Data Models

#### Reference Template
```javascript
{
  id: string,
  name: string,
  fonts: {
    name: { family: string, size: number, weight: string },
    sectionTitle: { family: string, size: number, weight: string, transform: string },
    body: { family: string, size: number, lineHeight: number },
    contact: { family: string, size: number }
  },
  layout: {
    margins: { top: number, bottom: number, left: number, right: number },
    sectionSpacing: number,
    paragraphSpacing: number
  },
  sections: {
    titles: string[], // ["WORK EXPERIENCE", "SKILLS", etc.]
    order: string[],
    contactFormat: object
  },
  bullets: {
    style: string, // "•", "-", etc.
    indentation: number,
    lineSpacing: number
  },
  constraints: {
    onePage: boolean,
    maxCharactersPerLine: number
  }
}
```

#### Resume Content
```javascript
{
  name: string,
  contact: {
    email: string,
    phone: string,
    location: string,
    website?: string
  },
  personalStatement: string,
  workExperience: [
    {
      title: string,
      company: string,
      date: string,
      bullets: string[]
    }
  ],
  skills: string,
  education: [
    {
      degree: string,
      school: string,
      date?: string
    }
  ]
}
```

---

## 5. User Experience Flow

### 5.1 First-Time User Flow
1. **Landing Page** → User sees tool introduction
2. **Set Reference Resume** → User provides reference resume
3. **Template Confirmation** → User reviews extracted specifications
4. **Format New Resume** → User provides new resume content
5. **Content Parsing** → System parses and user confirms
6. **Formatting** → System applies styling
7. **Preview** → User reviews formatted resume
8. **Export** → User downloads PDF

### 5.2 Returning User Flow
1. **Landing Page** → User sees saved reference template
2. **Format New Resume** → User provides new resume content
3. **Content Parsing** → System parses and user confirms
4. **Formatting** → System applies styling using saved template
5. **Preview** → User reviews formatted resume
6. **Export** → User downloads PDF

---

## 6. Success Metrics

### 6.1 User Satisfaction
- Users can successfully format resumes matching reference style
- Formatting accuracy (visual similarity to reference)
- Time saved vs. manual formatting

### 6.2 Technical Metrics
- Parsing accuracy rate
- One-page fit success rate
- PDF generation success rate
- Average processing time

---

## 7. Out of Scope (v1.0)

- Multiple page resumes
- Image/logo support
- Multiple reference templates
- Collaborative features
- Cloud storage
- Resume templates marketplace
- ATS optimization features

---

## 8. Future Enhancements (Post-MVP)

- Support for multiple reference templates
- Resume version history
- Batch processing (multiple resumes at once)
- Custom section support
- Advanced overflow handling options
- Resume analytics and suggestions

---

## 9. Acceptance Criteria Summary

### Reference Resume Feature
- ✅ User can input reference resume (text or file)
- ✅ System extracts all styling specifications accurately
- ✅ User can review and confirm extracted specifications
- ✅ Reference template is saved for reuse

### New Resume Formatting Feature
- ✅ User can input new resume content
- ✅ System parses content correctly
- ✅ System applies reference styling exactly
- ✅ Only content changes, styling remains identical
- ✅ Resume fits on one page
- ✅ Section titles, contact format, fonts all match reference

### Export Feature
- ✅ User can preview formatted resume
- ✅ User can export to PDF
- ✅ PDF matches reference styling exactly
- ✅ PDF is one page
- ✅ PDF downloads successfully

---

## 10. Design Principles

1. **Simplicity:** Minimal steps to format a resume
2. **Accuracy:** Pixel-perfect matching to reference
3. **Reliability:** Consistent results every time
4. **Speed:** Fast processing and export
5. **Flexibility:** Handle various resume formats and structures

---

**Document Status:** Ready for Development  
**Next Steps:** Technical design and implementation planning

