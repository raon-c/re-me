#!/usr/bin/env node

/**
 * Generate placeholder images for templates
 * This creates simple SVG placeholders for template previews
 */

const fs = require('fs');
const path = require('path');

const templates = [
  // Classic Templates
  {
    id: 'classic-01',
    name: 'Classic Elegance',
    category: 'classic',
    color: '#8B4513',
  },
  {
    id: 'classic-02',
    name: 'Traditional Gold',
    category: 'classic',
    color: '#FFD700',
  },
  {
    id: 'classic-03',
    name: 'Vintage Rose',
    category: 'classic',
    color: '#CD5C5C',
  },
  {
    id: 'classic-04',
    name: 'Royal Blue',
    category: 'classic',
    color: '#4169E1',
  },
  {
    id: 'classic-05',
    name: 'Burgundy Elegance',
    category: 'classic',
    color: '#800020',
  },

  // Modern Templates
  {
    id: 'modern-01',
    name: 'Minimalist White',
    category: 'modern',
    color: '#000000',
  },
  {
    id: 'modern-02',
    name: 'Geometric Pattern',
    category: 'modern',
    color: '#2C3E50',
  },
  {
    id: 'modern-03',
    name: 'Bold Typography',
    category: 'modern',
    color: '#FF6B6B',
  },
  {
    id: 'modern-04',
    name: 'Gradient Sunset',
    category: 'modern',
    color: '#FF7F50',
  },

  // Romantic Templates
  {
    id: 'romantic-01',
    name: 'Pink Blush',
    category: 'romantic',
    color: '#FFB6C1',
  },
  {
    id: 'romantic-02',
    name: 'Lavender Dreams',
    category: 'romantic',
    color: '#9370DB',
  },
  {
    id: 'romantic-03',
    name: 'Coral Garden',
    category: 'romantic',
    color: '#FF7F50',
  },
  {
    id: 'romantic-04',
    name: 'Peach Blossom',
    category: 'romantic',
    color: '#FFCBA4',
  },

  // Minimal Templates
  {
    id: 'minimal-01',
    name: 'Pure White',
    category: 'minimal',
    color: '#333333',
  },
  {
    id: 'minimal-02',
    name: 'Black & White',
    category: 'minimal',
    color: '#000000',
  },
  {
    id: 'minimal-03',
    name: 'Soft Gray',
    category: 'minimal',
    color: '#708090',
  },
  {
    id: 'minimal-04',
    name: 'Clean Lines',
    category: 'minimal',
    color: '#2F4F4F',
  },
];

function generateSVG(template) {
  const { name, category, color } = template;

  return `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="300" height="400" fill="url(#bg)" stroke="${color}" stroke-width="2"/>
  
  <!-- Header decoration -->
  <rect x="50" y="40" width="200" height="2" fill="${color}" opacity="0.5"/>
  
  <!-- Title area -->
  <rect x="60" y="80" width="180" height="20" fill="${color}" opacity="0.2" rx="2"/>
  <rect x="80" y="110" width="140" height="15" fill="${color}" opacity="0.15" rx="2"/>
  
  <!-- Content area -->
  <rect x="70" y="150" width="160" height="8" fill="${color}" opacity="0.1" rx="1"/>
  <rect x="70" y="170" width="120" height="8" fill="${color}" opacity="0.1" rx="1"/>
  <rect x="70" y="190" width="140" height="8" fill="${color}" opacity="0.1" rx="1"/>
  
  <!-- Decorative elements -->
  <circle cx="150" cy="250" r="30" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>
  <circle cx="150" cy="250" r="20" fill="none" stroke="${color}" stroke-width="1" opacity="0.2"/>
  
  <!-- Footer area -->
  <rect x="70" y="320" width="160" height="6" fill="${color}" opacity="0.1" rx="1"/>
  <rect x="90" y="340" width="120" height="6" fill="${color}" opacity="0.1" rx="1"/>
  
  <!-- Category label -->
  <text x="150" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${color}" opacity="0.7">${category.toUpperCase()}</text>
  
  <!-- Footer decoration -->
  <rect x="50" y="390" width="200" height="2" fill="${color}" opacity="0.5"/>
</svg>`;
}

// Create public/templates directory if it doesn't exist
const templatesDir = path.join(process.cwd(), 'public', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Generate SVG files for each template
templates.forEach((template) => {
  const svg = generateSVG(template);
  const filename = `${template.id}-preview.svg`;
  const filepath = path.join(templatesDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`Generated: ${filename}`);
});

// Create a generic placeholder as well
const placeholderSVG = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
  <text x="150" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">Template Preview</text>
  <text x="150" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">Image not available</text>
</svg>`;

fs.writeFileSync(
  path.join(templatesDir, 'placeholder-preview.svg'),
  placeholderSVG
);
console.log('Generated: placeholder-preview.svg');

console.log(
  `\n✅ Generated ${templates.length + 1} placeholder images in public/templates/`
);
