import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutSessionStatus } from '@/utils/stripe/server';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    const { status, paymentStatus, customerEmail } = await getCheckoutSessionStatus(sessionId);

    return NextResponse.json({
      status,
      payment_status: paymentStatus,
      customer_email: customerEmail,
    });
  } catch (error) {
    console.error('Session status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session status' },
      { status: 500 }
    );
  }
}
