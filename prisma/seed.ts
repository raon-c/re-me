import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Insert initial template data
  const templates = [
    // Classic Templates
    {
      id: 'classic-01',
      name: 'Classic Elegance',
      category: 'classic' as const,
      previewImageUrl: '/templates/classic-01-preview.svg',
      cssStyles: {
        primaryColor: '#8B4513',
        secondaryColor: '#F5F5DC',
        fontFamily: 'serif',
        backgroundColor: '#FFFFFF',
      },
      htmlStructure:
        '<div class="invitation-container"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'classic-02',
      name: 'Traditional Gold',
      category: 'classic' as const,
      previewImageUrl: '/templates/classic-02-preview.svg',
      cssStyles: {
        primaryColor: '#FFD700',
        secondaryColor: '#8B0000',
        fontFamily: 'serif',
        backgroundColor: '#FFF8DC',
      },
      htmlStructure:
        '<div class="invitation-container gold-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'classic-03',
      name: 'Vintage Rose',
      category: 'classic' as const,
      previewImageUrl: '/templates/classic-03-preview.svg',
      cssStyles: {
        primaryColor: '#CD5C5C',
        secondaryColor: '#F0E68C',
        fontFamily: 'serif',
        backgroundColor: '#FFF0F5',
      },
      htmlStructure:
        '<div class="invitation-container vintage-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'classic-04',
      name: 'Royal Blue',
      category: 'classic' as const,
      previewImageUrl: '/templates/classic-04-preview.svg',
      cssStyles: {
        primaryColor: '#4169E1',
        secondaryColor: '#F0F8FF',
        fontFamily: 'serif',
        backgroundColor: '#FFFFFF',
      },
      htmlStructure:
        '<div class="invitation-container royal-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'classic-05',
      name: 'Burgundy Elegance',
      category: 'classic' as const,
      previewImageUrl: '/templates/classic-05-preview.svg',
      cssStyles: {
        primaryColor: '#800020',
        secondaryColor: '#F5F5DC',
        fontFamily: 'serif',
        backgroundColor: '#FDF5E6',
      },
      htmlStructure:
        '<div class="invitation-container burgundy-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },

    // Modern Templates
    {
      id: 'modern-01',
      name: 'Minimalist White',
      category: 'modern' as const,
      previewImageUrl: '/templates/modern-01-preview.svg',
      cssStyles: {
        primaryColor: '#000000',
        secondaryColor: '#808080',
        fontFamily: 'sans-serif',
        backgroundColor: '#FFFFFF',
      },
      htmlStructure:
        '<div class="invitation-container modern-minimal"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'modern-02',
      name: 'Geometric Pattern',
      category: 'modern' as const,
      previewImageUrl: '/templates/modern-02-preview.svg',
      cssStyles: {
        primaryColor: '#2C3E50',
        secondaryColor: '#E74C3C',
        fontFamily: 'sans-serif',
        backgroundColor: '#ECF0F1',
      },
      htmlStructure:
        '<div class="invitation-container geometric-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'modern-03',
      name: 'Bold Typography',
      category: 'modern' as const,
      previewImageUrl: '/templates/modern-03-preview.svg',
      cssStyles: {
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        fontFamily: 'sans-serif',
        backgroundColor: '#FFFFFF',
      },
      htmlStructure:
        '<div class="invitation-container bold-typography"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'modern-04',
      name: 'Gradient Sunset',
      category: 'modern' as const,
      previewImageUrl: '/templates/modern-04-preview.svg',
      cssStyles: {
        primaryColor: '#FF7F50',
        secondaryColor: '#FFB6C1',
        fontFamily: 'sans-serif',
        backgroundColor: '#FFF5EE',
      },
      htmlStructure:
        '<div class="invitation-container gradient-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },

    // Romantic Templates
    {
      id: 'romantic-01',
      name: 'Pink Blush',
      category: 'romantic' as const,
      previewImageUrl: '/templates/romantic-01-preview.svg',
      cssStyles: {
        primaryColor: '#FFB6C1',
        secondaryColor: '#FFC0CB',
        fontFamily: 'cursive',
        backgroundColor: '#FFF0F5',
      },
      htmlStructure:
        '<div class="invitation-container romantic-pink"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'romantic-02',
      name: 'Lavender Dreams',
      category: 'romantic' as const,
      previewImageUrl: '/templates/romantic-02-preview.svg',
      cssStyles: {
        primaryColor: '#9370DB',
        secondaryColor: '#E6E6FA',
        fontFamily: 'cursive',
        backgroundColor: '#F8F8FF',
      },
      htmlStructure:
        '<div class="invitation-container lavender-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'romantic-03',
      name: 'Coral Garden',
      category: 'romantic' as const,
      previewImageUrl: '/templates/romantic-03-preview.svg',
      cssStyles: {
        primaryColor: '#FF7F50',
        secondaryColor: '#FFEFD5',
        fontFamily: 'cursive',
        backgroundColor: '#FFF8DC',
      },
      htmlStructure:
        '<div class="invitation-container coral-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'romantic-04',
      name: 'Peach Blossom',
      category: 'romantic' as const,
      previewImageUrl: '/templates/romantic-04-preview.svg',
      cssStyles: {
        primaryColor: '#FFCBA4',
        secondaryColor: '#FFE4E1',
        fontFamily: 'cursive',
        backgroundColor: '#FFF5EE',
      },
      htmlStructure:
        '<div class="invitation-container peach-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },

    // Minimal Templates
    {
      id: 'minimal-01',
      name: 'Pure White',
      category: 'minimal' as const,
      previewImageUrl: '/templates/minimal-01-preview.svg',
      cssStyles: {
        primaryColor: '#333333',
        secondaryColor: '#666666',
        fontFamily: 'sans-serif',
        backgroundColor: '#FFFFFF',
      },
      htmlStructure:
        '<div class="invitation-container minimal-pure"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'minimal-02',
      name: 'Black & White',
      category: 'minimal' as const,
      previewImageUrl: '/templates/minimal-02-preview.svg',
      cssStyles: {
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        fontFamily: 'sans-serif',
        backgroundColor: '#F5F5F5',
      },
      htmlStructure:
        '<div class="invitation-container minimal-bw"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'minimal-03',
      name: 'Soft Gray',
      category: 'minimal' as const,
      previewImageUrl: '/templates/minimal-03-preview.svg',
      cssStyles: {
        primaryColor: '#708090',
        secondaryColor: '#D3D3D3',
        fontFamily: 'sans-serif',
        backgroundColor: '#F8F8FF',
      },
      htmlStructure:
        '<div class="invitation-container minimal-gray"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
    {
      id: 'minimal-04',
      name: 'Clean Lines',
      category: 'minimal' as const,
      previewImageUrl: '/templates/minimal-04-preview.svg',
      cssStyles: {
        primaryColor: '#2F4F4F',
        secondaryColor: '#F5F5F5',
        fontFamily: 'sans-serif',
        backgroundColor: '#FFFFFF',
      },
      htmlStructure:
        '<div class="invitation-container minimal-clean"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>',
    },
  ];

  // Use upsert to avoid conflicts
  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
  }

  console.log(`✅ Seeded ${templates.length} templates`);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
