// src/pages/api/disputes/index.ts - Mock API
import { NextApiRequest, NextApiResponse } from 'next';

const mockDisputes = [
  {
    id: '1',
    caseId: 'DISP-2024-001',
    entityName: 'CryptoScam Inc',
    status: 'resolved_accepted',
    filedAt: '2024-01-15',
    resolvedAt: '2024-01-25'
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(mockDisputes);
  }
  
  if (req.method === 'POST') {
    // Simulate creating a dispute
    const newDispute = {
      id: `dispute-${Date.now()}`,
      caseId: `DISP-${new Date().getFullYear()}-${String(mockDisputes.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'pending',
      filedAt: new Date().toISOString()
    };
    mockDisputes.push(newDispute);
    return res.status(201).json(newDispute);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}