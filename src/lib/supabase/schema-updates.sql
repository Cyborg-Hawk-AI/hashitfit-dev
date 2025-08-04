
-- Create a storage bucket for meal images if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'meal-images', 'meal-images'
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'meal-images');

-- Set the bucket to public
UPDATE storage.buckets
SET public = true
WHERE id = 'meal-images';

-- Create policy to allow authenticated users to upload objects
CREATE POLICY "Allow users to upload meal images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to update their own objects
CREATE POLICY "Allow users to update their own meal images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
) 
WITH CHECK (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to read their own objects
CREATE POLICY "Allow users to read their own meal images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own objects
CREATE POLICY "Allow users to delete their own meal images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public read access to meal images
CREATE POLICY "Allow public read access to meal images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'meal-images'
);
