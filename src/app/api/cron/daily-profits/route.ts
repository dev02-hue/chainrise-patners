import { calculateDailyProfits } from '@/lib/investment';
import { NextRequest, NextResponse } from 'next/server';
 
export async function POST(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    if (token !== cronSecret) {
      console.error('Invalid cron secret provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting daily profit calculation via API...');

    // Call your existing function
    const result = await calculateDailyProfits();

    // Add detailed logging
    console.log('📊 API calculateDailyProfits result:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('❌ Error calculating daily profits via API:', result.error);
      
      return NextResponse.json(
        { 
          error: result.error,
          details: result.data, // This will include the detailed error info
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    console.log('✅ Daily profits calculated successfully via API');
    return NextResponse.json({ 
      success: true, 
      message: 'Daily profits calculated successfully',
      data: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Unexpected error in daily profits API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}