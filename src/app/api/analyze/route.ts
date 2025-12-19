// /app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { APIService } from '@/services/apiService';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Expected a string.' },
        { status: 400 }
      );
    }

    // For production, use the real API
    if (process.env.NODE_ENV === 'production') {
      const data = await APIService.analyzeProject(input);
      return NextResponse.json(data, { status: 200 });
    }
    
    // For development, return mock data
    const mockData = await APIService.analyzeProjectMock(input);
    return NextResponse.json(mockData, { status: 200 });
  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: 'Analysis failed' }, 
      { status: 500 }
    );
  }
}

export const runtime = 'edge'; // Optional: use edge runtime for faster responses
