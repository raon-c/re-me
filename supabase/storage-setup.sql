-- Supabase Storage 설정 스크립트
-- 이미지 업로드를 위한 버킷 생성 및 정책 설정

-- 1. 이미지 저장용 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invitation-images',
  'invitation-images',
  true,
  5242880, -- 5MB 제한
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- 2. 공개 읽기 정책 설정 (누구나 이미지 조회 가능)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'invitation-images');

-- 3. 인증된 사용자만 업로드 가능하도록 정책 설정
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invitation-images' 
  AND auth.role() = 'authenticated'
);

-- 4. 본인이 업로드한 이미지만 삭제 가능하도록 정책 설정
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invitation-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 본인이 업로드한 이미지만 수정 가능하도록 정책 설정
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'invitation-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. RLS(Row Level Security) 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;