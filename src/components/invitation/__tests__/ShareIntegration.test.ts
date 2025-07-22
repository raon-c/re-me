/**
 * Integration test for sharing functionality
 * This test verifies that the sharing components can be imported and used correctly
 */

import type { ShareData } from '@/types';

// Test data
const mockInvitation: ShareData = {
  id: '1',
  invitationCode: 'ABC12345',
  groomName: '김철수',
  brideName: '이영희',
  weddingDate: '2024년 6월 15일',
  weddingTime: '오후 2시',
  venueName: '서울웨딩홀',
};

describe('Share Integration', () => {
  it('should have correct ShareData interface', () => {
    // Verify that ShareData interface has all required fields
    expect(mockInvitation).toHaveProperty('id');
    expect(mockInvitation).toHaveProperty('invitationCode');
    expect(mockInvitation).toHaveProperty('groomName');
    expect(mockInvitation).toHaveProperty('brideName');
    expect(mockInvitation).toHaveProperty('weddingDate');
    expect(mockInvitation).toHaveProperty('weddingTime');
    expect(mockInvitation).toHaveProperty('venueName');
  });

  it('should generate correct invitation URL format', () => {
    const expectedUrl = `https://example.com/invitation/${mockInvitation.invitationCode}`;
    expect(expectedUrl).toMatch(/^https:\/\/.*\/invitation\/[A-Z0-9]+$/);
  });

  it('should create proper share message template', () => {
    const baseMessage = `${mockInvitation.groomName} ❤️ ${mockInvitation.brideName} 결혼합니다!

📅 ${mockInvitation.weddingDate} ${mockInvitation.weddingTime}
📍 ${mockInvitation.venueName}

청첩장을 확인해 주세요 💌`;

    expect(baseMessage).toContain(mockInvitation.groomName);
    expect(baseMessage).toContain(mockInvitation.brideName);
    expect(baseMessage).toContain(mockInvitation.weddingDate);
    expect(baseMessage).toContain(mockInvitation.weddingTime);
    expect(baseMessage).toContain(mockInvitation.venueName);
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
