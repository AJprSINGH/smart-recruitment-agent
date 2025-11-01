'use client';

/**
 * JDAnalyzer Component
 * Analyzes job descriptions and extracts competencies using GPT + Singapore ICF API
 * All styles are inline - no globals.css usage
 */

import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface CompetencyLevel {
  [key: string]: string;
}

interface MappedCompetency {
  skill: string;
  framework_match: string | null;
  proficiency: string;
  matched: boolean;
}

interface AnalysisResult {
  core_skills: string[];
  behavioral_traits: string[];
  competency_level: CompetencyLevel;
  mapped_competencies: MappedCompetency[];
  framework_coverage: number;
}

interface Props {
  onAnalysisComplete?: (data: AnalysisResult) => void;
}

export default function JDAnalyzer({ onAnalysisComplete }: Props) {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const analyzeJD = async () => {
    if (!jd.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/analyzeJD', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Sparkles style={{ width: '32px', height: '32px', color: '#fbbf24' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
            Job Description Analyzer
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
          Extract optimal competencies and map to Singapore Industry Competency Framework
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          Job Description
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the complete job description here..."
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />

        <button
          onClick={analyzeJD}
          disabled={loading}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '14px 24px',
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(102,126,234,0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}
        >
          {loading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: '20px', height: '20px' }} />}
          {loading ? 'Analyzing...' : 'Analyze JD'}
        </button>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#991b1b' }}>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp style={{ width: '28px', height: '28px' }} />
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Framework Coverage</div>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>{Math.round(result.framework_coverage)}%</div>
              </div>
            </div>
            <CheckCircle style={{ width: '48px', height: '48px', opacity: 0.6 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                Core Technical Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.core_skills.map((skill, idx) => (
                  <span key={idx} style={{
                    padding: '6px 14px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                Behavioral Traits
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.behavioral_traits.map((trait, idx) => (
                  <span key={idx} style={{
                    padding: '6px 14px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
              Competency Mapping (Singapore ICF)
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {result.mapped_competencies.map((comp, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: comp.matched ? '#f0fdf4' : '#fef3c7',
                  border: `2px solid ${comp.matched ? '#86efac' : '#fde047'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{comp.skill}</div>
                    {comp.framework_match && (
                      <div style={{ fontSize: '13px', color: '#059669', marginTop: '4px' }}>
                        Matched: {comp.framework_match}
                      </div>
                    )}
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    background: comp.proficiency === 'Expert' ? '#dc2626' : comp.proficiency === 'Advanced' ? '#ea580c' : comp.proficiency === 'Intermediate' ? '#f59e0b' : '#84cc16',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {comp.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
