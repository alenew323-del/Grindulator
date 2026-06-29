import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log("Starting high-performance Vite production build...");
try {
  // Run standard Vite production build
  execSync('npm run build', { stdio: 'inherit' });
} catch (buildError) {
  console.error("Vite build failed:", buildError);
  process.exit(1);
}

console.log("Locating production assets in dist/...");
const distDir = path.join(process.cwd(), 'dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error(`Assets directory not found at: ${assetsDir}`);
  process.exit(1);
}

// Find built JS and CSS files
const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
const cssFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error("Error: Could not find generated JS or CSS bundle in dist/assets/");
  process.exit(1);
}

console.log(`Found compiled JS bundle: ${jsFile}`);
console.log(`Found compiled CSS bundle: ${cssFile}`);

const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');

let htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

// Inline CSS stylesheet: Replace the <link rel="stylesheet"> tag
const cssTagRegex = /<link\s+[^>]*href="\/assets\/index-[a-zA-Z0-9_-]+\.css"[^>]*>/i;
if (cssTagRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(cssTagRegex, `<style>${cssContent}</style>`);
  console.log("Successfully inlined CSS stylesheet!");
} else {
  // Fallback pattern if attributes differ
  const genericLinkRegex = /<link[^>]*href="[^"]*\.css"[^>]*>/i;
  if (genericLinkRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(genericLinkRegex, `<style>${cssContent}</style>`);
    console.log("Inlined CSS using fallback pattern!");
  } else {
    console.warn("Warning: Could not match CSS link tag in index.html. Appending to head instead.");
    htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
  }
}

// Inline JS module: Replace the <script type="module"> tag
const jsTagRegex = /<script\s+[^>]*src="\/assets\/index-[a-zA-Z0-9_-]+\.js"[^>]*><\/script>/i;
if (jsTagRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(jsTagRegex, `<script type="module">${jsContent}</script>`);
  console.log("Successfully inlined JS module!");
} else {
  // Fallback pattern if attributes differ
  const genericScriptRegex = /<script[^>]*src="[^"]*\.js"[^>]*><\/script>/i;
  if (genericScriptRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(genericScriptRegex, `<script type="module">${jsContent}</script>`);
    console.log("Inlined JS using fallback pattern!");
  } else {
    console.warn("Warning: Could not match JS script tag in index.html. Appending to body instead.");
    htmlContent = htmlContent.replace('</body>', `<script type="module">${jsContent}</script></body>`);
  }
}

// Write the compiled single-file bundle to `/THE_GRINDULATOR_COMPLETE.html`
const targetPath = '/THE_GRINDULATOR_COMPLETE.html';
fs.writeFileSync(targetPath, htmlContent, 'utf-8');

console.log(`\nSUCCESS: Standing single-file game compiled and inlined perfectly at: ${targetPath}`);
