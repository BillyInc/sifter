// components/BatchUpload.tsx - UPDATED WITH COMPACT PROP
'use client';

import React, { useCallback, useState } from 'react';
import { BatchProcessingJob } from '@/types';

interface BatchUploadProps {
  onUploadComplete: (job: BatchProcessingJob) => void;
  disabled?: boolean;
  compact?: boolean; // ADDED COMPACT PROP
}

export default function BatchUpload({ 
  onUploadComplete, 
  disabled,
  compact = false // ADDED WITH DEFAULT
}: BatchUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, compact ? 800 : 1500));

    // Generate mock batch job
    const mockJob = generateMockBatchJob(file.name);
    onUploadComplete(mockJob);
    
    setIsProcessing(false);
  };

  const generateMockBatchJob = (filename: string): BatchProcessingJob => {
    const projectCount = compact ? 25 : 100; // Smaller batch for compact mode
    const projects: any[] = [];
    
    const projectNames = [
      'MoonDoge Protocol', 'DeFi Alpha', 'TokenSwap Pro', 'ChainBridge', 'YieldFarm',
      'StakingDAO', 'Vault Protocol', 'ProtocolX V2', 'SwapDEX', 'LendingPro',
      'BridgeChain', 'DeXProtocol', 'GemToken', 'CryptoGrowth', 'AlphaFinance',
      'BetaProtocol', 'GammaSwap', 'DeltaFarm', 'EpsilonDAO', 'ZetaBridge'
    ];
    
    for (let i = 0; i < projectCount; i++) {
      const name = projectNames[Math.floor(Math.random() * projectNames.length)] + ` ${i + 1}`;
      const riskScore = Math.floor(Math.random() * 100);
      
      let result: 'pass' | 'flag' | 'reject' = 'reject';
      let topRedFlag = '';
      
      if (riskScore < 30) {
        result = 'pass';
        topRedFlag = 'Clean metrics';
      } else if (riskScore < 60) {
        result = 'flag';
        topRedFlag = 'Mixed signals';
      } else {
        result = 'reject';
        topRedFlag = riskScore > 80 ? 'Known rug agency' : 'Anonymous team';
      }
      
      projects.push({
        id: `project_${i}`,
        name,
        input: name.toLowerCase().replace(/\s+/g, '_'),
        status: 'complete' as const,
        riskScore,
        result,
        topRedFlag,
        processingTime: Math.floor(Math.random() * 60000) + 30000
      });
    }
    
    const passed = projects.filter(p => p.result === 'pass').length;
    const flagged = projects.filter(p => p.result === 'flag').length;
    const rejected = projects.filter(p => p.result === 'reject').length;
    
    return {
      id: `batch_${Date.now()}`,
      name: `Batch: ${filename}`,
      status: 'complete' as const,
      projects: projects as any,
      summary: {
        total: projectCount,
        passed,
        flagged,
        rejected,
        averageRiskScore: Math.round(projects.reduce((sum, p) => sum + (p.riskScore || 0), 0) / projectCount),
        processingTime: compact ? 45 : 148,
        redFlagDistribution: {
          'Known rug agency': Math.floor(rejected * 0.3),
          'Anonymous team': Math.floor(rejected * 0.25),
          'Bot activity': Math.floor(rejected * 0.2),
          'Short vesting': Math.floor(rejected * 0.15),
          'Other': Math.floor(rejected * 0.1)
        }
      },
      createdAt: new Date(),
      completedAt: new Date()
    };
  };

  return (
    <div className={`${compact ? 'bg-sifter-card border border-sifter-border rounded-xl p-4' : 'bg-sifter-card border border-sifter-border rounded-2xl p-8'}`}>
      {!compact && (
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Batch Upload</h2>
          <p className="text-gray-400">Upload a CSV with up to 100 projects for bulk analysis</p>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-xl text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          compact ? 'p-6' : 'p-12'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        {isProcessing ? (
          <div className={`space-y-${compact ? '2' : '4'}`}>
            <div className={`${compact ? 'w-10 h-10' : 'w-16 h-16'} border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto`}></div>
            <div>
              <p className={`${compact ? 'text-sm' : 'text-base'} text-white font-medium`}>
                Processing {fileName}
              </p>
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-400 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                {compact ? 'Analyzing projects...' : 'Analyzing 100 projects...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={`${compact ? 'text-3xl mb-3' : 'text-5xl mb-4'}`}>📦</div>
            <p className={`${compact ? 'text-sm' : 'text-base'} text-white font-medium ${compact ? 'mb-1' : 'mb-2'}`}>
              {fileName ? `Selected: ${fileName}` : 'Drop CSV file here'}
            </p>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-400 ${compact ? 'mb-4' : 'mb-6'}`}>
              {compact ? 'or click to browse' : 'or click to browse files (CSV format, max 100 projects)'}
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className={compact ? 'text-sm' : ''}>Choose File</span>
            </div>
          </>
        )}
        
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isProcessing}
        />
      </div>

      {/* Requirements - hide in compact mode */}
      {!compact && (
        <div className="mt-8 p-6 bg-gray-900/50 rounded-xl">
          <h4 className="font-medium text-white mb-3">CSV Requirements</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Maximum 100 projects per batch</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Include columns: <code className="bg-gray-800 px-1.5 py-0.5 rounded">name</code>, <code className="bg-gray-800 px-1.5 py-0.5 rounded">twitter</code>, <code className="bg-gray-800 px-1.5 py-0.5 rounded">website</code> (optional)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Processing time: ~2.5 hours for 100 projects</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Results include: Risk scores, Pass/Flag/Reject verdicts, Top red flags</span>
            </li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <a
              href="#"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                // Generate and download sample CSV
                const sampleData = [
                  ['name', 'twitter', 'website'],
                  ['MoonDoge Protocol', '@moondoge', 'https://moondoge.com'],
                  ['DeFi Alpha', '@defialpha', 'https://defialpha.fi'],
                  ['TokenSwap Pro', '@tokenswappro', 'https://tokenswap.pro']
                ];
                
                const csvContent = sampleData.map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sifter_batch_template.csv';
                a.click();
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV Template
            </a>
          </div>
        </div>
      )}

      {/* Quick actions - compact version */}
      {compact ? (
        <div className="mt-4 flex gap-3">
          <button
            disabled={disabled || isProcessing}
            className="flex-1 p-3 border border-sifter-border rounded-lg hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const mockJob = generateMockBatchJob('quick_test.csv');
              onUploadComplete(mockJob);
            }}
          >
            <div className="text-lg mb-1">🚀</div>
            <div className="text-xs text-white">Quick Test</div>
            <div className="text-xs text-gray-400">10 projects</div>
          </button>
          
          <button
            disabled={disabled || isProcessing}
            className="flex-1 p-3 border border-sifter-border rounded-lg hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const mockJob = generateMockBatchJob('sample.csv');
              onUploadComplete(mockJob);
            }}
          >
            <div className="text-lg mb-1">⚡</div>
            <div className="text-xs text-white">Sample</div>
            <div className="text-xs text-gray-400">25 projects</div>
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <button
            disabled={disabled || isProcessing}
            className="p-4 border border-sifter-border rounded-xl hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const mockJob = generateMockBatchJob('quick_test_10.csv');
              onUploadComplete(mockJob);
            }}
          >
            <div className="text-2xl mb-2">🚀</div>
            <div className="font-medium text-white">Quick Test</div>
            <div className="text-sm text-gray-400">10 projects (30s)</div>
          </button>
          
          <button
            disabled={disabled || isProcessing}
            className="p-4 border border-sifter-border rounded-xl hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const mockJob = generateMockBatchJob('medium_test_50.csv');
              onUploadComplete(mockJob);
            }}
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium text-white">Medium Batch</div>
            <div className="text-sm text-gray-400">50 projects (1.2h)</div>
          </button>
          
          <button
            disabled={disabled || isProcessing}
            className="p-4 border border-sifter-border rounded-xl hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const mockJob = generateMockBatchJob('full_batch_100.csv');
              onUploadComplete(mockJob);
            }}
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-medium text-white">Full Batch</div>
            <div className="text-sm text-gray-400">100 projects (2.5h)</div>
          </button>
        </div>
      )}
    </div>
  );
}
