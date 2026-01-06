// src/types/feedback.ts - Feedback form types

export interface FeedbackFormData {
  // What do they think about the dashboard?
  dashboardOpinion: string;

  // What would they want improved?
  improvements: string;

  // Is it something they would use when it goes live?
  wouldUse: 'yes' | 'no' | 'maybe';

  // Does it solve an existing problem?
  solvesProblem: string;

  // Do they know someone who would benefit from the tool?
  referralName: string;

  // Twitter handle of the person they're referring
  referralTwitter: string;

  // Optional email for follow-up
  email?: string;

  // Metadata
  submittedAt?: string;
  userAgent?: string;
  source?: string;
}

export interface FeedbackSubmissionResponse {
  success: boolean;
  message: string;
  databaseId?: string;
  googleFormSubmitted?: boolean;
}

// Google Form configuration - UPDATE THESE VALUES after creating your form
export interface GoogleFormConfig {
  formActionUrl: string;
  entryIds: {
    dashboardOpinion: string;
    improvements: string;
    wouldUse: string;
    solvesProblem: string;
    referralName: string;
    referralTwitter: string;
    email: string;
  };
}

// Google Form configuration - extracted from pre-filled link
export const GOOGLE_FORM_CONFIG: GoogleFormConfig = {
  formActionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe80DwtQQ4VV003kTdtNE8DAdzkrTQJWIlCzMKexcrJ_XfTqw/formResponse',

  entryIds: {
    dashboardOpinion: 'entry.2051256572',
    improvements: 'entry.1904671194',
    wouldUse: 'entry.1231881369',
    solvesProblem: 'entry.846717615',
    referralName: 'entry.611979469',
    referralTwitter: 'entry.1389279862',
    email: 'entry.443408672',
  },
};
