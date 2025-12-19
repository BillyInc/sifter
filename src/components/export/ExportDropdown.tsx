// /src/components/export/ExportDropdown.tsx
import { ProjectData } from '@/types';
import { ExportService } from '@/services/exportService';
import { useState } from 'react';

interface ExportDropdownProps {
  projectData: ProjectData;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({ projectData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    { 
      label: '📄 PDF Report', 
      onClick: () => ExportService.exportSimplePDF(projectData),
      description: 'Professional formatted report'
    },
    { 
      label: '📊 JSON Data', 
      onClick: () => ExportService.exportProjectAnalysis(projectData),
      description: 'Full analysis data'
    },
    { 
      label: '📈 CSV Metrics', 
      onClick: () => ExportService.exportMetricsToCSV(projectData.metrics, projectData.displayName),
      description: 'Spreadsheet-ready metrics'
    },
    { 
      label: '🔄 Share Analysis', 
      onClick: async () => {
        const shared = await ExportService.shareAnalysis(projectData);
        if (shared) {
          alert('Analysis copied to clipboard!');
        }
      },
      description: 'Copy link to clipboard'
    }
  ];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Report
        <svg className={`ml-2 w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="py-1">
            {exportOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start space-x-3 group"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
