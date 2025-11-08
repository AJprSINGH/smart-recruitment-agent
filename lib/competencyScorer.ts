/**
 * Competency Scoring Pipeline - Structured ranking and matching
 * Maps extracted skills to competency frameworks with confidence scoring
 * Generates composite fit scores using weighted competency matching
 *
 * File: /lib/competencyScorer.ts
 */

interface CompetencyMatch {
    competency: string;
    extractedSkill: string;
    confidenceScore: number;
    proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    gap: boolean;
}

interface ScoringResult {
    overallFitScore: number;
    rankingScore: number;
    competencyMatches: CompetencyMatch[];
    skillGaps: string[];
    strengths: string[];
    recommendations: string;
    culturalFitIndex: number;
}

const PROFICIENCY_LEVELS = {
    expert: ['expert', 'senior', 'lead', 'architect', '10+', 'years'],
    advanced: ['advanced', 'proficient', '5-10', 'years'],
    intermediate: ['intermediate', 'competent', '2-5', 'years'],
    beginner: ['beginner', 'basic', 'junior', '0-2', 'years'],
};

const SOFT_SKILL_KEYWORDS = {
    'Leadership': ['lead', 'mentor', 'manage', 'supervise', 'director', 'head'],
    'Communication': ['present', 'communicate', 'write', 'speak', 'liaise'],
    'Adaptability': ['adapt', 'flexible', 'learn', 'pivot', 'agile'],
    'Problem Solving': ['solve', 'troubleshoot', 'debug', 'analyze', 'resolve'],
    'Teamwork': ['collaborate', 'team', 'cooperate', 'coordination', 'partner'],
    'Critical Thinking': ['analyze', 'evaluate', 'assess', 'critical', 'strategic'],
};

export function scoreCompetencies(
    extractedSkills: Array<{ skill: string; confidence: number; category: string }>,
    requiredCompetencies: string[],
    resumeText: string
): ScoringResult {
    const competencyMatches = matchCompetencies(extractedSkills, requiredCompetencies);
    const skillGaps = identifySkillGaps(competencyMatches, requiredCompetencies);
    const strengths = identifyStrengths(competencyMatches);
    const culturalFitIndex = assessCulturalFit(resumeText, extractedSkills);

    const overallFitScore = calculateOverallFitScore(competencyMatches, requiredCompetencies.length);
    const rankingScore = calculateRankingScore(overallFitScore, culturalFitIndex, skillGaps.length);

    const recommendations = generateRecommendations(overallFitScore, skillGaps, culturalFitIndex);

    return {
        overallFitScore,
        rankingScore,
        competencyMatches,
        skillGaps,
        strengths,
        recommendations,
        culturalFitIndex,
    };
}

function matchCompetencies(
    extractedSkills: Array<{ skill: string; confidence: number; category: string }>,
    requiredCompetencies: string[]
): CompetencyMatch[] {
    const matches: CompetencyMatch[] = [];

    requiredCompetencies.forEach(required => {
        let bestMatch: CompetencyMatch | null = null;
        let bestSimilarity = 0;

        extractedSkills.forEach(extracted => {
            const similarity = calculateSimilarity(required, extracted.skill);

            if (similarity > bestSimilarity && similarity > 0.5) {
                bestSimilarity = similarity;
                bestMatch = {
                    competency: required,
                    extractedSkill: extracted.skill,
                    confidenceScore: bestSimilarity * extracted.confidence,
                    proficiencyLevel: inferProficiencyLevel(extracted.skill),
                    gap: false,
                };
            }
        });

        if (bestMatch) {
            matches.push(bestMatch);
        } else {
            matches.push({
                competency: required,
                extractedSkill: '',
                confidenceScore: 0,
                proficiencyLevel: 'Beginner',
                gap: true,
            });
        }
    });

    return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

function identifySkillGaps(
    competencyMatches: CompetencyMatch[],
    requiredCompetencies: string[]
): string[] {
    return competencyMatches
        .filter(match => match.gap)
        .map(match => match.competency);
}

function identifyStrengths(competencyMatches: CompetencyMatch[]): string[] {
    return competencyMatches
        .filter(match => !match.gap && match.confidenceScore > 0.7)
        .slice(0, 5)
        .map(match => `${match.extractedSkill} (${match.proficiencyLevel})`);
}

function assessCulturalFit(resumeText: string, extractedSkills: any[]): number {
    const text = resumeText.toLowerCase();

    // Check for agile/collaborative indicators
    let fitScore = 50;

    if (text.includes('agile') || text.includes('scrum') || text.includes('sprint')) {
        fitScore += 10;
    }

    if (
        text.includes('collaborate') ||
        text.includes('teamwork') ||
        text.includes('cross-functional')
    ) {
        fitScore += 10;
    }

    if (text.includes('innovation') || text.includes('creative')) {
        fitScore += 5;
    }

    if (text.includes('leadership') || text.includes('mentor')) {
        fitScore += 8;
    }

    const softSkills = extractedSkills.filter(s => s.category === 'soft');
    fitScore += Math.min(softSkills.length * 2, 15);

    return Math.min(100, fitScore);
}

function calculateOverallFitScore(
    competencyMatches: CompetencyMatch[],
    totalRequired: number
): number {
    if (totalRequired === 0) return 50;

    const matchedCount = competencyMatches.filter(m => !m.gap).length;
    const confidenceAvg =
        competencyMatches.reduce((sum, m) => sum + m.confidenceScore, 0) / totalRequired;

    const matchPercentage = (matchedCount / totalRequired) * 100;
    const confidenceScore = confidenceAvg * 100;

    return Math.round(matchPercentage * 0.6 + confidenceScore * 0.4);
}

function calculateRankingScore(
    overallFit: number,
    culturalFit: number,
    gapCount: number
): number {
    const fitComponent = overallFit * 0.5;
    const culturalComponent = culturalFit * 0.3;
    const gapComponent = Math.max(0, (1 - gapCount * 0.15) * 100) * 0.2;

    return Math.round(fitComponent + culturalComponent + gapComponent);
}

function generateRecommendations(
    overallFitScore: number,
    skillGaps: string[],
    culturalFit: number
): string {
    if (overallFitScore > 80 && culturalFit > 75) {
        return 'Highly Recommended - Schedule Interview';
    }

    if (overallFitScore > 65 && skillGaps.length <= 2) {
        return 'Recommended - Consider for Technical Round';
    }

    if (overallFitScore > 50) {
        return 'Potential Fit - Request Additional Info';
    }

    if (skillGaps.length > 5) {
        return 'Requires Training - Consider for Entry Level';
    }

    return 'Not Recommended - Skill Gap Too Large';
}

function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.85;

    // Levenshtein-like similarity
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = getEditDistance(shorter, longer);
    return 1 - editDistance / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
}

function inferProficiencyLevel(
    skill: string
): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    const lower = skill.toLowerCase();

    for (const keyword of PROFICIENCY_LEVELS.expert) {
        if (lower.includes(keyword)) return 'Expert';
    }

    for (const keyword of PROFICIENCY_LEVELS.advanced) {
        if (lower.includes(keyword)) return 'Advanced';
    }

    for (const keyword of PROFICIENCY_LEVELS.intermediate) {
        if (lower.includes(keyword)) return 'Intermediate';
    }

    return 'Beginner';
}

export function rankCandidates(
    candidates: Array<{ id: string; scoringResult: ScoringResult }>
): Array<{ id: string; rank: number; scoringResult: ScoringResult }> {
    return candidates
        .sort((a, b) => b.scoringResult.rankingScore - a.scoringResult.rankingScore)
        .map((candidate, index) => ({
            ...candidate,
            rank: index + 1,
        }));
}

export function generateCulturalFitNarrative(
    culturalFitIndex: number
): 'High' | 'Medium' | 'Low' {
    if (culturalFitIndex >= 75) return 'High';
    if (culturalFitIndex >= 50) return 'Medium';
    return 'Low';
}

export function generateSuccessPrediction(
    overallFitScore: number,
    culturalFitIndex: number,
    yearsExperience: number
): 'Highly Likely' | 'Likely' | 'Possible' | 'Unlikely' {
    const combinedScore = overallFitScore * 0.6 + culturalFitIndex * 0.4;
    const experienceFactor = Math.min(yearsExperience / 5, 1) * 20;
    const finalScore = combinedScore + experienceFactor;

    if (finalScore >= 85) return 'Highly Likely';
    if (finalScore >= 70) return 'Likely';
    if (finalScore >= 50) return 'Possible';
    return 'Unlikely';
}
