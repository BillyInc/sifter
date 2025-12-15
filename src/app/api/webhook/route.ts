// /app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { APIService } from '@/services/apiService';

// Mock function to send alerts
async function sendRiskAlert(payload: any): Promise<void> {
  // In production, implement actual alerting (email, SMS, Slack, etc.)
  console.log('🔴 Risk Alert:', payload);
  
  // Example: Send to Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Risk Threshold Exceeded\nProject: ${payload.project?.name}\nRisk Score: ${payload.riskScore}\nThreshold: ${payload.threshold}`
      })
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    if (!payload.event) {
      return NextResponse.json(
        { error: 'Missing event type' },
        { status: 400 }
      );
    }

    console.log('Webhook received:', payload.event);

    // Process webhook based on event type
    switch (payload.event) {
      case 'new_project':
        if (payload.project?.name) {
          // Trigger analysis when new project added
          await APIService.analyzeProject(payload.project.name);
        }
        break;
        
      case 'risk_threshold':
        // Send alert when risk crosses threshold
        await sendRiskAlert(payload);
        break;
        
      case 'entity_flagged':
        console.log('Entity flagged:', payload.entity);
        break;
        
      default:
        console.log('Unhandled webhook event:', payload.event);
    }
    
    return NextResponse.json({ received: true, event: payload.event }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge'; // Optional: use edge runtime for webhooks