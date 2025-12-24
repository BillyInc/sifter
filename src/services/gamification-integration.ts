import { GamificationService } from './gamification';
import { IntegrationService, type ProjectData } from './integrationService';

// Define proper types
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
type IntegrationTarget = 'salesforce' | 'airtable' | 'slack' | 'teams' | 'webhook';
type RiskVerdict = 'safe' | 'caution' | 'risky' | 'critical';
type WebhookFormat = 'zapier' | 'make' | 'n8n';

interface SubmissionData {
  id?: string;
  entityName?: string;
  entityData?: string[];
  projectName?: string;
  severity?: SeverityLevel;
  description?: string;
  category?: string;
  evidence?: any[];
  riskFlags?: any[];
  submissionType?: 'quick' | 'standard' | 'full';
  submittedAt?: Date;
  gamification?: {
    basePoints?: number;
  };
}

interface IntegrationConfig {
  enabled: boolean;
  target?: IntegrationTarget;
  config?: {
    webhookUrl?: string;
    url?: string;
    format?: WebhookFormat;
    apiUrl?: string;
    apiKey?: string;
    [key: string]: any;
  };
}

// Constants
const SEVERITY_MULTIPLIERS: Record<SeverityLevel, number> = {
  'critical': 1.5,
  'high': 1.3,
  'medium': 1.0,
  'low': 0.8
};

// Type guard
function isValidSeverity(severity: any): severity is SeverityLevel {
  return ['critical', 'high', 'medium', 'low'].includes(severity);
}

function getRiskVerdict(score: number): RiskVerdict {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'risky';
  if (score >= 40) return 'caution';
  return 'safe';
}

export class GamificationIntegrationService {
  // Process submission with gamification rewards AND external integration
  static async processSubmissionWithIntegration(
    userProfile: any,
    submissionData: SubmissionData,
    integrationConfig?: IntegrationConfig
  ) {
    // Step 1: Process gamification rewards
    const submissionType = submissionData.submissionType || 'standard';
    const gamificationResult = GamificationService.processSubmissionRewards(
      userProfile,
      submissionType
    );
    
    const updatedProfile = GamificationService.createUpdatedProfile(
      userProfile,
      gamificationResult
    );
    
    // Step 2: Process external integration if enabled
    let integrationSuccess = false;
    
    if (integrationConfig?.enabled && integrationConfig.target) {
      try {
        const projectData = this.createProjectDataFromSubmission(
          submissionData,
          gamificationResult
        );
        
        await this.pushToExternalService(
          projectData,
          integrationConfig.target,
          integrationConfig.config || {}
        );
        
        integrationSuccess = true;
      } catch (error) {
        console.error('Integration failed:', error);
        // Continue with gamification even if integration fails
      }
    }
    
    return {
      gamificationResult,
      updatedProfile,
      integrationSuccess
    };
  }
  
  // Create project data from submission
  private static createProjectDataFromSubmission(
    submissionData: SubmissionData,
    gamificationResult: any
  ): ProjectData {
    // Extract entity info
    const entityName = submissionData.entityName || 
                      submissionData.entityData?.[0] || 
                      submissionData.projectName || 
                      'Unknown Entity';
    
    // Calculate risk metrics
    const riskScore = this.calculateRiskScore(submissionData);
    const riskVerdict = getRiskVerdict(riskScore);
    
    return {
      displayName: entityName,
      overallRisk: {
        score: riskScore,
        verdict: riskVerdict,
        summary: this.generateSummary(submissionData, gamificationResult),
        confidence: this.calculateConfidence(submissionData)
      },
      scannedAt: new Date(),
      processingTime: Date.now() - (submissionData.submittedAt?.getTime() || Date.now()),
      metrics: this.extractMetrics(submissionData)
    };
  }
  
  // FIXED: Type-safe risk score calculation
  private static calculateRiskScore(submissionData: SubmissionData): number {
    let score = 50; // Base score
    
    // Adjust based on evidence
    const evidenceCount = submissionData.evidence?.length || 0;
    score += Math.min(evidenceCount * 5, 25);
    
    // TYPE-SAFE severity multiplier
    const severityKey = submissionData.severity || 'medium';
    const severityMultiplier = isValidSeverity(severityKey) 
      ? SEVERITY_MULTIPLIERS[severityKey]
      : SEVERITY_MULTIPLIERS.medium;
    
    score *= severityMultiplier;
    
    // Adjust based on risk flags
    const riskFlagCount = submissionData.riskFlags?.length || 0;
    score += Math.min(riskFlagCount * 8, 40);
    
    return Math.min(Math.max(0, Math.round(score)), 100);
  }
  
  // Push to external service
  private static async pushToExternalService(
    projectData: ProjectData,
    target: IntegrationTarget,
    config: any
  ) {
    switch (target) {
      case 'salesforce':
        return await IntegrationService.pushToSalesforce(projectData, config);
      
      case 'airtable':
        return await IntegrationService.pushToAirtable(projectData, config);
      
      case 'slack':
        if (!config.webhookUrl) {
          throw new Error('Slack webhook URL is required');
        }
        return await IntegrationService.sendToSlack(projectData, config.webhookUrl);
      
      case 'teams':
        if (!config.webhookUrl) {
          throw new Error('Teams webhook URL is required');
        }
        return await IntegrationService.sendToTeams(projectData, config.webhookUrl);
      
      case 'webhook':
        if (!config.url) {
          throw new Error('Webhook URL is required');
        }
        const webhookPayload = IntegrationService.generateWebhookPayload(
          projectData,
          config.format || 'zapier'
        );
        const response = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
        });
        
        if (!response.ok) {
          throw new Error(`Webhook failed with status: ${response.status}`);
        }
        return response;
      
      default:
        throw new Error(`Unsupported integration target: ${target}`);
    }
  }
  
  private static calculateConfidence(submissionData: SubmissionData): number {
    let confidence = 75; // Base confidence
    
    // Increase with more evidence
    const evidenceCount = submissionData.evidence?.length || 0;
    confidence += Math.min(evidenceCount * 3, 15);
    
    // Decrease if incomplete data
    if (!submissionData.description || submissionData.description.length < 50) {
      confidence -= 10;
    }
    
    if (!submissionData.category) {
      confidence -= 5;
    }
    
    return Math.min(Math.max(0, confidence), 100);
  }
  
  private static generateSummary(submissionData: SubmissionData, gamificationResult: any): string {
    const parts: string[] = [];
    
    if (submissionData.description) {
      parts.push(submissionData.description);
    }
    
    if (gamificationResult.pointsAwarded) {
      parts.push(`User earned ${gamificationResult.pointsAwarded} points for this submission.`);
    }
    
    if (gamificationResult.badgesEarned?.length > 0) {
      parts.push(`Awarded ${gamificationResult.badgesEarned.length} badge(s).`);
    }
    
    return parts.join(' ') || 'No summary available.';
  }
  
  private static extractMetrics(submissionData: SubmissionData): any {
    return {
      evidence: {
        score: (submissionData.evidence?.length || 0) * 10,
        flags: submissionData.evidence?.map((e: any) => ({
          description: `Evidence: ${e.type || 'unknown'}`,
          severity: 'info' as const,
          category: 'Evidence'
        })) || [],
        confidence: 85
      },
      gamification: {
        score: submissionData.gamification?.basePoints || 0,
        flags: [],
        confidence: 90
      }
    };
  }
  
  // Sync user profile with external CRM
  static async syncUserProfileToCRM(
    userProfile: any,
    crmConfig: { apiUrl: string; apiKey: string }
  ) {
    const crmPayload = {
      userId: userProfile.userId,
      displayName: userProfile.displayName || `User_${userProfile.userId.slice(0, 8)}`,
      tier: userProfile.currentTier,
      totalPoints: userProfile.totalPoints,
      currentLevel: userProfile.currentLevel,
      badges: userProfile.badges.map((b: any) => b.name),
      achievements: userProfile.achievements
        .filter((a: any) => a.completed)
        .map((a: any) => a.name)
    };
    
    const response = await fetch(`${crmConfig.apiUrl}/users/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${crmConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(crmPayload)
    });
    
    if (!response.ok) {
      throw new Error(`CRM sync failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Batch process multiple submissions
  static async processBatchSubmissions(
    submissions: SubmissionData[],
    userProfile: any,
    integrationEnabled: boolean = false
  ) {
    const results: Array<{
      submissionId?: string;
      success: boolean;
      pointsAwarded?: number;
      integrationSuccess?: boolean;
      error?: string;
    }> = [];
    
    for (const submission of submissions) {
      try {
        const result = await this.processSubmissionWithIntegration(
          userProfile,
          submission,
          {
            enabled: integrationEnabled,
            target: 'slack',
            config: {}
          }
        );
        
        results.push({
          submissionId: submission.id,
          success: true,
          pointsAwarded: result.gamificationResult.pointsAwarded,
          integrationSuccess: result.integrationSuccess
        });
        
        // Update profile for next iteration
        userProfile = result.updatedProfile;
      } catch (error: any) {
        results.push({
          submissionId: submission.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      totalProcessed: submissions.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalPointsAwarded: results
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.pointsAwarded || 0), 0),
      results
    };
  }
}

// REMOVE THIS LINE - it's causing the duplicate export
// export { GamificationIntegrationService };

// Export types for use in other files
export type { 
  SubmissionData, 
  IntegrationConfig, 
  SeverityLevel, 
  IntegrationTarget, 
  RiskVerdict 
};