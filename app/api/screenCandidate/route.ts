/**
 * API Route: /api/screenCandidate
 * Enhanced screening with DeepSeek AI + BERT-based resume parsing + competency scoring
 * Input: { resume: string, jdData: object, candidateEmail?: string }
 * Output: { competency_match, cultural_fit, predicted_success, summary, scoring_details, ranking_score }
 *
 * Pipeline:
 * 1. Parse resume using BERT-based extraction
 * 2. Score competencies using structured matching pipeline
 * 3. Validate with DeepSeek AI analysis
 * 4. Return comprehensive fit assessment
 *
 * Files Modified: /app/api/screenCandidate/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '../../../lib/resumeParser';
import {
  scoreCompetencies,
  generateCulturalFitNarrative,
  generateSuccessPrediction,
} from '@/lib/competencyScorer';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { resume, jdData } = await req.json();

    if (!resume || !jdData) {
      return NextResponse.json({ error: 'Missing resume or JD data' }, { status: 400 });
    }

    // Step 1: Parse resume using BERT-based extraction
    const parsedResume = parseResume(resume);

    // Step 2: Score competencies using structured pipeline
    const requiredSkills = jdData.core_skills || [];
    const competencyScoringResult = scoreCompetencies(
      parsedResume.skills,
      requiredSkills,
      resume
    );

    // Step 3: Get DeepSeek AI validation and detailed analysis
    const deepseekAnalysis = await getDeepseekAnalysis(
      resume,
      jdData,
      parsedResume,
      competencyScoringResult
    );

    // Combine BERT scores with DeepSeek validation
    const finalCompetencyMatch = Math.round(
      competencyScoringResult.overallFitScore * 0.6 +
      (deepseekAnalysis.competency_match || 0) * 0.4
    );

    const culturalFitNarrative = generateCulturalFitNarrative(
      competencyScoringResult.culturalFitIndex
    );
    const predictedSuccess = generateSuccessPrediction(
      finalCompetencyMatch,
      competencyScoringResult.culturalFitIndex,
      parsedResume.totalYearsExperience
    );

    // Step 4: Build comprehensive response (no DB storage)
    const responseData = {
      success: true,
      scoringPipeline: {
        bert_parsed_resume: {
          totalSkillsFound: parsedResume.skills.length,
          yearsExperience: parsedResume.totalYearsExperience,
          educationLevel: parsedResume.education[0]?.level || 'Unknown',
          extractionScore: parsedResume.extractionScore,
        },
        competency_scoring: {
          overallFitScore: competencyScoringResult.overallFitScore,
          rankingScore: competencyScoringResult.rankingScore,
          culturalFitIndex: competencyScoringResult.culturalFitIndex,
          matchedCompetencies: competencyScoringResult.competencyMatches.filter(m => !m.gap).length,
          totalRequired: jdData.core_skills?.length || 0,
        },
        deepseek_validation: deepseekAnalysis,
      },
      competency_match: finalCompetencyMatch,
      cultural_fit: culturalFitNarrative,
      predicted_success: predictedSuccess,
      summary: deepseekAnalysis.summary || competencyScoringResult.recommendations,
      skill_gaps: competencyScoringResult.skillGaps,
      strengths: competencyScoringResult.strengths,
      recommendation: deepseekAnalysis.recommendation || competencyScoringResult.recommendations,
      ranking_score: competencyScoringResult.rankingScore,
      skill_match_details: competencyScoringResult.competencyMatches.map(match => ({
        competency: match.competency,
        matched: !match.gap,
        extractedSkill: match.extractedSkill,
        confidence: match.confidenceScore,
        proficiency: match.proficiencyLevel,
      })),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Candidate screening error:', error);
    return NextResponse.json(
      {
        error: 'Failed to screen candidate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function getDeepseekAnalysis(
  resume: string,
  jdData: any,
  parsedResume: any,
  competencyScoringResult: any
): Promise<any> {
  try {
    const prompt = `You are an expert recruiter and AI hiring specialist. Analyze this candidate profile comprehensively.

BERT-PARSED CANDIDATE PROFILE:
- Skills Found: ${parsedResume.skills.map((s: any) => s.skill).join(', ')}
- Years of Experience: ${parsedResume.totalYearsExperience}
- Education: ${parsedResume.education.map((e: any) => `${e.degree} in ${e.field}`).join(', ') || 'Not specified'}
- Extraction Confidence: ${(parsedResume.extractionScore * 100).toFixed(0)}%

JOB REQUIREMENTS:
- Required Skills: ${jdData.core_skills?.join(', ') || 'Not specified'}
- Required Behavioral Traits: ${jdData.behavioral_traits?.join(', ') || 'Not specified'}
- Competency Levels: ${JSON.stringify(jdData.competency_level || {})}

COMPETENCY SCORING RESULTS:
- Overall Fit Score: ${competencyScoringResult.overallFitScore}%
- Cultural Fit Index: ${competencyScoringResult.culturalFitIndex}%
- Matched Competencies: ${competencyScoringResult.competencyMatches.filter((m: any) => !m.gap).length}/${jdData.core_skills?.length || 0}

ORIGINAL RESUME:
${resume.substring(0, 1000)}...

Based on the BERT parsing results, competency scoring, and original resume, provide a final validation assessment in JSON format:
{
  "competency_match": <number 0-100 refined score>,
  "cultural_fit": "High" | "Medium" | "Low",
  "predicted_success": "Highly Likely" | "Likely" | "Possible" | "Unlikely",
  "summary": "<200 word detailed analysis of candidate fit>",
  "skill_gaps": ["gap1", "gap2"],
  "strengths": ["strength1", "strength2"],
  "recommendation": "Schedule Interview" | "Technical Round" | "Request Additional Info" | "Reject",
  "reasoning": "<explain scoring decisions>"
}`;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn('DeepSeek API call failed, using default analysis');
      return {};
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    try {
      return JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }
  } catch (error) {
    console.warn('DeepSeek analysis failed:', error);
    return {};
  }
}
