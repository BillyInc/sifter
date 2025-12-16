// /services/integrationService.ts

// Define the necessary types
interface RiskFlag {
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
}

interface Metric {
  score: number;
  flags: RiskFlag[];
  confidence: number;
}

interface RiskAssessment {
  score: number;
  verdict: 'safe' | 'caution' | 'risky' | 'critical';
  summary: string;
  confidence: number;
}

interface ProjectMetrics {
  [key: string]: Metric;
}

interface ProjectData {
  displayName: string;
  overallRisk: RiskAssessment;
  scannedAt: Date;
  processingTime: number;
  metrics: ProjectMetrics;
}

export class IntegrationService {
  // Salesforce Integration
  static async pushToSalesforce(projectData: ProjectData, salesforceConfig: any) {
    const salesforcePayload = {
      Name: projectData.displayName,
      Sifter_Risk_Score__c: projectData.overallRisk.score,
      Sifter_Verdict__c: projectData.overallRisk.verdict.toUpperCase(),
      Sifter_Summary__c: projectData.overallRisk.summary,
      Sifter_Last_Scanned__c: projectData.scannedAt.toISOString(),
      Sifter_Report_URL__c: this.generateReportURL(projectData)
    };

    // Create or update Salesforce record
    const response = await fetch(`${salesforceConfig.instanceUrl}/services/data/v58.0/sobjects/Deal__c`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${salesforceConfig.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(salesforcePayload)
    });

    return response.json();
  }

  // Airtable Integration
  static async pushToAirtable(projectData: ProjectData, airtableConfig: any) {
    const airtablePayload = {
      records: [{
        fields: {
          'Project Name': projectData.displayName,
          'Risk Score': projectData.overallRisk.score,
          'Verdict': projectData.overallRisk.verdict,
          'Key Findings': this.extractKeyFindings(projectData),
          'Scanned Date': projectData.scannedAt.toISOString().split('T')[0],
          'Report': this.generateReportURL(projectData)
        }
      }]
    };

    const response = await fetch(`https://api.airtable.com/v0/${airtableConfig.baseId}/${airtableConfig.tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtablePayload)
    });

    return response.json();
  }

  // Slack Integration
  static async sendToSlack(projectData: ProjectData, slackWebhookUrl: string) {
    const slackMessage = {
      blocks: [
        {
          type: "header" as const,
          text: {
            type: "plain_text" as const,
            text: `🔍 Sifter Analysis: ${projectData.displayName}`,
            emoji: true
          }
        },
        {
          type: "section" as const,
          fields: [
            {
              type: "mrkdwn" as const,
              text: `*Risk Score:*\n${projectData.overallRisk.score}/100`
            },
            {
              type: "mrkdwn" as const,
              text: `*Verdict:*\n${projectData.overallRisk.verdict.toUpperCase()}`
            }
          ]
        },
        {
          type: "section" as const,
          text: {
            type: "mrkdwn" as const,
            text: `*Summary:*\n${projectData.overallRisk.summary}`
          }
        },
        {
          type: "actions" as const,
          elements: [
            {
              type: "button" as const,
              text: {
                type: "plain_text" as const,
                text: "View Full Report",
                emoji: true
              },
              url: this.generateReportURL(projectData)
            }
          ]
        }
      ]
    };

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    return response.ok;
  }

  // Microsoft Teams Integration
  static async sendToTeams(projectData: ProjectData, teamsWebhookUrl: string) {
    const teamsMessage = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": this.getThemeColor(projectData.overallRisk.score),
      "summary": `Sifter Analysis: ${projectData.displayName}`,
      "sections": [{
        "activityTitle": `🔍 ${projectData.displayName}`,
        "activitySubtitle": `Risk Score: ${projectData.overallRisk.score}/100`,
        "facts": [
          { "name": "Verdict", "value": projectData.overallRisk.verdict.toUpperCase() },
          { "name": "Confidence", "value": `${projectData.overallRisk.confidence}%` },
          { "name": "Processing Time", "value": `${(projectData.processingTime / 1000).toFixed(1)}s` }
        ],
        "text": projectData.overallRisk.summary
      }],
      "potentialAction": [{
        "@type": "OpenUri",
        "name": "View Full Report",
        "targets": [{ "os": "default", "uri": this.generateReportURL(projectData) }]
      }]
    };

    const response = await fetch(teamsWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamsMessage)
    });

    return response.ok;
  }

  // Zapier/Make.com Integration
  static generateWebhookPayload(projectData: ProjectData, format: 'zapier' | 'make' | 'n8n') {
    const basePayload = {
      project: projectData.displayName,
      riskScore: projectData.overallRisk.score,
      verdict: projectData.overallRisk.verdict,
      scannedAt: projectData.scannedAt,
      metrics: projectData.metrics
    };

    switch (format) {
      case 'zapier':
        return { data: basePayload };
      case 'make':
        return { bundle: basePayload };
      case 'n8n':
        return { json: basePayload };
      default:
        return basePayload;
    }
  }

  // Helper methods
  private static generateReportURL(projectData: ProjectData): string {
    // Handle both browser and Node.js environments
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.REACT_APP_API_URL || 'https://app.sifter.com';
    
    return `${baseUrl}/report/${encodeURIComponent(projectData.displayName)}`;
  }

  private static extractKeyFindings(projectData: ProjectData): string {
    const findings = Object.values(projectData.metrics)
      .flatMap((m: Metric) => m.flags)
      .map((f: RiskFlag) => f.description)
      .join('; ');
    
    return findings || 'No critical issues detected';
  }

  private static getThemeColor(riskScore: number): string {
    if (riskScore >= 80) return 'DC2626'; // Red
    if (riskScore >= 60) return 'EA580C'; // Orange
    if (riskScore >= 40) return 'CA8A04'; // Yellow
    if (riskScore >= 20) return '2563EB'; // Blue
    return '16A34A'; // Green
  }
}

// Export types for use in other files
export type { ProjectData, RiskAssessment, Metric, RiskFlag };