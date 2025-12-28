import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement submissions API
  return NextResponse.json({ submissions: [] });
}

export async function POST(request: Request) {
  // TODO: Implement submission creation
  const body = await request.json();
  return NextResponse.json({ success: true, id: 'temp-id' });
}
