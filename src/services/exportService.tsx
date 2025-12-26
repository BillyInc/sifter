// /src/services/exportService.ts
import { ProjectData, MetricData, BatchSummary, BatchProject, VerdictData, PartnerPacket, VerdictType, RiskTier } from '@/types';
import React from 'react';

export class ExportService {
  // ============= CSV EXPORT =============
  static exportMetricsToCSV(metrics: MetricData[], projectName: string): void {
    const rows = metrics.map(metric => ({
      Metric: this.formatMetricName(metric.key),
      Name: metric.name,
      Score: typeof metric.value === 'number' ? metric.value : 0,
      Status: metric.status.toUpperCase(),
      Confidence: `${metric.confidence}%`,
      Weight: `${metric.weight}%`,
      Contribution: `${metric.contribution}%`,
      Flags: metric.flags?.join('; ') || 'None',
      Evidence: metric.evidence?.join('; ') || 'N/A'
    }));

    this.exportToCSV(rows, `${this.sanitizeFilename(projectName)}_metrics.csv`);
  }

  static exportBatchToCSV(projects: BatchProject[]): void {
    const rows = projects.map(project => ({
      Project: project.name,
      'Risk Score': project.riskScore || 0,
      Verdict: project.verdict ? project.verdict.toUpperCase() : 'UNKNOWN',
      'Top Red Flag': project.redFlags?.[0] || 'None',
      'Flag Count': project.redFlags?.length || 0,
      Status: project.status.toUpperCase(),
      'Processing Time': project.processingTime ? `${project.processingTime}ms` : 'N/A',
      'Scanned At': project.scannedAt?.toISOString() || 'Not scanned',
      Recommendation: project.riskScore ? this.getRecommendationFromScore(project.riskScore) : 'Incomplete'
    }));

    this.exportToCSV(rows, `batch_analysis_${new Date().toISOString().split('T')[0]}.csv`);
  }

  // ============= JSON EXPORT =============
  static exportProjectAnalysis(projectData: ProjectData): void {
    const exportData = {
      metadata: {
        projectName: projectData.displayName,
        canonicalName: projectData.canonicalName,
        scannedAt: projectData.scannedAt.toISOString(),
        analyzedAt: projectData.analyzedAt || new Date().toISOString(),
        riskScore: projectData.overallRisk.score,
        verdict: projectData.overallRisk.verdict,
        riskTier: projectData.overallRisk.tier,
        confidence: projectData.overallRisk.confidence,
        processingTime: projectData.processingTime
      },
      overallRisk: projectData.overallRisk,
      metrics: projectData.metrics,
      sources: projectData.sources,
      recommendations: projectData.recommendations || [],
      generatedAt: new Date().toISOString(),
      version: 'Sifter 1.0'
    };

    this.exportToJSON(exportData, `${this.sanitizeFilename(projectData.displayName)}_analysis.json`);
  }

  // ============= PDF EXPORT METHODS =============
  static exportToPDF(projectData: ProjectData, filename?: string): void {
    const reportContent = this.generateStyledPDFContent(projectData);
    const finalFilename = filename || `${this.sanitizeFilename(projectData.displayName)}_report.html`;
    this.downloadFile(reportContent, finalFilename, 'text/html');
  }

  static exportSimplePDF(projectData: ProjectData): void {
    return this.exportToPDF(projectData);
  }

  static exportTextToPDF(content: string, filename: string = 'sifter_report.html'): void {
    try {
      const htmlContent = this.generateSimplePDFContent(content);
      this.downloadFile(htmlContent, filename, 'text/html');
    } catch (error) {
      console.error('PDF export failed:', error);
      this.downloadFile(content, filename.replace('.html', '.txt'), 'text/plain');
    }
  }

  static exportToPDFComponent(projectData: ProjectData): React.ReactElement {
    return (
      <button 
        onClick={() => this.exportToPDF(projectData)}
        style={{
          textDecoration: 'none',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>📄</span>
        <span>Download PDF Report</span>
      </button>
    );
  }

  static async exportToPDFBlob(projectData: ProjectData): Promise<Blob> {
    try {
      const htmlContent = this.generateStyledPDFContent(projectData);
      return new Blob([htmlContent], { type: 'text/html' });
    } catch (error) {
      console.error('PDF Blob generation failed:', error);
      const textContent = this.generateResearchReport(projectData);
      return new Blob([textContent], { type: 'text/plain' });
    }
  }

  static exportResearchReport(projectData: ProjectData): void {
    const reportContent = this.generateResearchReport(projectData);
    this.exportTextToPDF(reportContent, `${this.sanitizeFilename(projectData.displayName)}_research_report.html`);
  }

  // ============= BULK EXPORT =============
  static exportAllAnalyses(projects: ProjectData[]): void {
    if (!projects || projects.length === 0) {
      console.error('No projects to export');
      return;
    }

    // Export summary CSV
    const summaryRows = projects.map(project => ({
      Project: project.displayName,
      'Canonical Name': project.canonicalName,
      'Risk Score': project.overallRisk.score,
      Verdict: project.overallRisk.verdict.toUpperCase(),
      'Risk Tier': project.overallRisk.tier,
      Confidence: `${project.overallRisk.confidence}%`,
      'Processing Time': `${project.processingTime}ms`,
      'Scanned At': project.scannedAt.toISOString(),
      'Sources': project.sources?.length || 0
    }));

    this.exportToCSV(summaryRows, `all_analyses_summary_${new Date().toISOString().split('T')[0]}.csv`);

    // Export combined JSON
    const combinedData = {
      metadata: {
        totalProjects: projects.length,
        averageRiskScore: Math.round(projects.reduce((sum, p) => sum + p.overallRisk.score, 0) / projects.length),
        passed: projects.filter(p => p.overallRisk.verdict === 'pass').length,
        flagged: projects.filter(p => p.overallRisk.verdict === 'flag').length,
        rejected: projects.filter(p => p.overallRisk.verdict === 'reject').length,
        generatedAt: new Date().toISOString(),
        version: 'Sifter 1.0'
      },
      projects: projects.map(p => ({
        name: p.displayName,
        canonicalName: p.canonicalName,
        riskScore: p.overallRisk.score,
        verdict: p.overallRisk.verdict,
        riskTier: p.overallRisk.tier,
        confidence: p.overallRisk.confidence,
        sources: p.sources,
        metrics: p.metrics.map(m => ({
          key: m.key,
          name: m.name,
          score: typeof m.value === 'number' ? m.value : 0,
          status: m.status
        }))
      }))
    };

    this.exportToJSON(combinedData, `all_analyses_combined_${new Date().toISOString().split('T')[0]}.json`);
  }

  // ============= PARTNER PACKET =============
  static generatePartnerPacket(batchSummary: BatchSummary, selectedProjects: BatchProject[]): PartnerPacket {
    const projects = selectedProjects.map(p => ({
      name: p.name,
      riskScore: p.riskScore || 0,
      verdict: p.verdict || 'unknown',
      redFlags: p.redFlags || [],
      processingTime: p.processingTime || 0,
      scannedAt: p.scannedAt || new Date()
    }));

    return {
      summary: {
        total: batchSummary.total,
        passed: batchSummary.passed,
        flagged: batchSummary.flagged,
        rejected: batchSummary.rejected,
        averageRiskScore: batchSummary.averageRiskScore,
        processingTime: batchSummary.processingTime,
        generatedAt: new Date().toISOString(),
        redFlagDistribution: batchSummary.redFlagDistribution || {}
      },
      projects
    };
  }

  static exportPartnerPacket(packet: PartnerPacket, filename: string = 'partner_packet.json'): void {
    this.exportToJSON(packet, filename);
  }

  // ============= WORKFLOW INTEGRATION =============
  static async sendToWebhook(webhookUrl: string, data: ProjectData | PartnerPacket, integrationType?: 'slack' | 'teams' | 'generic'): Promise<boolean> {
    try {
      let payload = data;
      
      if (integrationType === 'slack') {
        payload = this.formatForSlack(data);
      } else if (integrationType === 'teams') {
        payload = this.formatForTeams(data);
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook error:', error);
      return false;
    }
  }

  // ============= CONTENT GENERATION =============
  private static generateStyledPDFContent(projectData: ProjectData): string {
    const metricsHtml = projectData.metrics.map(metric => 
      `<div class="metric-card">
        <div class="metric-header">
          <div class="metric-name">${metric.name}</div>
          <div class="score-badge score-${this.getScoreCategory(typeof metric.value === 'number' ? metric.value : 0)}">
            ${typeof metric.value === 'number' ? metric.value : 0}/100
          </div>
        </div>
        <div class="metric-description">
          Status: <strong>${metric.status.toUpperCase()}</strong><br>
          Confidence: ${metric.confidence}%<br>
          Weight: ${metric.weight}%
        </div>
        ${metric.flags?.length ? `
          <div class="flags-list">
            ${metric.flags.map((flag: string) => 
              `<div class="flag-item">${flag}</div>`
            ).join('')}
          </div>
        ` : ''}
       ${metric.evidence?.length ? `
  <div class="evidence-list">
    <strong>📋 Detailed Evidence:</strong>
    ${metric.evidence.map((evidence: string) => {
      // Convert markdown to HTML
      const formattedEvidence = evidence
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          
          // Main section headers (ending with colon)
          if (trimmed.endsWith(':') && !trimmed.startsWith('-') && !trimmed.startsWith('•')) {
            return `<div style="font-weight: 700; margin-top: 16px; margin-bottom: 8px; color: #1a237e; font-size: 15px;">${trimmed}</div>`;
          }
          
          // Bullet points starting with -
          if (trimmed.startsWith('- ')) {
            return `<div style="margin-left: 20px; margin-bottom: 4px;">• ${trimmed.substring(2)}</div>`;
          }
          
          // Bullet points starting with •
          if (trimmed.startsWith('• ')) {
            return `<div style="margin-left: 20px; margin-bottom: 4px;">${trimmed}</div>`;
          }
          
          // Sub-bullets (indented)
          if (trimmed.startsWith('  - ') || trimmed.startsWith('    •')) {
            return `<div style="margin-left: 40px; margin-bottom: 4px; font-size: 13px; color: #555;">○ ${trimmed.trim().substring(2)}</div>`;
          }
          
          // Code blocks
          if (trimmed.startsWith('```')) {
            return ''; // Skip code fence markers
          }
          
          // Regular text
          if (trimmed) {
            return `<div style="margin: 6px 0; line-height: 1.6;">${trimmed}</div>`;
          }
          
          return '<br>';
        })
        .join('');
      
      return `<div class="evidence-item">${formattedEvidence}</div>`;
    }).join('')}
  </div>
` : ''}
      </div>`
    ).join('');

    const riskColor = this.getRiskColor(projectData.overallRisk.score);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>SIFTER Research Report - ${projectData.displayName}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1a237e, #4a148c);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .title {
            font-size: 36px;
            font-weight: 700;
            margin: 0 0 10px 0;
            letter-spacing: 1px;
        }
        
        .subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin: 0;
        }
        
        .content {
            padding: 40px;
        }
        
        .project-header {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        
        .project-name {
            font-size: 32px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1a237e;
        }
        
        .canonical-name {
            font-size: 16px;
            color: #666;
            margin: 0 0 20px 0;
            font-family: monospace;
        }
        
        .project-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .meta-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            border: 2px solid #e9ecef;
        }
        
        .meta-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .meta-value {
            font-size: 24px;
            font-weight: 700;
            color: #1a237e;
        }
        
        .risk-score {
            color: ${riskColor};
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #1a237e;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        }
        
        .sources-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .source-tag {
            background: #e3f2fd;
            color: #1a237e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .metric-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border: 2px solid #e9ecef;
            transition: transform 0.2s;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
        }
        
        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .metric-name {
            font-size: 18px;
            font-weight: 600;
            color: #1a237e;
        }
        
        .score-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
        }
        
        .score-high {
            background: #ffebee;
            color: #c62828;
        }
        
        .score-medium {
            background: #fff3e0;
            color: #ef6c00;
        }
        
        .score-low {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .metric-description {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .flags-list {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
        }
        
        .flag-item {
            background: #ffebee;
            color: #c62828;
            padding: 6px 12px;
            border-radius: 6px;
            margin-bottom: 5px;
            font-size: 13px;
        }
        
        .evidence-list {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
        }
        
        .evidence-item {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
            line-height: 1.4;
        }.evidence-list {
    margin-top: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #1a237e;
}

.evidence-item {
    font-size: 13px;
    color: #333;
    line-height: 1.7;
}

.evidence-item strong {
    color: #1a237e;
    font-weight: 600;
}

.evidence-item em {
    font-style: italic;
    color: #555;
}
        
        .recommendations-list {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
        }
        
        .recommendation-item {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .recommendation-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .rec-number {
            font-weight: 700;
            color: #1a237e;
            margin-right: 10px;
            min-width: 24px;
        }
        
        .rec-text {
            color: #333;
            line-height: 1.6;
        }
        
        .summary-section {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
            padding: 30px;
            border: 2px solid #dee2e6;
        }
        
        .summary-title {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #1a237e;
        }
        
        .summary-content {
            font-size: 16px;
            line-height: 1.8;
            color: #333;
            margin: 0;
        }
        
        .footer {
            background: #1a237e;
            color: white;
            padding: 30px 40px;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 20px;
            font-weight: 700;
        }
        
        .generated-info {
            font-size: 14px;
            opacity: 0.9;
            text-align: right;
        }
        
        .print-button {
            background: white;
            color: #1a237e;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .print-button:hover {
            background: #f8f9fa;
            transform: translateY(-1px);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .report-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1 class="title">SIFTER RESEARCH REPORT</h1>
            <p class="subtitle">Deterministic Due Diligence Crypto Analysis Platform</p>
        </div>
        
        <div class="content">
            <div class="project-header">
                <h2 class="project-name">${projectData.displayName}</h2>
                <p class="canonical-name">Canonical: ${projectData.canonicalName}</p>
                <div class="project-meta">
                    <div class="meta-card">
                        <div class="meta-label">Risk Score</div>
                        <div class="meta-value risk-score">${projectData.overallRisk.score}/100</div>
                    </div>
                    <div class="meta-card">
                        <div class="meta-label">Verdict</div>
                        <div class="meta-value">${projectData.overallRisk.verdict.toUpperCase()}</div>
                    </div>
                    <div class="meta-card">
                        <div class="meta-label">Risk Tier</div>
                        <div class="meta-value">${projectData.overallRisk.tier}</div>
                    </div>
                    <div class="meta-card">
                        <div class="meta-label">Confidence</div>
                        <div class="meta-value">${projectData.overallRisk.confidence}%</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3 class="section-title">Data Sources</h3>
                <div class="sources-list">
                    ${projectData.sources?.map(source => 
  `<span class="source-tag">${typeof source === 'string' ? source : `${source.type || 'Unknown'}: ${source.username ? '@' + source.username : source.url || 'N/A'}`}</span>`
).join('') || 'No sources available'}
                </div>
            </div>
            
            <div class="section">
                <h3 class="section-title">Risk Analysis Metrics</h3>
                <div class="metrics-grid">
                    ${metricsHtml}
                </div>
            </div>
            
            ${projectData.recommendations?.length ? `
            <div class="section">
                <h3 class="section-title">Recommendations</h3>
                <div class="recommendations-list">
                    ${projectData.recommendations.map((rec: any, index: number) => 
                      `<div class="recommendation-item">
                        <span class="rec-number">${index + 1}.</span>
                        <span class="rec-text">${typeof rec === 'string' ? rec : rec.text || rec.description}</span>
                      </div>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <h3 class="section-title">Final Assessment</h3>
                <div class="summary-section">
                    <h4 class="summary-title">${this.getRecommendationFromScore(projectData.overallRisk.score)}</h4>
                    <p class="summary-content">
                        ${this.getDetailedRecommendation(projectData.overallRisk.score)}
                        ${this.generateDetailedAnalysis(projectData)}
                    </p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <div class="logo">
                    <span>🔬</span>
                    <span>SIFTER 1.0</span>
                </div>
                <div class="generated-info">
                    Generated on ${new Date().toLocaleString()}<br>
                    Analyzed at: ${projectData.analyzedAt || projectData.scannedAt.toLocaleString()}
                </div>
                <button class="print-button" onclick="window.print()">
                    🖨️ Print Report
                </button>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private static generateSimplePDFContent(textContent: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>SIFTER Research Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        
        .header {
            background: linear-gradient(135deg, #1a237e, #4a148c);
            color: white;
            padding: 40px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 12px;
        }
        
        .title {
            font-size: 36px;
            font-weight: 700;
            margin: 0 0 10px 0;
            letter-spacing: 1px;
        }
        
        .subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin: 0;
        }
        
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            min-height: 500px;
        }
        
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', Courier, monospace;
            line-height: 1.6;
            margin: 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .header, .content {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">SIFTER RESEARCH REPORT</div>
        <div class="subtitle">Deterministic Due Diligence Crypto Analysis Platform</div>
    </div>
    <div class="content">
        <pre>${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
    <div class="footer">
        Generated by Sifter 1.0 • ${new Date().toLocaleString()} • https://sifter.app
    </div>
</body>
</html>`;
  }

  private static generateResearchReport(projectData: ProjectData): string {
    const metrics = projectData.metrics
      .map(metric => {
        return `${metric.name}: ${typeof metric.value === 'number' ? metric.value : 0}/100 (${metric.status.toUpperCase()})`;
      })
      .join('\n');

    return `
PROJECT: ${projectData.displayName}
CANONICAL: ${projectData.canonicalName}
ANALYSIS DATE: ${projectData.scannedAt.toLocaleDateString()}
RISK SCORE: ${projectData.overallRisk.score}/100
VERDICT: ${projectData.overallRisk.verdict.toUpperCase()}
RISK TIER: ${projectData.overallRisk.tier}
CONFIDENCE: ${projectData.overallRisk.confidence}%

SOURCES
-------
${projectData.sources?.join('\n') || 'No sources'}

METRIC BREAKDOWN
----------------
${metrics}

RECOMMENDATIONS
---------------
${projectData.recommendations?.map((rec: any, i: number) => 
  `${i + 1}. ${typeof rec === 'string' ? rec : rec.text || rec.description}`
).join('\n') || 'No specific recommendations'}

DETAILED ANALYSIS
-----------------
${this.generateDetailedAnalysis(projectData)}

FINAL ASSESSMENT
----------------
${this.getRecommendationFromScore(projectData.overallRisk.score)}

GENERATED: ${new Date().toLocaleString()}
ANALYZED: ${projectData.analyzedAt || projectData.scannedAt.toLocaleString()}
VERSION: Sifter 1.0 Research Edition
`;
  }

  private static generateDetailedAnalysis(projectData: ProjectData): string {
    let analysis = '';
    
    const criticalMetrics = projectData.metrics
      .filter(metric => typeof metric.value === 'number' && metric.value >= 80)
      .map(metric => metric.name);
    
    if (criticalMetrics.length > 0) {
      analysis += `CRITICAL RISKS DETECTED:\n• ${criticalMetrics.join('\n• ')}\n\n`;
    }

    const highFlags = projectData.metrics
      .filter(metric => metric.flags && metric.flags.length > 0)
      .flatMap(metric => metric.flags || []);
    
    if (highFlags.length > 0) {
      analysis += `KEY FLAGS:\n• ${highFlags.slice(0, 5).join('\n• ')}\n\n`;
    }

    return analysis;
  }

  private static formatForSlack(data: ProjectData | PartnerPacket): any {
    if ('projects' in data) {
      // PartnerPacket format
      const packet = data as PartnerPacket;
      return {
        attachments: [{
          color: '#007bff',
          title: `📊 Sifter Batch Analysis Report`,
          fields: [
            {
              title: 'Total Projects',
              value: packet.summary.total.toString(),
              short: true
            },
            {
              title: 'Passed',
              value: packet.summary.passed.toString(),
              short: true
            },
            {
              title: 'Flagged',
              value: packet.summary.flagged.toString(),
              short: true
            },
            {
              title: 'Rejected',
              value: packet.summary.rejected.toString(),
              short: true
            },
            {
              title: 'Avg Risk Score',
              value: packet.summary.averageRiskScore.toFixed(1),
              short: true
            }
          ],
          footer: 'Sifter 1.0 • Batch Analysis',
          ts: Math.floor(Date.now() / 1000)
        }]
      };
    } else {
      // ProjectData format
      const projectData = data as ProjectData;
      const riskColor = this.getRiskColorForSlack(projectData.overallRisk.score);
      
      return {
        attachments: [{
          color: riskColor,
          title: `🔬 Sifter Analysis: ${projectData.displayName}`,
          fields: [
            {
              title: 'Risk Score',
              value: `${projectData.overallRisk.score}/100`,
              short: true
            },
            {
              title: 'Verdict',
              value: projectData.overallRisk.verdict.toUpperCase(),
              short: true
            },
            {
              title: 'Risk Tier',
              value: projectData.overallRisk.tier,
              short: true
            },
            {
              title: 'Confidence',
              value: `${projectData.overallRisk.confidence}%`,
              short: true
            }
          ],
          footer: 'Sifter 1.0',
          ts: Math.floor(projectData.scannedAt.getTime() / 1000)
        }]
      };
    }
  }

  private static formatForTeams(data: ProjectData | PartnerPacket): any {
    // Similar logic to formatForSlack but for Microsoft Teams format
    if ('projects' in data) {
      const packet = data as PartnerPacket;
      return {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "Sifter Batch Analysis Report",
        "sections": [{
          "activityTitle": "📊 Sifter Batch Analysis Report",
          "activitySubtitle": `${packet.summary.total} projects analyzed`,
          "facts": [
            {
              "name": "Passed",
              "value": packet.summary.passed.toString()
            },
            {
              "name": "Flagged",
              "value": packet.summary.flagged.toString()
            },
            {
              "name": "Rejected",
              "value": packet.summary.rejected.toString()
            },
            {
              "name": "Average Risk",
              "value": packet.summary.averageRiskScore.toFixed(1).toString()
            }
          ],
          "text": `Analysis completed at ${packet.summary.generatedAt}`
        }]
      };
    } else {
      const projectData = data as ProjectData;
      return {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": this.getRiskColor(projectData.overallRisk.score).replace('#', ''),
        "summary": `Sifter Analysis: ${projectData.displayName}`,
        "sections": [{
          "activityTitle": `🔬 Sifter Analysis: ${projectData.displayName}`,
          "activitySubtitle": `Risk Score: ${projectData.overallRisk.score}/100`,
          "facts": [
            {
              "name": "Verdict",
              "value": projectData.overallRisk.verdict.toUpperCase()
            },
            {
              "name": "Risk Tier",
              "value": projectData.overallRisk.tier
            },
            {
              "name": "Confidence",
              "value": `${projectData.overallRisk.confidence}%`
            }
          ],
          // FIXED: Removed reference to overallRisk.summary which doesn't exist
          "text": this.generateRiskSummary(projectData.overallRisk) || 'Analysis complete'
        }]
      };
    }
  }

  // ============= HELPER METHODS =============
  private static exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          // Handle special characters and newlines
          if (value == null) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(','))
      ];

      const csvContent = csvRows.join('\n');
      this.downloadFile(csvContent, filename, 'text/csv');
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  }

  private static exportToJSON(data: any, filename: string): void {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      this.downloadFile(jsonContent, filename, 'application/json');
    } catch (error) {
      console.error('JSON export failed:', error);
    }
  }

  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private static formatMetricName(metricKey: string): string {
    const names: Record<string, string> = {
      teamIdentity: 'Team Identity',
      teamCompetence: 'Team Competence',
      contaminatedNetwork: 'Contaminated Network',
      mercenaryKeywords: 'Mercenary Keywords',
      messageTimeEntropy: 'Message Time Entropy',
      accountAgeEntropy: 'Account Age Entropy',
      tweetFocus: 'Tweet Focus',
      githubAuthenticity: 'GitHub Authenticity',
      busFactor: 'Bus Factor',
      artificialHype: 'Artificial Hype',
      founderDistraction: 'Founder Distraction',
      engagementAuthenticity: 'Engagement Authenticity',
      tokenomics: 'Tokenomics'
    };
    
    return names[metricKey] || metricKey.replace(/([A-Z])/g, ' $1').trim();
  }

  private static getRiskColor(score: number): string {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#3b82f6';
    if (score >= 20) return '#10b981';
    return '#059669';
  }

  private static getRiskColorForSlack(score: number): string {
    if (score >= 80) return '#ff0000';
    if (score >= 60) return '#ff9900';
    if (score >= 40) return '#ffff00';
    return '#00ff00';
  }

  private static getScoreCategory(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  private static getRecommendationFromScore(score: number): string {
    if (score >= 80) return '🚫 DO NOT INVEST - High probability of scam';
    if (score >= 60) return '⚠️ HIGH RISK - Extreme caution advised';
    if (score >= 40) return '🔍 MODERATE RISK - Additional research needed';
    if (score >= 20) return '✅ LOW RISK - Standard due diligence';
    return '🌟 VERY LOW RISK - Appears legitimate';
  }

  private static getDetailedRecommendation(score: number): string {
    if (score >= 80) {
      return 'This project shows multiple critical red flags indicating a high probability of fraudulent activity. Strongly recommended to avoid any interaction or investment.';
    }
    if (score >= 60) {
      return 'Significant risks detected requiring thorough investigation. Proceed with extreme caution and conduct additional due diligence before considering any engagement.';
    }
    if (score >= 40) {
      return 'Moderate risk profile detected. Additional research and verification recommended before making any investment decisions.';
    }
    if (score >= 20) {
      return 'Low risk detected. Standard due diligence procedures should be sufficient for evaluation.';
    }
    return 'Minimal risk detected. Project appears legitimate based on current analysis.';
  }

  // NEW HELPER METHOD: Generate risk summary
  private static generateRiskSummary(overallRisk: { 
    score: number; 
    verdict: VerdictType; 
    tier: RiskTier; 
    confidence: number 
  }): string {
    const verdictText = overallRisk.verdict === 'pass' ? '✅ PASS' : 
                       overallRisk.verdict === 'flag' ? '⚠️ FLAG' : '❌ REJECT';
    
    return `${verdictText}
Risk Score: ${overallRisk.score}/100 (${overallRisk.tier})
Confidence: ${overallRisk.confidence}%`;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback method
      const link = document.createElement('a');
      link.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
      link.download = filename;
      link.click();
    }
  }

  // ============= SHARE FUNCTIONALITY =============
  static async shareAnalysis(projectData: ProjectData, platform?: 'twitter' | 'linkedin' | 'clipboard'): Promise<boolean> {
    const shareText = `Sifter Analysis: ${projectData.displayName}\nRisk Score: ${projectData.overallRisk.score}/100 (${projectData.overallRisk.verdict.toUpperCase()})\n${projectData.overallRisk.tier} Risk`;
    const shareUrl = window.location.href;

    try {
      switch (platform) {
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          window.open(twitterUrl, '_blank', 'noopener,noreferrer');
          return true;
          
        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
          return true;
          
        case 'clipboard':
        default:
          try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            return true;
          } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = `${shareText}\n\n${shareUrl}`;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
          }
      }
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }
}
