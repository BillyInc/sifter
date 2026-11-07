// components/BatchResultsTable.tsx - ALIGNED WITH TYPES
'use client';

import React, { useState, useMemo } from 'react';
import { BatchProject, VerdictType, BatchProcessingJob } from '@/types';
import { createMetricsArray } from '@/utils/metricHelpers';

interface BatchResultsTableProps {
  projects: BatchProject[];
  onViewDetails: (project: BatchProject) => void;
  onExport: (type: 'csv' | 'pdf') => void;
  compact?: boolean;  //  ADD THIS LINE
}

// Use VerdictType from your types (excludes 'unknown')
type FilterType = 'all' | VerdictType;

type SortField = 'name' | 'riskScore' | 'processingTime';

export default function BatchResultsTable({ projects, onViewDetails, onExport }: BatchResultsTableProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<FilterType | null>(null);

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.redFlags && p.redFlags.some(flag => flag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }
    
    if (filter !== 'all') {
      filtered = filtered.filter(p => p.verdict === filter);
    }
    
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | number = 0;
      let bValue: string | number = 0;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'riskScore':
          aValue = a.riskScore || 0;
          bValue = b.riskScore || 0;
          break;
        case 'processingTime':
          aValue = a.processingTime || 0;
          bValue = b.processingTime || 0;
          break;
      }
      
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
      
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });
    
    return filtered;
  }, [projects, filter, sortField, sortDirection, searchQuery]);

  // Group projects by verdict - using only the defined VerdictType values
  const groupedProjects = useMemo(() => {
    const groups = {
      reject: projects.filter(p => p.verdict === 'reject'),
      flag: projects.filter(p => p.verdict === 'flag'),
      pass: projects.filter(p => p.verdict === 'pass'),
    };
    return groups;
  }, [projects]);

  // Add helper function to handle undefined verdicts
  const getDisplayVerdict = (verdict?: VerdictType): VerdictType | 'unknown' => {
    return verdict || 'unknown';
  };

  const getVerdictIcon = (verdict: VerdictType | 'all' | 'unknown') => {
    switch (verdict) {
      case 'pass': return '';
      case 'flag': return '';
      case 'reject': return '';
      case 'all': return '';
      case 'unknown': return '';
      default: return '';
    }
  };

  const getVerdictColor = (verdict: VerdictType | 'all' | 'unknown') => {
    switch (verdict) {
      case 'pass': return 'text-green-400';
      case 'flag': return 'text-yellow-400';
      case 'reject': return 'text-red-400';
      case 'all': return 'text-blue-400';
      case 'unknown': return 'text-sifter-text-muted';
      default: return 'text-sifter-text-muted';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-blue-400';
    return 'text-green-400';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get top red flag from redFlags array
  const getTopRedFlag = (project: BatchProject) => {
    if (!project.redFlags || project.redFlags.length === 0) {
      return 'No red flags detected';
    }
    return project.redFlags[0];
  };

  const renderProjectRow = (project: BatchProject) => {
    const displayVerdict = getDisplayVerdict(project.verdict);
    
    return (
      <tr key={project.id} className="border-b border-sifter-border/30 hover:bg-sifter-card/50">
        <td className="py-4 px-6">
          <div className="font-medium text-white">{project.name}</div>
          <div className="text-sm text-sifter-text-subtle">{project.input}</div>
        </td>
        <td className="py-4 px-6">
          <div className={`font-bold ${getRiskColor(project.riskScore || 0)}`}>
            {project.riskScore || 0}/100
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getVerdictIcon(displayVerdict)}</span>
            <span className={`font-medium ${getVerdictColor(displayVerdict)}`}>
              {displayVerdict.toUpperCase()}
            </span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="text-sifter-text">{getTopRedFlag(project)}</div>
          {project.redFlags && project.redFlags.length > 1 && (
            <div className="text-xs text-sifter-text-subtle mt-1">
              +{project.redFlags.length - 1} more flag{project.redFlags.length > 2 ? 's' : ''}
            </div>
          )}
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewDetails(project)}
              className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
            > View Details
            </button>
            <button 
              className="text-sifter-text-muted hover:text-white text-sm px-3 py-1.5 bg-sifter-elevated/50 hover:bg-sifter-hover rounded-lg transition-colors"
              onClick={() => console.log('Export PDF for', project.name)}
            > PDF
            </button>
          </div>
        </td>
      </tr>
    );
  };

  

  const renderSection = (verdict: VerdictType, count: number, projects: BatchProject[]) => {
    const isExpanded = expandedSection === verdict || expandedSection === null;
    const icon = getVerdictIcon(verdict);
    const color = getVerdictColor(verdict);
    const title = verdict === 'reject' ? 'REJECT' : verdict === 'flag' ? 'FLAG FOR REVIEW' : 'PASS';

    return (
      <div key={verdict} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setExpandedSection(expandedSection === verdict ? null : verdict)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className={`text-lg font-bold ${color}`}>
                {title} ({count})
              </h3>
              {verdict === 'reject' && (
                <p className="text-sm text-sifter-text-muted">Don&apos;t forward to partner</p>
              )}
              {verdict === 'flag' && (
                <p className="text-sm text-sifter-text-muted">Needs your review</p>
              )}
              {verdict === 'pass' && (
                <p className="text-sm text-sifter-text-muted">Forward to partner</p>
              )}
            </div>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-sifter-text-muted">
              {isExpanded ? 'Showing all' : 'Collapsed'}
            </span>
            <button
              onClick={() => setExpandedSection(expandedSection === verdict ? null : verdict)}
              className="text-sifter-text-muted hover:text-white"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {isExpanded && projects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sifter-border text-left text-sifter-text-muted text-sm">
                  <th className="py-3 px-6 font-medium">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    > Project Name
                      {sortField === 'name' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-6 font-medium">
                    <button
                      onClick={() => handleSort('riskScore')}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    > Risk Score
                      {sortField === 'riskScore' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-6 font-medium">Result</th>
                  <th className="py-3 px-6 font-medium">Top Red Flag</th>
                  <th className="py-3 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(renderProjectRow)}
              </tbody>
            </table>
          </div>
        )}

        {isExpanded && projects.length === 0 && (
          <div className="text-center py-8 text-sifter-text-subtle border border-dashed border-sifter-border rounded-lg"> No projects in this category
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-sifter-elevated text-sifter-text-muted hover:bg-sifter-hover hover:text-white'
            }`}
          >
            {getVerdictIcon('all')} All ({projects.length})
          </button>
          <button
            onClick={() => setFilter('reject')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'reject'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-sifter-elevated text-sifter-text-muted hover:bg-sifter-hover hover:text-white'
            }`}
          >
            {getVerdictIcon('reject')} Reject ({groupedProjects.reject.length})
          </button>
          <button
            onClick={() => setFilter('flag')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'flag'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-sifter-elevated text-sifter-text-muted hover:bg-sifter-hover hover:text-white'
            }`}
          >
            {getVerdictIcon('flag')} Flag ({groupedProjects.flag.length})
          </button>
          <button
            onClick={() => setFilter('pass')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filter === 'pass'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-sifter-elevated text-sifter-text-muted hover:bg-sifter-hover hover:text-white'
            }`}
          >
            {getVerdictIcon('pass')} Pass ({groupedProjects.pass.length})
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-sifter-dark border border-sifter-border rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:outline-none w-64"
            />
            <svg
              className="w-5 h-5 text-sifter-text-muted absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onExport('csv')}
              className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg> CSV
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors flex items-center gap-2"
            > PDF
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="mb-8 p-4 bg-sifter-dark/50 rounded-xl">
        <h4 className="font-medium text-white mb-3">Bulk Actions</h4>
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors flex items-center gap-2"
            disabled={groupedProjects.pass.length === 0}
          > Email {groupedProjects.pass.length} PASS Projects to Partner
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors flex items-center gap-2"> Generate Partner Packet
          </button>
          <button 
            className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-colors flex items-center gap-2"
            disabled={groupedProjects.reject.length === 0}
          > Export {groupedProjects.reject.length} Rejects as CSV
          </button>
          <button 
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-colors flex items-center gap-2"
            disabled={groupedProjects.flag.length === 0}
          > Review {groupedProjects.flag.length} Flagged
          </button>
        </div>
      </div>

      {/* Results by Section */}
      <div>
        {renderSection('reject', groupedProjects.reject.length, groupedProjects.reject)}
        {renderSection('flag', groupedProjects.flag.length, groupedProjects.flag)}
        {renderSection('pass', groupedProjects.pass.length, groupedProjects.pass)}
      </div>

      {/* Expand/Collapse All */}
      <div className="flex justify-center mt-8 pt-6 border-t border-sifter-border">
        <button
          onClick={() => setExpandedSection(expandedSection === null ? 'reject' : null)}
          className="text-sifter-text-muted hover:text-white text-sm flex items-center gap-2"
        >
          {expandedSection === null ? 'Expand All Sections' : 'Collapse All Sections'}
          <span>{expandedSection === null ? '▼' : '▲'}</span>
        </button>
      </div>
    </div>
  );
};
