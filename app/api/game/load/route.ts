import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const userEmail = session.user.email;
    const gameStateKey = `user-gamestate-${userEmail}`;

    const savedGame = await kv.get(gameStateKey);

    if (!savedGame) {
      return new NextResponse('No saved game found', { status: 404 });
    }

    return NextResponse.json(savedGame);
  } catch (error) {
    console.error('Error loading game state:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
