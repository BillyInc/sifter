import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { FeedbackFormData, FeedbackSubmissionResponse } from '@/types/feedback';
import { GOOGLE_FORM_CONFIG } from '@/types/feedback';

// Submit feedback to Google Form
async function submitToGoogleForm(data: FeedbackFormData): Promise<boolean> {
  const { formActionUrl, entryIds } = GOOGLE_FORM_CONFIG;

  // Skip if not configured
  if (formActionUrl.includes('YOUR_FORM_ID')) {
    console.log('Google Form not configured, skipping...');
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append(entryIds.dashboardOpinion, data.dashboardOpinion);
    formData.append(entryIds.improvements, data.improvements);
    formData.append(entryIds.wouldUse, data.wouldUse);
    formData.append(entryIds.solvesProblem, data.solvesProblem);
    formData.append(entryIds.referralName, data.referralName || '');
    formData.append(entryIds.referralTwitter, data.referralTwitter || '');
    formData.append(entryIds.email, data.email || '');

    // Google Forms accepts submissions via POST to formResponse endpoint
    // Note: This may fail due to CORS but will still record the response
    await fetch(formActionUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      mode: 'no-cors', // Required for Google Forms cross-origin requests
    });

    return true;
  } catch (error) {
    console.error('Google Form submission error:', error);
    return false;
  }
}

// Submit feedback to Supabase database
async function submitToDatabase(data: FeedbackFormData): Promise<string | null> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      console.log('Supabase not configured, skipping database submission...');
      return null;
    }

    const { data: insertedData, error } = await supabase
      .schema('sifter_dev')
      .from('feedback')
      .insert({
        dashboard_opinion: data.dashboardOpinion,
        improvements: data.improvements,
        would_use: data.wouldUse,
        solves_problem: data.solvesProblem,
        referral_name: data.referralName || null,
        referral_twitter: data.referralTwitter || null,
        email: data.email || null,
        submitted_at: data.submittedAt || new Date().toISOString(),
        user_agent: data.userAgent || null,
        source: data.source || 'api',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // If table doesn't exist, try to create it
      if (error.code === '42P01') {
        console.log('Feedback table may not exist. Please create it in Supabase.');
      }
      return null;
    }

    return insertedData?.id || null;
  } catch (error) {
    console.error('Database submission error:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body: FeedbackFormData = await request.json();

    // Validate required fields
    if (!body.dashboardOpinion?.trim()) {
      return NextResponse.json<FeedbackSubmissionResponse>(
        { success: false, message: 'Dashboard opinion is required' },
        { status: 400 }
      );
    }

    if (!body.improvements?.trim()) {
      return NextResponse.json<FeedbackSubmissionResponse>(
        { success: false, message: 'Improvements feedback is required' },
        { status: 400 }
      );
    }

    if (!body.solvesProblem?.trim()) {
      return NextResponse.json<FeedbackSubmissionResponse>(
        { success: false, message: 'Problem solving feedback is required' },
        { status: 400 }
      );
    }

    // Clean twitter handle (remove @ if present)
    if (body.referralTwitter) {
      body.referralTwitter = body.referralTwitter.replace(/^@/, '');
    }

    // Submit to both destinations in parallel
    const [databaseId, googleFormSubmitted] = await Promise.all([
      submitToDatabase(body),
      submitToGoogleForm(body),
    ]);

    // Consider success if at least one submission worked
    const success = databaseId !== null || googleFormSubmitted;

    if (!success) {
      return NextResponse.json<FeedbackSubmissionResponse>(
        {
          success: false,
          message: 'Failed to submit feedback. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<FeedbackSubmissionResponse>({
      success: true,
      message: 'Thank you for your feedback!',
      databaseId: databaseId || undefined,
      googleFormSubmitted,
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json<FeedbackSubmissionResponse>(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Feedback API - Use POST to submit feedback',
    fields: [
      'dashboardOpinion (required)',
      'improvements (required)',
      'wouldUse (required: yes/no/maybe)',
      'solvesProblem (required)',
      'referralName (optional)',
      'referralTwitter (optional)',
      'email (optional)',
    ],
  });
}
