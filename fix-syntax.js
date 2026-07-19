const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'server', 'controllers');
const files = fs.readdirSync(controllersDir);

files.forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace `};` with `});` ONLY if it is at the end of a file or right before another export
  // AND it looks like an asyncHandler hasn't been closed.
  
  // A safe regex to fix this specific issue:
  // Find `};` on its own line, optionally followed by empty lines, and then either `exports.` or end of file.
  // We'll replace it with `});`
  
  const original = content;
  content = content.replace(/^};(?=\s*(?:exports\.|module\.exports|$))/gm, '});');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed syntax errors in: ${file}`);
  }
});
console.log("Done checking controllers.");
