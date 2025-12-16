// /services/pdfGenerator.tsx
'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { ProjectData, MetricData } from '@/types';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, color: '#2563eb' },
  section: { marginBottom: 20 },
  metricRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8 
  },
  metricName: { width: '40%', fontSize: 10 },
  metricScore: { width: '20%', fontSize: 10 },
  metricStatus: { width: '20%', fontSize: 10 },
  metricWeight: { width: '20%', fontSize: 10 },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8
  }
});

export const generatePDFDocument = (projectData: ProjectData) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.section}>
        <Text style={styles.header}>SIFTER 1.2 ANALYSIS REPORT</Text>
        <Text style={{ fontSize: 14, marginBottom: 5 }}>
          Project: {projectData.displayName}
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>
          Scanned: {projectData.scannedAt.toLocaleDateString()} | 
          Processing Time: {(projectData.processingTime / 1000).toFixed(1)}s
        </Text>
      </View>

      {/* Executive Summary */}
      <View style={[styles.section, { backgroundColor: '#f3f4f6', padding: 15 }]}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          EXECUTIVE SUMMARY
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: 12 }}>Overall Risk Score</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: getRiskColor(projectData.overallRisk.score) }}>
              {projectData.overallRisk.score}/100
            </Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: 12 }}>Recommendation</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 5 }}>
              {getRecommendation(projectData.overallRisk.score)}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 10, color: '#374151' }}>
          Risk Tier: {projectData.overallRisk.tier} | 
          Verdict: {projectData.overallRisk.verdict.toUpperCase()} | 
          Confidence: {projectData.overallRisk.confidence}%
        </Text>
      </View>

      {/* Metrics Table */}
      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          13-METRIC BREAKDOWN
        </Text>
        
        {/* Table Header */}
        <View style={[styles.metricRow, { backgroundColor: '#f9fafb' }]}>
          <Text style={[styles.metricName, { fontWeight: 'bold' }]}>Metric</Text>
          <Text style={[styles.metricScore, { fontWeight: 'bold' }]}>Score</Text>
          <Text style={[styles.metricStatus, { fontWeight: 'bold' }]}>Status</Text>
          <Text style={[styles.metricWeight, { fontWeight: 'bold' }]}>Weight</Text>
        </View>

        {/* Metric Rows - Fixed: iterate over array, not object entries */}
        {projectData.metrics.map((metric: MetricData, index: number) => {
          // Convert metric value to number for display
          const scoreValue = typeof metric.value === 'number' ? metric.value : 
                            typeof metric.value === 'string' ? parseFloat(metric.value) || 0 : 0;
          
          return (
            <View key={metric.id || `metric-${index}`} style={styles.metricRow}>
              <Text style={styles.metricName}>
                {metric.name}
              </Text>
              <Text style={[styles.metricScore, { color: getRiskColor(scoreValue) }]}>
                {scoreValue}
              </Text>
              <View style={[styles.metricStatus, { 
                backgroundColor: getStatusColor(metric.status),
                ...styles.riskBadge 
              }]}>
                <Text style={{ color: '#fff', fontSize: 8 }}>
                  {metric.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.metricWeight}>
                {metric.weight}%
              </Text>
            </View>
          );
        })}
      </View>

      {/* Critical Findings */}
      {projectData.metrics.some(m => m.flags && m.flags.length > 0) && (
        <View style={styles.section}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            CRITICAL FINDINGS
          </Text>
          {projectData.metrics.map((metric: MetricData, metricIndex: number) => 
            metric.flags && metric.flags.map((flag: string, flagIndex: number) => (
              <View key={`${metric.id}-${flagIndex}`} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, color: '#dc2626' }}>
                  • {flag}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30 }}>
        <Text style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center' }}>
          Generated by Sifter 1.2 | For informational purposes only | Not financial advice
        </Text>
      </View>
    </Page>
  </Document>
);

// Helper functions
const getRiskColor = (score: number) => {
  if (score >= 80) return '#dc2626';
  if (score >= 60) return '#ea580c';
  if (score >= 40) return '#ca8a04';
  if (score >= 20) return '#2563eb';
  return '#16a34a';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'moderate': return '#ca8a04';
    case 'low': return '#16a34a';
    default: return '#6b7280';
  }
};

const getRecommendation = (score: number) => {
  if (score >= 80) return 'DO NOT INVEST';
  if (score >= 60) return 'EXTREME CAUTION';
  if (score >= 40) return 'PROCEED WITH CAUTION';
  if (score >= 20) return 'CONSIDER INVESTING';
  return 'STRONG CANDIDATE';
};