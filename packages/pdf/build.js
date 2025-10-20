const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

// Parse command line arguments
const args = process.argv.slice(2);
let inputFile = null;
let outputFile = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && i + 1 < args.length) {
    inputFile = args[i + 1];
    i++;
  } else if (args[i] === '--output' && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  }
}

// Validate arguments
if (!inputFile || !outputFile) {
  console.error('Usage: node build.js --input <input.md> --output <output.docx>');
  console.error('Note: Both DOCX and PDF files will be generated');
  process.exit(1);
}

// Resolve paths
inputFile = path.resolve(__dirname, inputFile);
outputFile = path.resolve(__dirname, outputFile);

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`\n❌ Input file not found: ${inputFile}\n`);
  process.exit(1);
}

// Pre-process markdown to handle HTML br tags
// markdown-docx doesn't handle HTML tags well, so we need to convert them
const tempInputFile = path.join(__dirname, '.temp_processed.md');
const markdownContent = fs.readFileSync(inputFile, 'utf8');
// Replace <br /> and <br/> with double spaces + newline (markdown line break)
const processedContent = markdownContent
  .replace(/<br\s*\/?>/gi, '  \n');
fs.writeFileSync(tempInputFile, processedContent, 'utf8');

// Check if output file is locked/open
function isFileLocked(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    // Try to open the file in exclusive mode
    const fd = fs.openSync(filePath, 'r+');
    fs.closeSync(fd);
    return false;
  } catch (err) {
    if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
      return true;
    }
    return false;
  }
}

// Derive PDF output path from DOCX output path
const pdfOutputFile = outputFile.replace(/\.docx$/, '.pdf');

console.log(`Building: ${path.basename(inputFile)}`);
console.log(`  -> ${path.basename(outputFile)}`);
console.log(`  -> ${path.basename(pdfOutputFile)}`);

// Check if output files are locked
if (isFileLocked(outputFile)) {
  console.error('\n❌ Build failed: DOCX output file is currently open or locked.');
  console.error(`   Please close: ${outputFile}`);
  console.error('   Then try building again.\n');
  process.exit(1);
}

if (isFileLocked(pdfOutputFile)) {
  console.error('\n❌ Build failed: PDF output file is currently open or locked.');
  console.error(`   Please close: ${pdfOutputFile}`);
  console.error('   Then try building again.\n');
  process.exit(1);
}

// Run the DOCX build
try {
  console.log('\n📄 Generating DOCX...');
  execSync(`markdown-docx --input "${tempInputFile}" --output "${outputFile}"`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ DOCX generated successfully!');
} catch (err) {
  // Clean up temp file
  if (fs.existsSync(tempInputFile)) {
    fs.unlinkSync(tempInputFile);
  }
  // Check if the error might be due to file lock
  if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
    console.error('\n❌ DOCX build failed: Unable to write to output file.');
    console.error('   The file might be open in another application.');
    console.error(`   Please close: ${outputFile}\n`);
  } else {
    console.error('\n❌ DOCX build failed with error:\n');
    console.error(err.message);
  }
  process.exit(1);
}

// Generate PDF with custom styling
console.log('\n📄 Generating PDF...');

const pdfOptions = {
  cssPath: path.join(__dirname, 'pdf-styles.css'),
  paperFormat: 'A4',
  paperOrientation: 'portrait',
  paperBorder: '2cm',
  runningsPath: path.join(__dirname, 'pdf-runnings.js')
};

markdownpdf(pdfOptions).from(tempInputFile).to(pdfOutputFile, (err) => {
  // Clean up temp file
  if (fs.existsSync(tempInputFile)) {
    fs.unlinkSync(tempInputFile);
  }

  if (err) {
    console.error('\n❌ PDF build failed with error:\n');
    console.error(err.message);
    process.exit(1);
  }
  console.log('✅ PDF generated successfully!');
  console.log('\n✅ Build completed successfully!\n');
});
