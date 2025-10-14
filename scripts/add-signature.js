// Cdw-Spm: Script pour ajouter la signature dans tous les fichiers source
const fs = require('fs');
const path = require('path');

const SIGNATURE = '// Cdw-Spm';
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git'];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return EXTENSIONS.includes(ext);
}

function hasSignature(content) {
  return content.trim().startsWith(SIGNATURE);
}

function addSignature(content) {
  return `${SIGNATURE}\n${content}`;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    if (hasSignature(content)) {
      return false; // Already has signature
    }

    const newContent = addSignature(content);
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (shouldProcessFile(filePath)) {
      callback(filePath);
    }
  });
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  let processedCount = 0;
  let skippedCount = 0;

  console.log('Adding Cdw-Spm signature to source files...\n');

  // Process src directory
  walkDir(srcDir, (filePath) => {
    if (processFile(filePath)) {
      console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
      processedCount++;
    } else {
      skippedCount++;
    }
  });

  // Process prisma directory
  if (fs.existsSync(prismaDir)) {
    walkDir(prismaDir, (filePath) => {
      if (processFile(filePath)) {
        console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
        processedCount++;
      } else {
        skippedCount++;
      }
    });
  }

  console.log(`\nDone!`);
  console.log(`Processed: ${processedCount} files`);
  console.log(`Skipped: ${skippedCount} files (already had signature)`);
}

main();
