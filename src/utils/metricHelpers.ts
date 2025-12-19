// src/utils/metricHelpers.ts
import { MetricData } from '@/types';

export const getMetricValue = (metrics: MetricData[], keyOrName: string): number => {
  if (!metrics || !Array.isArray(metrics)) return 0;
  
  const metric = metrics.find(m => 
    m.key === keyOrName || 
    (m.name && m.name.toLowerCase().includes(keyOrName.toLowerCase())) ||
    (keyOrName.toLowerCase().includes(m.name?.toLowerCase() || ''))
  );
  
  if (!metric) return 0;
  
  // Try to get numeric value from different possible properties
  if (typeof metric.value === 'number') return metric.value;
  if (typeof metric.score === 'number') return metric.score;
  if (typeof metric.scoreValue === 'number') return metric.scoreValue;
  if (typeof metric.contribution === 'number') return metric.contribution;
  
  // Try to convert string value to number
  if (typeof metric.value === 'string') {
    const parsed = parseFloat(metric.value);
    if (!isNaN(parsed)) return parsed;
  }
  
  return 0;
};

export const getMetric = (metrics: MetricData[], keyOrName: string): MetricData | undefined => {
  if (!metrics || !Array.isArray(metrics)) return undefined;
  
  return metrics.find(m => 
    m.key === keyOrName || 
    (m.name && m.name.toLowerCase().includes(keyOrName.toLowerCase())) ||
    (keyOrName.toLowerCase().includes(m.name?.toLowerCase() || ''))
  );
};
