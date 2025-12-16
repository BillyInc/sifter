// /src/utils/metricUtils.ts
import { MetricData, VerdictResult, VerdictType } from '@/types';

export const ensureMetricScore = (metric: MetricData): MetricData => ({
  ...metric,
  score: metric.score || (typeof metric.value === 'number' ? metric.value : 0)
});

export const convertVerdictResult = (result: VerdictResult): VerdictType => {
  if (result === 'unknown') return 'flag';
  return result;
};

export const findMetricByKey = (metrics: MetricData[], key: string): MetricData | undefined => {
  return metrics.find(m => m.key === key || m.name.toLowerCase().includes(key.toLowerCase()));
};