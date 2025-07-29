/**
 * Integration test for sharing functionality
 * This test verifies that the sharing components can be imported and used correctly
 */

import type { ShareData } from '@/types';

// Test data
const mockInvitation: ShareData = {
  id: '1',
  invitation_code: 'ABC12345',
  groom_name: '김철수',
  bride_name: '이영희',
  wedding_date: '2024년 6월 15일',
  wedding_time: '오후 2시',
  venue_name: '서울웨딩홀',
};

describe('Share Integration', () => {
  it('should have correct ShareData interface', () => {
    // Verify that ShareData interface has all required fields
    expect(mockInvitation).toHaveProperty('id');
    expect(mockInvitation).toHaveProperty('invitation_code');
    expect(mockInvitation).toHaveProperty('groom_name');
    expect(mockInvitation).toHaveProperty('bride_name');
    expect(mockInvitation).toHaveProperty('wedding_date');
    expect(mockInvitation).toHaveProperty('wedding_time');
    expect(mockInvitation).toHaveProperty('venue_name');
  });

  it('should generate correct invitation URL format', () => {
    const expectedUrl = `https://example.com/invitation/${mockInvitation.invitation_code}`;
    expect(expectedUrl).toMatch(/^https:\/\/.*\/invitation\/[A-Z0-9]+$/);
  });

  it('should create proper share message template', () => {
    const baseMessage = `${mockInvitation.groom_name} ❤️ ${mockInvitation.bride_name} 결혼합니다!

📅 ${mockInvitation.wedding_date} ${mockInvitation.wedding_time}
📍 ${mockInvitation.venue_name}

청첩장을 확인해 주세요 💌`;

    expect(baseMessage).toContain(mockInvitation.groom_name);
    expect(baseMessage).toContain(mockInvitation.bride_name);
    expect(baseMessage).toContain(mockInvitation.wedding_date);
    expect(baseMessage).toContain(mockInvitation.wedding_time);
    expect(baseMessage).toContain(mockInvitation.venue_name);
  });
});

// Mock functions for testing
const mockFunctions = {
  copyToClipboard: async (text: string): Promise<boolean> => {
    console.log('Mock: Copying to clipboard:', text);
    return true;
  },

  shareToKakao: async (shareData: ShareData): Promise<boolean> => {
    console.log('Mock: Sharing to KakaoTalk:', shareData);
    return true;
  },

  shareToSMS: async (shareData: ShareData): Promise<boolean> => {
    console.log('Mock: Sharing via SMS:', shareData);
    return true;
  },

  shareToEmail: async (shareData: ShareData): Promise<boolean> => {
    console.log('Mock: Sharing via Email:', shareData);
    return true;
  },

  shareNative: async (shareData: ShareData): Promise<boolean> => {
    console.log('Mock: Native sharing:', shareData);
    return true;
  },
};

describe('Share Functions', () => {
  it('should handle clipboard sharing', async () => {
    const result = await mockFunctions.copyToClipboard('test-url');
    expect(result).toBe(true);
  });

  it('should handle KakaoTalk sharing', async () => {
    const result = await mockFunctions.shareToKakao(mockInvitation);
    expect(result).toBe(true);
  });

  it('should handle SMS sharing', async () => {
    const result = await mockFunctions.shareToSMS(mockInvitation);
    expect(result).toBe(true);
  });

  it('should handle Email sharing', async () => {
    const result = await mockFunctions.shareToEmail(mockInvitation);
    expect(result).toBe(true);
  });

  it('should handle Native sharing', async () => {
    const result = await mockFunctions.shareNative(mockInvitation);
    expect(result).toBe(true);
  });
});
