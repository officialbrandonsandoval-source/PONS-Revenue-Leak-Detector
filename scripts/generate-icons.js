const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// PONS Brand Colors
const COLORS = {
  black: '#000000',
  blue: '#3b82f6',
  blueLight: '#60a5fa',
  white: '#ffffff',
};

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background - pure black
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(0, 0, size, size);
  
  // Blue circle (orb) - centered
  const centerX = size / 2;
  const centerY = size / 2;
  const orbRadius = size * 0.35;
  
  // Glow effect
  const gradient = ctx.createRadialGradient(
    centerX, centerY, orbRadius * 0.5,
    centerX, centerY, orbRadius * 1.5
  );
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, orbRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Main orb
  ctx.fillStyle = COLORS.blue;
  ctx.beginPath();
  ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Lightning bolt
  const boltScale = size / 192; // Scale based on 192px reference
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  
  // Lightning bolt path (centered on orb)
  const boltWidth = 40 * boltScale;
  const boltHeight = 60 * boltScale;
  const boltX = centerX - boltWidth / 2;
  const boltY = centerY - boltHeight / 2;
  
  // Draw lightning bolt shape
  ctx.moveTo(boltX + boltWidth * 0.6, boltY);                    // Top right
  ctx.lineTo(boltX + boltWidth * 0.2, boltY + boltHeight * 0.45); // Left middle
  ctx.lineTo(boltX + boltWidth * 0.45, boltY + boltHeight * 0.45); // Middle
  ctx.lineTo(boltX + boltWidth * 0.4, boltY + boltHeight);        // Bottom left
  ctx.lineTo(boltX + boltWidth * 0.8, boltY + boltHeight * 0.55); // Right middle
  ctx.lineTo(boltX + boltWidth * 0.55, boltY + boltHeight * 0.55); // Middle
  ctx.closePath();
  ctx.fill();
  
  return canvas;
}

// Generate icons
const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

sizes.forEach(size => {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon-${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated: ${filename}`);
});

// Also generate a favicon
const faviconCanvas = generateIcon(32);
const faviconBuffer = faviconCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconBuffer);
console.log('Generated: favicon.png');

// Generate apple-touch-icon (180x180)
const appleCanvas = generateIcon(180);
const appleBuffer = appleCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleBuffer);
console.log('Generated: apple-touch-icon.png');

console.log('\nAll icons generated successfully!');
