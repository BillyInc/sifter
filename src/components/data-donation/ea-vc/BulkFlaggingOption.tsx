'use client';

import React, { useState } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SuspiciousEntity {
  id: string;
  name: string;
  projectCount: number;
  projects: string[];
  confidence: number;
}

interface BulkFlaggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: SuspiciousEntity[]; // Array of entities
  onFlagAll: (entities: SuspiciousEntity[]) => void;
  onFlagSelected: (selectedIds: string[]) => void;
}

export default function BulkFlaggingModal({
  isOpen,
  onClose,
  entities,
  onFlagAll,
  onFlagSelected
}: BulkFlaggingModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSelectAll = () => {
    if (selectedIds.length === entities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entities.map(e => e.id));
    }
  };
  
  const handleToggleEntity = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const handleSubmitSelected = async () => {
    setIsSubmitting(true);
    try {
      await onFlagSelected(selectedIds);
      setSelectedIds([]);
      onClose();
    } catch (error) {
      console.error('Bulk flagging failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      await onFlagAll(entities);
      setSelectedIds([]);
      onClose();
    } catch (error) {
      console.error('Bulk flagging failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedEntities = entities.filter(e => selectedIds.includes(e.id));
  const totalProjects = selectedEntities.reduce((sum, e) => sum + e.projectCount, 0);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-sifter-card border border-sifter-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sifter-border">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bulk Entity Flagging
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Found {entities.length} suspicious entities across your batch
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Summary */}
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{entities.length}</div>
                <div className="text-xs text-gray-400">Suspicious Entities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {entities.reduce((sum, e) => sum + e.projectCount, 0)}
                </div>
                <div className="text-xs text-gray-400">Total Projects Affected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {Math.round(entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length)}%
                </div>
                <div className="text-xs text-gray-400">Avg Confidence</div>
              </div>
            </div>
          </div>
          
          {/* Entity List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-400 px-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === entities.length && entities.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-amber-500 rounded border-sifter-border bg-sifter-dark"
                />
                <span>Select All ({entities.length})</span>
              </div>
              <span>{selectedIds.length} selected</span>
            </div>
            
            {entities.map((entity) => (
              <div
                key={entity.id}
                className={`
                  p-4 rounded-lg border transition-all cursor-pointer
                  ${selectedIds.includes(entity.id)
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-sifter-border hover:border-amber-500/50 hover:bg-sifter-dark/50'
                  }
                `}
                onClick={() => handleToggleEntity(entity.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entity.id)}
                      onChange={() => handleToggleEntity(entity.id)}
                      className="w-4 h-4 text-amber-500 rounded border-sifter-border bg-sifter-dark"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <h4 className="font-medium text-white">{entity.name}</h4>
                      <p className="text-sm text-gray-400">
                        Appears in {entity.projectCount} project{entity.projectCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      entity.confidence > 80 ? 'bg-green-500/20 text-green-400' :
                      entity.confidence > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {entity.confidence}% confidence
                    </span>
                    {selectedIds.includes(entity.id) && (
                      <CheckIcon className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </div>
                
                {/* Project List */}
                {entity.projects.length > 0 && (
                  <div className="mt-3 ml-7 pl-4 border-l border-sifter-border/50">
                    <p className="text-xs text-gray-500 mb-1">Projects:</p>
                    <div className="flex flex-wrap gap-2">
                      {entity.projects.slice(0, 3).map((project, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-800/50 rounded border border-gray-700"
                        >
                          {project}
                        </span>
                      ))}
                      {entity.projects.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{entity.projects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-sifter-border bg-sifter-dark/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {selectedIds.length > 0 ? (
                <>
                  Selected {selectedIds.length} entities affecting {totalProjects} projects
                </>
              ) : (
                'Select entities to flag'
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              
              {selectedIds.length > 0 ? (
                <button
                  onClick={handleSubmitSelected}
                  disabled={isSubmitting}
                  className={`
                    px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all
                    ${isSubmitting
                      ? 'bg-amber-600/50 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Flag Selected ({selectedIds.length})
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmitAll}
                  disabled={isSubmitting}
                  className={`
                    px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all
                    ${isSubmitting
                      ? 'bg-amber-600/50 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }
                  `}
                >
                  {isSubmitting ? (
                    'Processing All...'
                  ) : (
                    `Flag All ${entities.length} Entities`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
