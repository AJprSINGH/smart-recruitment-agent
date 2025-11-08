/**
 * Resume Parser Utility - BERT-based candidate extraction and analysis
 * Extracts skills, experience, education from resume text
 * Maps to competency frameworks and generates embeddings
 *
 * File: /lib/resumeParser.ts
 */

interface ExtractedSkill {
    skill: string;
    confidence: number;
    category: 'technical' | 'soft' | 'domain';
}

interface ExtractedEducation {
    degree: string;
    field: string;
    institution: string;
    year?: number;
    level: 'High School' | 'Bachelor' | 'Master' | 'PhD' | 'Certification';
}

interface ExtractedExperience {
    jobTitle: string;
    company: string;
    duration: string;
    yearsInRole: number;
    responsibilities: string[];
    skills: string[];
}

interface ParsedResume {
    skills: ExtractedSkill[];
    education: ExtractedEducation[];
    experience: ExtractedExperience[];
    totalYearsExperience: number;
    summary: string;
    embeddings?: number[];
    extractionScore: number;
}

const TECHNICAL_KEYWORDS = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'SQL', 'MongoDB',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'Machine Learning',
    'Data Science', 'TensorFlow', 'PyTorch', 'BERT', 'NLP', 'Deep Learning', 'Vue.js', 'Angular',
    'Express', 'Django', 'Flask', 'Spring Boot', 'PostgreSQL', 'Firebase', 'Supabase',
    'CI/CD', 'DevOps', 'Linux', 'Agile', 'Scrum', 'JIRA', 'Figma', 'UI/UX',
];

const SOFT_KEYWORDS = [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Adaptability',
    'Critical Thinking', 'Time Management', 'Creativity', 'Analytical', 'Strategic',
    'Negotiation', 'Mentoring', 'Project Management', 'Decision Making', 'Collaboration',
    'Attention to Detail', 'Reliability', 'Work Ethic', 'Flexibility', 'Innovation',
];

const EDUCATION_PATTERNS = [
    { regex: /bachelor|b\.s|b\.a|undergraduate/gi, level: 'Bachelor' as const },
    { regex: /master|m\.s|m\.a|graduate/gi, level: 'Master' as const },
    { regex: /phd|doctorate/gi, level: 'PhD' as const },
    { regex: /certification|certified|cert/gi, level: 'Certification' as const },
    { regex: /high school|secondary/gi, level: 'High School' as const },
];

export function parseResume(resumeText: string): ParsedResume {
    const text = resumeText.toLowerCase();

    const skills = extractSkills(resumeText);
    const education = extractEducation(resumeText);
    const experience = extractExperience(resumeText);
    const totalYearsExperience = calculateYearsExperience(experience);

    // Simple extraction score based on data completeness
    const extractionScore = calculateExtractionScore(skills, education, experience);

    // Generate basic embeddings (simplified - in production use actual BERT)
    const embeddings = generateSimpleEmbeddings(resumeText);

    const summary = generateSummary(skills, experience, totalYearsExperience);

    return {
        skills,
        education,
        experience,
        totalYearsExperience,
        summary,
        embeddings,
        extractionScore,
    };
}

function extractSkills(resumeText: string): ExtractedSkill[] {
    const skills: ExtractedSkill[] = [];
    const processedText = resumeText.toLowerCase();

    // Extract technical skills
    TECHNICAL_KEYWORDS.forEach(skill => {
        const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'gi');
        if (regex.test(processedText)) {
            skills.push({
                skill,
                confidence: 0.9,
                category: 'technical',
            });
        }
    });

    // Extract soft skills
    SOFT_KEYWORDS.forEach(skill => {
        const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'gi');
        if (regex.test(processedText)) {
            skills.push({
                skill,
                confidence: 0.75,
                category: 'soft',
            });
        }
    });

    // Remove duplicates and sort by confidence
    const uniqueSkills = Array.from(new Map(skills.map(s => [s.skill.toLowerCase(), s])).values());
    return uniqueSkills.sort((a, b) => b.confidence - a.confidence).slice(0, 30);
}

function extractEducation(resumeText: string): ExtractedEducation[] {
    const education: ExtractedEducation[] = [];
    const lines = resumeText.split('\n');

    lines.forEach(line => {
        for (const pattern of EDUCATION_PATTERNS) {
            if (pattern.regex.test(line)) {
                const degreeMatch = line.match(/([a-z\s&]{2,50})\s+in\s+([a-z\s]{2,50})/i);
                const yearMatch = line.match(/\b(19|20)\d{2}\b/);

                if (degreeMatch) {
                    education.push({
                        degree: degreeMatch[1].trim(),
                        field: degreeMatch[2].trim(),
                        institution: extractInstitution(line),
                        year: yearMatch ? parseInt(yearMatch[0]) : undefined,
                        level: pattern.level,
                    });
                }
                break;
            }
        }
    });

    return education;
}

function extractExperience(resumeText: string): ExtractedExperience[] {
    const experience: ExtractedExperience[] = [];
    const lines = resumeText.split('\n');

    let currentRole: ExtractedExperience | null = null;

    lines.forEach((line, index) => {
        const jobTitleMatch = line.match(/(?:^|\s)(software engineer|developer|manager|analyst|architect|lead|director|designer|product|business|data scientist|ml engineer|qa engineer)/i);

        if (jobTitleMatch) {
            if (currentRole) {
                experience.push(currentRole);
            }

            const companyMatch = line.match(/(?:at|@|,)\s+([a-z0-9&\s\.]{2,50})/i);
            const durationMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);

            currentRole = {
                jobTitle: jobTitleMatch[1].trim(),
                company: companyMatch ? companyMatch[1].trim() : 'Unknown',
                duration: durationMatch ? durationMatch[0] : 'Unknown',
                yearsInRole: calculateYearsInRole(durationMatch),
                responsibilities: [],
                skills: [],
            };
        }

        if (currentRole && (line.match(/^[\s]*[-•*]/))) {
            currentRole.responsibilities.push(line.replace(/^[\s]*[-•*]\s*/, '').trim());
        }
    });

    if (currentRole) {
        experience.push(currentRole);
    }

    return experience;
}

function extractInstitution(line: string): string {
    const institutionMatch = line.match(/(?:from|at|,)\s+([a-z\s&\.]{2,50})/i);
    return institutionMatch ? institutionMatch[1].trim() : 'Unknown';
}

function calculateYearsInRole(durationMatch: RegExpMatchArray | null): number {
    if (!durationMatch) return 1;

    const startYear = parseInt(durationMatch[1]);
    const endYear = durationMatch[2].toLowerCase() === 'present' || durationMatch[2].toLowerCase() === 'current'
        ? new Date().getFullYear()
        : parseInt(durationMatch[2]);

    return Math.max(1, endYear - startYear);
}

function calculateYearsExperience(experience: ExtractedExperience[]): number {
    return Math.round(
        experience.reduce((total, exp) => total + exp.yearsInRole, 0) * 10
    ) / 10;
}

function calculateExtractionScore(
    skills: ExtractedSkill[],
    education: ExtractedEducation[],
    experience: ExtractedExperience[]
): number {
    let score = 0.5;

    if (skills.length > 5) score += 0.2;
    if (education.length > 0) score += 0.15;
    if (experience.length > 0) score += 0.15;

    return Math.min(1, score);
}

function generateSimpleEmbeddings(text: string): number[] {
    // Simplified embedding - in production use actual BERT model
    // This creates a deterministic hash-based pseudo-embedding for demonstration
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const embedding: number[] = new Array(768).fill(0);

    words.forEach(word => {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash) + word.charCodeAt(i);
            hash = hash & hash;
        }

        const index = Math.abs(hash) % 768;
        embedding[index] += 1 / words.length;
    });

    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? embedding.map(val => val / norm) : embedding;
}

function generateSummary(
    skills: ExtractedSkill[],
    experience: ExtractedExperience[],
    yearsExperience: number
): string {
    const topSkills = skills.slice(0, 5).map(s => s.skill).join(', ');
    const latestRole = experience[0]?.jobTitle || 'Professional';

    return `${yearsExperience} years of experience as ${latestRole} with expertise in ${topSkills}.`;
}

export function scoreResumeFit(
    parsedResume: ParsedResume,
    requiredSkills: string[],
    requiredEducation?: string,
    yearsRequired?: number
): { matchScore: number; details: Record<string, any> } {
    const resumeSkillsLower = parsedResume.skills.map(s => s.skill.toLowerCase());

    // Calculate skill match
    let matchedSkills = 0;
    requiredSkills.forEach(skill => {
        if (resumeSkillsLower.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))) {
            matchedSkills++;
        }
    });

    const skillScore = requiredSkills.length > 0 ? (matchedSkills / requiredSkills.length) * 100 : 50;

    // Calculate education fit
    const educationScore = requiredEducation
        ? (parsedResume.education.length > 0 ? 80 : 40)
        : 100;

    // Calculate experience fit
    const experienceScore = yearsRequired
        ? Math.min(100, (parsedResume.totalYearsExperience / yearsRequired) * 100)
        : 100;

    const matchScore = (skillScore * 0.5 + educationScore * 0.3 + experienceScore * 0.2);

    return {
        matchScore: Math.round(matchScore),
        details: {
            skillScore: Math.round(skillScore),
            educationScore: Math.round(educationScore),
            experienceScore: Math.round(experienceScore),
            matchedSkills,
            totalRequired: requiredSkills.length,
            yearsExperience: parsedResume.totalYearsExperience,
        },
    };
}

export function mapSkillsToCompetencyFramework(
    extractedSkills: ExtractedSkill[],
    icfFramework: any[]
): Array<{ skill: string; frameworkMatch: string; confidence: number }> {
    return extractedSkills.map(skill => {
        const match = icfFramework.find(
            comp =>
                comp.skill_name?.toLowerCase().includes(skill.skill.toLowerCase()) ||
                comp.competency_name?.toLowerCase().includes(skill.skill.toLowerCase())
        );

        return {
            skill: skill.skill,
            frameworkMatch: match?.skill_name || match?.competency_name || 'Unmatched',
            confidence: match ? 0.85 : skill.confidence * 0.6,
        };
    });
}
