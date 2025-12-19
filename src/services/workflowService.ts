// /services/workflowService.ts
import { BatchSummary, ProjectData } from '@/types';

export class WorkflowService {
  static async sendToWebhook(webhookUrl: string, data: any, integrationType?: 'slack' | 'teams' | 'generic') {
    try {
      let payload = data;
      
      // Format for specific platforms
      if (integrationType === 'slack') {
        payload = this.formatForSlack(data);
      } else if (integrationType === 'teams') {
        payload = this.formatForTeams(data);
      }

      // In a real implementation, this would be a fetch request
      // For demo, we'll simulate the request
      console.log('Sending to webhook:', webhookUrl, payload);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response
      return true;
    } catch (error) {
      console.error('Webhook error:', error);
      return false;
    }
  }

  private static formatForSlack(data: any) {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚀 Sifter Batch Results",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Projects:*\n${data.summary?.total || 0}`
            },
            {
              type: "mrkdwn",
              text: `*✅ PASS:*\n${data.summary?.passed || 0}`
            },
            {
              type: "mrkdwn",
              text: `*⚠️ FLAG:*\n${data.summary?.flagged || 0}`
            },
            {
              type: "mrkdwn",
              text: `*🚫 REJECT:*\n${data.summary?.rejected || 0}`
            }
          ]
        }
      ]
    };
  }

  private static formatForTeams(data: any) {
    return {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Sifter Batch Results",
      "sections": [{
        "activityTitle": "🚀 Sifter Batch Analysis Complete",
        "facts": [
          { "name": "Total Projects", "value": data.summary?.total || 0 },
          { "name": "✅ PASS", "value": data.summary?.passed || 0 },
          { "name": "⚠️ FLAG", "value": data.summary?.flagged || 0 },
          { "name": "🚫 REJECT", "value": data.summary?.rejected || 0 }
        ],
        "markdown": true
      }]
    };
  }

  static generatePartnerPacket(batchSummary: BatchSummary, selectedProjects: ProjectData[]) {
    const packet = {
      metadata: {
        title: "Sifter Partner Packet",
        generatedAt: new Date().toISOString(),
        analyst: "VC Deal Team"
      },
      executiveSummary: {
        totalProjects: batchSummary.total,
        passedProjects: batchSummary.passed,
        averageRiskScore: batchSummary.averageRiskScore,
        processingTime: batchSummary.processingTime,
        topRedFlags: Object.entries(batchSummary.redFlagDistribution)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([flag, count]) => ({ flag, count }))
      },
      recommendedProjects: selectedProjects.map(project => ({
        name: project.displayName,
        riskScore: project.overallRisk.score,
        verdict: project.overallRisk.verdict,
        summary: project.overallRisk.summary,
        strengths: this.extractStrengths(project.metrics),
        considerations: this.extractConsiderations(project.metrics)
      })),
      nextSteps: [
        "Schedule partner meeting to review PASS projects",
        "Request additional due diligence on FLAG projects",
        "Document rejection reasoning for REJECT projects"
      ]
    };

    return packet;
  }

  private static extractStrengths(metrics: any): string[] {
    const strengths: string[] = [];
    
    if (metrics.teamIdentity?.score < 30) {
      strengths.push("Fully doxxed team with strong credentials");
    }
    
    if (metrics.contaminatedNetwork?.score < 20) {
      strengths.push("Clean network with no connections to known bad actors");
    }
    
    if (metrics.tokenomics?.score < 30) {
      strengths.push("Fair tokenomics with reasonable vesting");
    }
    
    return strengths.length > 0 ? strengths : ["Solid fundamentals across key metrics"];
  }

  private static extractConsiderations(metrics: any): string[] {
    const considerations: string[] = [];
    
    if (metrics.mercenaryKeywords?.score > 60) {
      considerations.push("Community shows high mercenary discourse");
    }
    
    if (metrics.founderDistraction?.score > 50) {
      considerations.push("Founder appears distracted by multiple projects");
    }
    
    if (metrics.busFactor?.score > 70) {
      considerations.push("High dependency on few team members");
    }
    
    return considerations.length > 0 ? considerations : ["Standard due diligence recommended"];
  }

  static async sendEmail(to: string, subject: string, body: string, attachment?: any) {
    // In a real implementation, this would call an email service API
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}
