const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'react-native-css-interop', 'dist', 'runtime', 'third-party-libs', 'react-native-safe-area-context.native.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const target = 'const name = type.displayName || type.name;';
  const replacement = 'if (!type) return type;\n    const name = type.displayName || type.name;';
  
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched react-native-css-interop');
  } else {
    console.log('File already patched or content mismatch');
  }
} else {
  console.error('File not found:', filePath);
}
