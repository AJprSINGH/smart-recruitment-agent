'use client';

/**
 * Smart Recruitment Agent - Main Page
 * Integrates JD Analyzer and Candidate Screening modules
 * Part of Talent Management Module for HP Frontend
 * All styles inline - no globals.css modifications
 */

import { useState } from 'react';
import JDAnalyzer from '../components/JDAnalyzer';
import CandidateScreen from '../components/CandidateScreen';
import { Brain, Zap } from 'lucide-react';

interface JDData {
  core_skills?: string[];
  behavioral_traits?: string[];
  competency_level?: { [key: string]: string };
}

export default function RecruitmentPage() {
  const [jdData, setJDData] = useState<JDData | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '12px 24px',
            borderRadius: '50px',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
          }}>
            <Brain style={{ width: '24px', height: '24px', color: 'white' }} />
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '0.5px'
            }}>
              AI-POWERED RECRUITMENT
            </span>
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Smart Recruitment Agent
          </h1>

          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '700px',
            margin: '0 auto 24px',
            lineHeight: '1.6'
          }}>
            Optimize hiring with Singapore Industry Competency Framework mapping and AI-powered candidate screening
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <Zap style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
            <span style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: '600'
            }}>
              Hire for potential, not just pedigree — find candidates who will actually succeed
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '48px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                1
              </div>
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Analyze Job Description
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  Extract competencies and map to industry standards
                </p>
              </div>
            </div>
            <JDAnalyzer onAnalysisComplete={(data) => setJDData(data)} />
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                2
              </div>
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Screen Candidates
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  Evaluate fit and predict success likelihood
                </p>
              </div>
            </div>
            <CandidateScreen jdData={jdData} />
          </div>
        </div>

        <footer style={{
          marginTop: '64px',
          padding: '32px',
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '14px',
            opacity: 0.7,
            marginBottom: '8px'
          }}>
            Powered by Singapore Industry Competency Framework
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            Part of Human Productivity Talent Management Module
          </div>
          <a
            href="https://hp-frontend-three.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102,126,234,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Visit HP Talent Management
          </a>
        </footer>
      </div>
    </div>
  );
}
