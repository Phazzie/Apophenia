import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { gameState, worldState, storyHistory } = await request.json();
    const userEmail = session.user.email;
    const gameStateKey = `user-gamestate-${userEmail}`;

    const dataToSave = {
      gameState,
      worldState,
      storyHistory,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(gameStateKey, JSON.stringify(dataToSave));

    return NextResponse.json({ message: 'Game saved successfully' });
  } catch (error) {
    console.error('Error saving game state:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
