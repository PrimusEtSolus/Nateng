import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FOLDERS = ['products', 'profile'] as const;
type FolderType = typeof ALLOWED_FOLDERS[number];

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9.-]/g, '');
  return cleaned || 'unnamed';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const rawFile = formData.get('image');
    const rawType = formData.get('type') as string | null;

    // Validate file exists
    if (!(rawFile instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const file = rawFile;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed', allowedTypes: ALLOWED_IMAGE_TYPES.join(', ') },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large', maxSizeMB: MAX_FILE_SIZE / (1024 * 1024), actualSizeMB: (file.size / (1024 * 1024)).toFixed(2) },
        { status: 400 }
      );
    }

    // Determine and validate folder
    const folder = rawType && ALLOWED_FOLDERS.includes(rawType as FolderType)
      ? (rawType as FolderType)
      : 'products';

    // Generate unique filename
    const timestamp = Date.now();
    const cleanName = sanitizeFilename(file.name);
    const filename = `${folder}/${timestamp}-${cleanName}`;

    // Upload to Vercel Blob with content type preserved
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ imageUrl: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to upload image', details: errorMessage },
      { status: 500 }
    );
  }
}