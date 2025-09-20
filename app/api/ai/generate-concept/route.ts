import { NextResponse } from 'next/server';
import { generateConcept } from '@/lib/game-logic';

export async function POST(request: Request) {
  try {
    const { genreConfig } = await request.json();

    const result = await generateConcept(genreConfig);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-concept API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
