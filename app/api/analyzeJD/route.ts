/**
 * API Route: /api/analyzeJD
 * Analyzes job descriptions using GPT and maps to Singapore Competency Framework
 * Input: { jd: string }
 * Output: { core_skills, behavioral_traits, competency_level, mapped_competencies }
 */

import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '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';
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const ICF_API = 'https://hp.triz.co.in/getSkillCompetency?sub_institute_id=3';

interface ICFCompetency {
  skill_name?: string;
  competency_name?: string;
  proficiency_level?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { jd } = await req.json();

    if (!jd || typeof jd !== 'string') {
      return NextResponse.json({ error: 'Invalid job description' }, { status: 400 });
    }

    const gptPrompt = `Analyze this job description and extract:
1. Core technical skills (list 5-8 specific skills)
2. Behavioral traits (list 3-5 soft skills)
3. Competency level required for each skill (Beginner/Intermediate/Advanced/Expert)

Job Description:
${jd}

Respond in valid JSON format:
{
  "core_skills": ["skill1", "skill2"],
  "behavioral_traits": ["trait1", "trait2"],
  "competency_level": {
    "skill1": "Advanced",
    "trait1": "Intermediate"
  }
}`;

    const gptResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: gptPrompt }],
        temperature: 0.3,
      }),
    });

    if (!gptResponse.ok) {
      throw new Error('GPT API failed');
    }

    const gptData = await gptResponse.json();
    const content = gptData.choices?.[0]?.message?.content || '{}';

    let extractedData: any;
    try {
      extractedData = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        core_skills: [],
        behavioral_traits: [],
        competency_level: {}
      };
    }

    let icfData: ICFCompetency[] = [];
    try {
      const icfResponse = await fetch(ICF_API);
      if (icfResponse.ok) {
        const responseData = await icfResponse.json();
        // Ensure icfData is always an array
        icfData = Array.isArray(responseData) ? responseData : [];
      }
    } catch (error) {
      console.warn('ICF API fetch failed:', error);
      // icfData remains an empty array
    }

    const mappedCompetencies = extractedData.core_skills?.map((skill: string) => {
      const matched = icfData.find((comp: ICFCompetency) =>
        comp.skill_name?.toLowerCase().includes(skill.toLowerCase()) ||
        comp.competency_name?.toLowerCase().includes(skill.toLowerCase())
      );

      return {
        skill,
        framework_match: matched?.skill_name || matched?.competency_name || null,
        proficiency: extractedData.competency_level?.[skill] || 'Intermediate',
        matched: !!matched
      };
    }) || [];

    return NextResponse.json({
      success: true,
      core_skills: extractedData.core_skills || [],
      behavioral_traits: extractedData.behavioral_traits || [],
      competency_level: extractedData.competency_level || {},
      mapped_competencies: mappedCompetencies,
      framework_coverage: mappedCompetencies.filter((m: any) => m.matched).length / (mappedCompetencies.length || 1) * 100
    });

  } catch (error) {
    console.error('JD Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
