import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const email = String(formData.get('email') || '').trim().toLowerCase();

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Valid email is required for upload' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: 'Only JPEG, PNG, WebP, or PDF files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'File must be 5MB or smaller' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const safeEmail = email.replace(/[^a-z0-9@._-]/g, '_').slice(0, 80);
    const path = `guest/${safeEmail}/${Date.now()}.${ext}`;

    const supabase = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('id-proofs')
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('ID proof upload error:', uploadError);
      return NextResponse.json(
        { message: uploadError.message || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ path, storagePath: path });
  } catch (err) {
    console.error('ID proof upload route error:', err);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
