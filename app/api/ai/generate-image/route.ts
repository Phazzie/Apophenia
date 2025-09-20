import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/game-logic';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const result = await generateImage(prompt);

    return NextResponse.json({ url: result });
  } catch (error) {
    console.error('Error in generate-image API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
