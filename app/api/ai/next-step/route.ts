import { NextResponse } from 'next/server';
import { getNextStep } from '@/lib/game-logic';

export async function POST(request: Request) {
  try {
    const { playerChoice, worldState, history, genreConfig } = await request.json();

    const result = await getNextStep(playerChoice, worldState, history, genreConfig);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in next-step API route:', error);
    // It's better to return a JSON response for errors as well
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
