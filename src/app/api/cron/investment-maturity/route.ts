// app/api/cron/investment-maturity/route.ts
import { processInvestmentMaturity } from '@/lib/investmentService';
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

    console.log('🚀 Starting investment maturity processing via API...');

    // Call the investment maturity processor
    const result = await processInvestmentMaturity();

    console.log('📊 API processInvestmentMaturity result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('❌ Error processing investment maturity via API:', result.error);
      
      return NextResponse.json(
        { 
          error: result.error,
          details: result.details,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    console.log('✅ Investment maturity processed successfully via API');
    return NextResponse.json({ 
      success: true, 
      message: 'Investment maturity processed successfully',
      data: result.details,
      processed: result.processed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Unexpected error in investment maturity API:', error);
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