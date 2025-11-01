'use client';

/**
 * CandidateScreen Component
 * Screens candidates against JD competencies and predicts cultural fit
 * All styles are inline - no globals.css usage
 */

import { useState } from 'react';
import { UserCheck, Loader2, AlertCircle, Award, TrendingUp, Calendar, XCircle } from 'lucide-react';

interface JDData {
  core_skills?: string[];
  behavioral_traits?: string[];
  competency_level?: { [key: string]: string };
}

interface ScreeningResult {
  competency_match: number;
  cultural_fit: string;
  predicted_success: string;
  summary: string;
  skill_gaps: string[];
  strengths: string[];
  recommendation: string;
  skill_match_details: Array<{
    skill: string;
    present: boolean;
    required_level: string;
    gap: boolean;
  }>;
  total_skills_required: number;
  skills_matched: number;
}

interface Props {
  jdData: JDData | null;
}

export default function CandidateScreen({ jdData }: Props) {
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState('');

  const screenCandidate = async () => {
    if (!resume.trim()) {
      setError('Please enter candidate resume');
      return;
    }

    if (!jdData) {
      setError('Please analyze a job description first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/screenCandidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jdData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Screening failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to screen candidate');
    } finally {
      setLoading(false);
    }
  };

  const getFitColor = (fit: string) => {
    switch (fit.toLowerCase()) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSuccessColor = (success: string) => {
    if (success.includes('Highly')) return '#10b981';
    if (success.includes('Likely')) return '#3b82f6';
    if (success.includes('Possible')) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <UserCheck style={{ width: '32px', height: '32px', color: '#fbbf24' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
            Candidate Screening
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
          AI-powered competency matching and cultural fit prediction
        </p>
      </div>

      {!jdData && (
        <div style={{
          padding: '20px',
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle style={{ width: '24px', height: '24px', color: '#d97706', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#92400e' }}>
            Please analyze a job description first using the JD Analyzer above
          </span>
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        opacity: !jdData ? 0.6 : 1,
        pointerEvents: !jdData ? 'none' : 'auto'
      }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          Candidate Resume / Profile
        </label>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste candidate's resume or profile text here..."
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
          onFocus={(e) => e.target.style.borderColor = '#ec4899'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />

        <button
          onClick={screenCandidate}
          disabled={loading || !jdData}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '14px 24px',
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading || !jdData ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => !loading && jdData && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(236,72,153,0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}
        >
          {loading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : <UserCheck style={{ width: '20px', height: '20px' }} />}
          {loading ? 'Screening...' : 'Screen Candidate'}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <Award style={{ width: '32px', height: '32px', marginBottom: '8px' }} />
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Competency Match</div>
              <div style={{ fontSize: '36px', fontWeight: '700' }}>{result.competency_match}%</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                {result.skills_matched}/{result.total_skills_required} skills
              </div>
            </div>

            <div style={{
              background: `linear-gradient(135deg, ${getFitColor(result.cultural_fit)} 0%, ${getFitColor(result.cultural_fit)}dd 100%)`,
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <TrendingUp style={{ width: '32px', height: '32px', marginBottom: '8px' }} />
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Cultural Fit</div>
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{result.cultural_fit}</div>
            </div>

            <div style={{
              background: `linear-gradient(135deg, ${getSuccessColor(result.predicted_success)} 0%, ${getSuccessColor(result.predicted_success)}dd 100%)`,
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <TrendingUp style={{ width: '32px', height: '32px', marginBottom: '8px' }} />
              <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '4px' }}>Success Prediction</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{result.predicted_success}</div>
            </div>
          </div>

          <div style={{
            background: result.recommendation === 'Schedule Interview' ? '#f0fdf4' : result.recommendation === 'Reject' ? '#fee2e2' : '#fef3c7',
            border: `2px solid ${result.recommendation === 'Schedule Interview' ? '#86efac' : result.recommendation === 'Reject' ? '#fca5a5' : '#fde047'}`,
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {result.recommendation === 'Schedule Interview' ? (
                <Calendar style={{ width: '28px', height: '28px', color: '#059669' }} />
              ) : result.recommendation === 'Reject' ? (
                <XCircle style={{ width: '28px', height: '28px', color: '#dc2626' }} />
              ) : (
                <AlertCircle style={{ width: '28px', height: '28px', color: '#d97706' }} />
              )}
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Recommendation</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>{result.recommendation}</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
              Summary
            </h3>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#4b5563', margin: 0 }}>
              {result.summary}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                Strengths
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.strengths.map((strength, idx) => (
                  <div key={idx} style={{
                    padding: '10px 14px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#166534'
                  }}>
                    {strength}
                  </div>
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
                Skill Gaps
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.skill_gaps.length > 0 ? result.skill_gaps.map((gap, idx) => (
                  <div key={idx} style={{
                    padding: '10px 14px',
                    background: '#fef3c7',
                    border: '1px solid #fde047',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#92400e'
                  }}>
                    {gap}
                  </div>
                )) : (
                  <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                    No significant gaps identified
                  </div>
                )}
              </div>
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
