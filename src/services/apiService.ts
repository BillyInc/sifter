// /services/apiService.ts

// Type definitions
export interface ProjectData {
  id: string;
  name: string;
  riskScore: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  timestamp: string;
  entities: Array<{
    name: string;
    type: 'person' | 'company' | 'address' | 'wallet' | 'other';
    riskScore: number;
    association: string;
  }>;
  summary: string;
  recommendations: string[];
}

export interface BatchSummary {
  batchId: string;
  totalProjects: number;
  completed: number;
  averageRiskScore: number;
  highRiskProjects: string[];
  results: Array<{
    input: string;
    result?: ProjectData;
    error?: string;
  }>;
}

export interface ScamPattern {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
  detectionMethods: string[];
  keywords: string[];
}

export interface FlaggedEntity {
  name: string;
  type: 'person' | 'company' | 'wallet' | 'domain';
  riskScore: number;
  firstSeen: string;
  lastSeen: string;
  associations: string[];
  incidents: Array<{
    projectId: string;
    timestamp: string;
    riskScore: number;
    description: string;
  }>;
}

// Mock data generator
const generateMockProjectData = (input: string): ProjectData => {
  const riskScore = Math.floor(Math.random() * 100);
  
  const riskLevels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const riskLevel = riskScore < 30 ? 'low' : 
                    riskScore < 60 ? 'medium' : 
                    riskScore < 85 ? 'high' : 'critical';

  return {
    id: `proj_${Date.now()}`,
    name: input,
    riskScore,
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
    riskLevel,
    flags: ['Unverified team', 'Anonymous wallet', 'Copycat name'],
    timestamp: new Date().toISOString(),
    entities: [
      {
        name: 'Example Entity',
        type: 'company',
        riskScore: Math.floor(Math.random() * 100),
        association: 'Team member'
      }
    ],
    summary: `Analysis of "${input}" reveals several risk factors including unverified team members and anonymous funding sources.`,
    recommendations: [
      'Conduct thorough due diligence on team members',
      'Verify wallet ownership',
      'Check for similar project names'
    ]
  };
};

// Mock alert function
const sendRiskAlert = async (payload: any): Promise<void> => {
  console.log('Risk alert triggered:', payload);
  // In production, this would send email/SMS/slack notification
};

export class APIService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sifter.com/v1';

  // Public endpoints (no auth required for demo)
  static async analyzeProject(input: string): Promise<ProjectData> {
    const response = await fetch(`${this.baseURL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  }

  static async batchAnalyze(inputs: string[]): Promise<BatchSummary> {
    const response = await fetch(`${this.baseURL}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects: inputs })
    });
    
    if (!response.ok) throw new Error('Batch analysis failed');
    return response.json();
  }

  static async getPatterns(): Promise<ScamPattern[]> {
    const response = await fetch(`${this.baseURL}/patterns`);
    return response.json();
  }

  static async getEntityHistory(entityName: string): Promise<FlaggedEntity> {
    const response = await fetch(`${this.baseURL}/entities/${encodeURIComponent(entityName)}`);
    return response.json();
  }

  // Webhook integration
  static async registerWebhook(webhookUrl: string, events: string[]): Promise<{ id: string }> {
    const response = await fetch(`${this.baseURL}/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, events })
    });
    
    return response.json();
  }

  // Real-time monitoring
  static async subscribeToProject(projectId: string, callback: (update: any) => void) {
    // WebSocket implementation for real-time updates
    const wsUrl = this.baseURL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/subscribe/${projectId}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }

  // Utility method for mock data (for development/demo)
  static async analyzeProjectMock(input: string): Promise<ProjectData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return generateMockProjectData(input);
  }

  static async batchAnalyzeMock(inputs: string[]): Promise<BatchSummary> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = await Promise.allSettled(
      inputs.map(async (input) => {
        try {
          const result = await this.analyzeProjectMock(input);
          return { input, result };
        } catch (error) {
          return { input, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const completedResults = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<{
      input: string;
      result?: ProjectData;
      error?: string;
    }>[];

    const highRiskProjects = completedResults
      .filter(r => r.value.result?.riskLevel === 'high' || r.value.result?.riskLevel === 'critical')
      .map(r => r.value.input);

    const riskScores = completedResults
      .filter(r => r.value.result?.riskScore)
      .map(r => r.value.result!.riskScore);

    const averageRiskScore = riskScores.length > 0 
      ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length 
      : 0;

    return {
      batchId: `batch_${Date.now()}`,
      totalProjects: inputs.length,
      completed: completedResults.length,
      averageRiskScore,
      highRiskProjects,
      results: completedResults.map(r => r.value)
    };
  }
}
