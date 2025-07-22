#!/usr/bin/env tsx
import { TemplateCategory } from '@prisma/client';
import { db } from '../src/lib/db';

// AIDEV-NOTE: 15개 기본 웨딩 템플릿 데이터 - 각 카테고리별 다양한 스타일 제공
const templates = [
  // Classic Templates
  {
    id: 'classic-elegant',
    name: '클래식 엘레간트',
    category: TemplateCategory.classic,
    previewImageUrl: '/templates/classic-elegant.jpg',
    cssStyles: {
      backgroundColor: '#faf7f4',
      fontFamily: 'Noto Serif KR',
      primaryColor: '#8b5a3c',
      accentColor: '#d4af37',
      borderStyle: 'decorative',
    },
    htmlStructure: `
      <div class="invitation-container classic-elegant">
        <div class="header-section">
          <div class="decorative-border"></div>
          <h1 class="couple-names">{{groomName}} ♥ {{brideName}}</h1>
          <div class="wedding-date">{{weddingDate}}</div>
        </div>
        <div class="content-section">
          <div class="message">{{customMessage}}</div>
          <div class="venue-info">
            <h3>예식장</h3>
            <p>{{venueName}}</p>
            <p>{{venueAddress}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'classic-traditional',
    name: '클래식 전통',
    category: TemplateCategory.classic,
    previewImageUrl: '/templates/classic-traditional.jpg',
    cssStyles: {
      backgroundColor: '#fff8f0',
      fontFamily: 'Noto Sans KR',
      primaryColor: '#2c1810',
      accentColor: '#b8860b',
      borderStyle: 'traditional',
    },
    htmlStructure: `
      <div class="invitation-container classic-traditional">
        <div class="traditional-header">
          <div class="korean-pattern"></div>
          <h1>{{groomName}} ♥ {{brideName}}</h1>
          <div class="date-time">{{weddingDate}} {{weddingTime}}</div>
        </div>
        <div class="venue-section">
          <h3>{{venueName}}</h3>
          <p>{{venueAddress}}</p>
        </div>
      </div>
    `,
  },
  {
    id: 'classic-vintage',
    name: '클래식 빈티지',
    category: TemplateCategory.classic,
    previewImageUrl: '/templates/classic-vintage.jpg',
    cssStyles: {
      backgroundColor: '#f5f1eb',
      fontFamily: 'Noto Serif KR',
      primaryColor: '#5d4e37',
      accentColor: '#cd853f',
      borderStyle: 'vintage',
    },
    htmlStructure: `
      <div class="invitation-container classic-vintage">
        <div class="vintage-frame">
          <h1 class="couple-names">{{groomName}} & {{brideName}}</h1>
          <div class="ornament"></div>
          <div class="wedding-info">
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'classic-royal',
    name: '클래식 로열',
    category: TemplateCategory.classic,
    previewImageUrl: '/templates/classic-royal.jpg',
    cssStyles: {
      backgroundColor: '#f8f6f0',
      fontFamily: 'Playfair Display',
      primaryColor: '#1a1a2e',
      accentColor: '#ffd700',
      borderStyle: 'royal',
    },
    htmlStructure: `
      <div class="invitation-container classic-royal">
        <div class="royal-crest"></div>
        <h1 class="royal-title">{{groomName}} ♥ {{brideName}}</h1>
        <div class="royal-details">
          <p>{{weddingDate}}</p>
          <p>{{venueName}}</p>
        </div>
      </div>
    `,
  },

  // Modern Templates
  {
    id: 'modern-minimal',
    name: '모던 미니멀',
    category: TemplateCategory.modern,
    previewImageUrl: '/templates/modern-minimal.jpg',
    cssStyles: {
      backgroundColor: '#ffffff',
      fontFamily: 'Noto Sans KR',
      primaryColor: '#333333',
      accentColor: '#007bff',
      borderStyle: 'clean',
    },
    htmlStructure: `
      <div class="invitation-container modern-minimal">
        <div class="minimal-header">
          <h1>{{groomName}} + {{brideName}}</h1>
          <div class="line-separator"></div>
        </div>
        <div class="event-details">
          <p class="date">{{weddingDate}}</p>
          <p class="venue">{{venueName}}</p>
          <p class="address">{{venueAddress}}</p>
        </div>
      </div>
    `,
  },
  {
    id: 'modern-geometric',
    name: '모던 기하학',
    category: TemplateCategory.modern,
    previewImageUrl: '/templates/modern-geometric.jpg',
    cssStyles: {
      backgroundColor: '#f8f9fa',
      fontFamily: 'Roboto',
      primaryColor: '#2c3e50',
      accentColor: '#e74c3c',
      borderStyle: 'geometric',
    },
    htmlStructure: `
      <div class="invitation-container modern-geometric">
        <div class="geometric-pattern"></div>
        <div class="content-wrapper">
          <h1>{{groomName}} & {{brideName}}</h1>
          <div class="geometric-divider"></div>
          <div class="details">
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'modern-gradient',
    name: '모던 그라데이션',
    category: TemplateCategory.modern,
    previewImageUrl: '/templates/modern-gradient.jpg',
    cssStyles: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Noto Sans KR',
      primaryColor: '#ffffff',
      accentColor: '#f1c40f',
      borderStyle: 'gradient',
    },
    htmlStructure: `
      <div class="invitation-container modern-gradient">
        <div class="gradient-overlay">
          <h1 class="gradient-text">{{groomName}} ♥ {{brideName}}</h1>
          <div class="event-info">
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'modern-typography',
    name: '모던 타이포그래피',
    category: TemplateCategory.modern,
    previewImageUrl: '/templates/modern-typography.jpg',
    cssStyles: {
      backgroundColor: '#1a1a1a',
      fontFamily: 'Montserrat',
      primaryColor: '#ffffff',
      accentColor: '#ff6b6b',
      borderStyle: 'typography',
    },
    htmlStructure: `
      <div class="invitation-container modern-typography">
        <div class="typo-layout">
          <h1 class="large-text">{{groomName}}</h1>
          <div class="ampersand">&</div>
          <h1 class="large-text">{{brideName}}</h1>
          <div class="event-details">
            <p>{{weddingDate}} | {{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },

  // Romantic Templates
  {
    id: 'romantic-floral',
    name: '로맨틱 플로럴',
    category: TemplateCategory.romantic,
    previewImageUrl: '/templates/romantic-floral.jpg',
    cssStyles: {
      backgroundColor: '#fef7f7',
      fontFamily: 'Dancing Script',
      primaryColor: '#8e4c5b',
      accentColor: '#ffb6c1',
      borderStyle: 'floral',
    },
    htmlStructure: `
      <div class="invitation-container romantic-floral">
        <div class="floral-border">
          <div class="flower-decoration"></div>
          <h1 class="script-font">{{groomName}} & {{brideName}}</h1>
          <div class="romantic-message">{{customMessage}}</div>
          <div class="wedding-details">
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'romantic-watercolor',
    name: '로맨틱 수채화',
    category: TemplateCategory.romantic,
    previewImageUrl: '/templates/romantic-watercolor.jpg',
    cssStyles: {
      backgroundColor: '#fff5f8',
      fontFamily: 'Great Vibes',
      primaryColor: '#d63384',
      accentColor: '#f8d7da',
      borderStyle: 'watercolor',
    },
    htmlStructure: `
      <div class="invitation-container romantic-watercolor">
        <div class="watercolor-bg">
          <h1 class="cursive-names">{{groomName}} ♡ {{brideName}}</h1>
          <div class="watercolor-element"></div>
          <div class="romantic-details">
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'romantic-vintage-lace',
    name: '로맨틱 빈티지 레이스',
    category: TemplateCategory.romantic,
    previewImageUrl: '/templates/romantic-vintage-lace.jpg',
    cssStyles: {
      backgroundColor: '#f9f7ff',
      fontFamily: 'Libre Baskerville',
      primaryColor: '#6f4e7c',
      accentColor: '#dda0dd',
      borderStyle: 'lace',
    },
    htmlStructure: `
      <div class="invitation-container romantic-vintage-lace">
        <div class="lace-frame">
          <div class="vintage-ornament"></div>
          <h1>{{groomName}} & {{brideName}}</h1>
          <div class="romantic-quote">"사랑은 두 마음이 하나가 되는 것"</div>
          <div class="event-info">
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },

  // Minimal Templates
  {
    id: 'minimal-clean',
    name: '미니멀 클린',
    category: TemplateCategory.minimal,
    previewImageUrl: '/templates/minimal-clean.jpg',
    cssStyles: {
      backgroundColor: '#ffffff',
      fontFamily: 'Noto Sans KR',
      primaryColor: '#000000',
      accentColor: '#f0f0f0',
      borderStyle: 'none',
    },
    htmlStructure: `
      <div class="invitation-container minimal-clean">
        <div class="clean-layout">
          <h1 class="simple-names">{{groomName}} • {{brideName}}</h1>
          <div class="minimal-divider"></div>
          <div class="essential-info">
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'minimal-monochrome',
    name: '미니멀 모노크롬',
    category: TemplateCategory.minimal,
    previewImageUrl: '/templates/minimal-monochrome.jpg',
    cssStyles: {
      backgroundColor: '#f8f8f8',
      fontFamily: 'Inter',
      primaryColor: '#2c2c2c',
      accentColor: '#808080',
      borderStyle: 'minimal',
    },
    htmlStructure: `
      <div class="invitation-container minimal-monochrome">
        <div class="monochrome-content">
          <h1 class="mono-title">{{groomName}}<br/>{{brideName}}</h1>
          <div class="separator-line"></div>
          <div class="event-summary">
            <p>{{weddingDate}} | {{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'minimal-space',
    name: '미니멀 스페이스',
    category: TemplateCategory.minimal,
    previewImageUrl: '/templates/minimal-space.jpg',
    cssStyles: {
      backgroundColor: '#fdfdfd',
      fontFamily: 'Source Sans Pro',
      primaryColor: '#4a4a4a',
      accentColor: '#e8e8e8',
      borderStyle: 'spacious',
    },
    htmlStructure: `
      <div class="invitation-container minimal-space">
        <div class="spacious-layout">
          <div class="centered-content">
            <h1>{{groomName}}</h1>
            <div class="and-symbol">and</div>
            <h1>{{brideName}}</h1>
            <div class="spacing"></div>
            <p>{{weddingDate}}</p>
            <p>{{venueName}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'minimal-elegant',
    name: '미니멀 엘레간트',
    category: TemplateCategory.minimal,
    previewImageUrl: '/templates/minimal-elegant.jpg',
    cssStyles: {
      backgroundColor: '#fafafa',
      fontFamily: 'Crimson Text',
      primaryColor: '#1c1c1c',
      accentColor: '#c9c9c9',
      borderStyle: 'elegant',
    },
    htmlStructure: `
      <div class="invitation-container minimal-elegant">
        <div class="elegant-minimal">
          <h1 class="refined-names">{{groomName}} & {{brideName}}</h1>
          <div class="elegant-line"></div>
          <div class="refined-details">
            <p class="date">{{weddingDate}}</p>
            <p class="venue">{{venueName}}</p>
            <p class="address">{{venueAddress}}</p>
          </div>
        </div>
      </div>
    `,
  },
];

async function seedTemplates() {
  console.log('🌱 템플릿 데이터 시딩 시작...');

  try {
    // 각 템플릿을 개별적으로 삽입 시도
    let successCount = 0;
    let skipCount = 0;

    for (const template of templates) {
      try {
        // 기존 템플릿 확인
        const existing = await db.template.findUnique({
          where: { id: template.id }
        });

        if (existing) {
          console.log(`⏭️  템플릿 '${template.name}' (${template.id}) 이미 존재, 스킵`);
          skipCount++;
          continue;
        }

        // 새 템플릿 생성
        const result = await db.template.create({
          data: template,
        });

        console.log(`✅ 템플릿 '${result.name}' (${result.id}) 생성 완료`);
        successCount++;
      } catch (error) {
        console.error(`❌ 템플릿 '${template.name}' 처리 중 오류:`, error);
      }
    }

    // 최종 결과 확인
    const finalCount = await db.template.count();
    console.log(`\n🎉 시딩 완료!`);
    console.log(`  - 새로 생성된 템플릿: ${successCount}개`);
    console.log(`  - 기존 템플릿 스킵: ${skipCount}개`);
    console.log(`  - 총 템플릿 수: ${finalCount}개`);

    // 카테고리별 통계
    const categoryStats = await db.template.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    console.log('\n📈 카테고리별 템플릿 수:');
    categoryStats.forEach(stat => {
      console.log(`  - ${stat.category}: ${stat._count.category}개`);
    });

  } catch (error) {
    console.error('❌ 템플릿 시딩 중 오류 발생:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  seedTemplates()
    .then(() => {
      console.log('✅ 템플릿 시딩이 성공적으로 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 템플릿 시딩 실패:', error);
      process.exit(1);
    });
}

export { seedTemplates };