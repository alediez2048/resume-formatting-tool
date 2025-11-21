# Resume Formatting Tool

🌐 **Live Demo:** [https://alediez2048.github.io/resume-formatting-tool/](https://alediez2048.github.io/resume-formatting-tool/)

A local, offline tool for formatting and exporting resumes to perfectly formatted PDFs. No accounts, no cloud, no hosting—just paste your content and get a professional PDF instantly.

## Features

- ✅ **Local-only**: Runs entirely offline on your machine
- ✅ **Consistent formatting**: Same professional design every time
- ✅ **Fast export**: PDF generation in under 2-3 seconds
- ✅ **No formatting breaks**: Template adapts to any text length
- ✅ **Simple UI**: Clean, intuitive interface for pasting resume content

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000` (should open automatically)

4. Fill in your resume information:
   - **Full Name** (required)
   - Contact information (email, phone, location)
   - Professional Summary
   - Work Experience
   - Skills
   - Education

5. Click **"Export PDF"** to download your formatted resume

## Usage

### Work Experience Format

For best results, format your experience like this:

```
Senior Software Engineer | Company Name | 2020 - Present
• Led development of scalable web applications
• Implemented CI/CD pipelines reducing deployment time by 50%
• Mentored junior developers and conducted code reviews

Software Engineer | Previous Company | 2018 - 2020
• Developed RESTful APIs using Node.js and Express
• Collaborated with cross-functional teams on product features
```

### Education Format

```
Bachelor of Science in Computer Science
University Name | 2015 - 2019

Master of Science in Software Engineering
Another University | 2019 - 2021
```

## Project Structure

```
resume-formatting-tool/
├── src/
│   ├── components/
│   │   ├── ResumeForm.jsx       # Input form component
│   │   ├── ResumeDocument.jsx   # PDF template component
│   │   └── ...
│   ├── utils/
│   │   └── pdfGenerator.js      # PDF export utility
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
├── package.json
└── README.md
```

## Customization

The resume template can be customized by editing `src/components/ResumeDocument.jsx`. You can modify:

- Colors (currently uses purple gradient theme)
- Fonts and sizes
- Spacing and margins
- Section layouts
- Styling elements

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React-PDF** - PDF generation library

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Requirements Met

✅ **FR1**: Runs locally via `npm run dev`  
✅ **FR2**: Input fields for all resume sections  
✅ **FR3**: Fixed professional template  
✅ **FR4**: Auto-formats spacing, fonts, sizes, margins  
✅ **FR5**: Exports PDF to downloads folder  
✅ **FR6**: Template file stored locally and editable  
✅ **FR7**: Template adapts to text length changes  

✅ **NFR1**: Pixel-consistent PDF output  
✅ **NFR2**: Fully offline operation  
✅ **NFR3**: Works from Cursor with one command  
✅ **NFR4**: Render time under 2-3 seconds  
✅ **NFR5**: Uses stable React-PDF library  

## License

MIT

