// /src/components/export/ExportButton.tsx
import { ProjectData } from '@/types';
import { ExportService } from '@/services/exportService';

interface ExportButtonProps {
  projectData: ProjectData;
  variant?: 'pdf' | 'json' | 'csv' | 'all';
  label?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  projectData,
  variant = 'pdf',
  label,
  className = ''
}) => {
  const getLabel = () => {
    if (label) return label;
    switch (variant) {
      case 'pdf': return '📄 Export PDF';
      case 'json': return '📊 Export JSON';
      case 'csv': return '📈 Export CSV';
      case 'all': return '📁 Export All';
      default: return 'Export';
    }
  };

  const handleExport = () => {
    switch (variant) {
      case 'pdf':
        ExportService.exportSimplePDF(projectData);
        break;
      case 'json':
        ExportService.exportProjectAnalysis(projectData);
        break;
      case 'csv':
        ExportService.exportMetricsToCSV(projectData.metrics, projectData.displayName);
        break;
      case 'all':
        ExportService.exportAllAnalyses([projectData]);
        break;
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${className} ${
        variant === 'pdf' 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : variant === 'json'
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : variant === 'csv'
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-gray-600 hover:bg-gray-700 text-white'
      }`}
    >
      {getLabel()}
    </button>
  );
};