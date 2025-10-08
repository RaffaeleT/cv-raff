const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

console.log(`Building: ${path.basename(inputFile)} -> ${path.basename(outputFile)}`);

// Check if output file is locked
if (isFileLocked(outputFile)) {
  console.error('\n❌ Build failed: Output file is currently open or locked.');
  console.error(`   Please close: ${outputFile}`);
  console.error('   Then try building again.\n');
  process.exit(1);
}

// Run the build
try {
  execSync(`markdown-docx --input "${inputFile}" --output "${outputFile}"`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('\n✅ Build completed successfully!\n');
} catch (err) {
  // Check if the error might be due to file lock
  if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
    console.error('\n❌ Build failed: Unable to write to output file.');
    console.error('   The file might be open in another application.');
    console.error(`   Please close: ${outputFile}\n`);
  } else {
    console.error('\n❌ Build failed with error:\n');
    console.error(err.message);
  }
  process.exit(1);
}
