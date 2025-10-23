// app/api/cron/daily-profits/route.ts
import { calculateDailyProfits } from '@/lib/investment';
import { NextRequest, NextResponse } from 'next/server';
 
export async function GET(request: NextRequest) {
  try {
    // Optional: Add security check for cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running automated daily profit calculation...');
    const result = await calculateDailyProfits();
    
    if (result.success) {
      console.log('✅ Daily profits calculated successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Daily profits calculated successfully' 
      });
    } else {
      console.error('❌ Failed to calculate daily profits:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error in daily profit calculation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// For manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}