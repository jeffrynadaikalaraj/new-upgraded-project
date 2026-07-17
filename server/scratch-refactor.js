const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir);

files.forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // If already contains asyncHandler, skip to avoid double imports
  if (content.includes('express-async-handler')) {
    return;
  }

  // Regex to match exports.method = async (req, res, next) => { try { ... } catch (err) { next(err); } };
  // The match should be conservative to avoid capturing inner catch blocks
  const regex = /exports\.(\w+)\s*=\s*async\s*\(([^)]+)\)\s*=>\s*\{\s*try\s*\{([\s\S]*?)\}\s*catch\s*\(\w+\)\s*\{\s*(?:return\s*)?next\(\w+\);\s*\}\s*\};/g;

  let replaced = false;
  let newContent = content.replace(regex, (match, methodName, args, innerBody) => {
    replaced = true;
    return `exports.${methodName} = asyncHandler(async (${args}) => {
${innerBody}
});`;
  });

  if (replaced) {
    // Add import at the top
    newContent = `const asyncHandler = require('express-async-handler');\n` + newContent;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Refactored ${file}`);
  } else {
    console.log(`No matching patterns found in ${file}`);
  }
});
