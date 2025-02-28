export interface Skill {
    name: string;
    description: string;
    proficiencyLevel: string;
    _id: string;
}

export interface DesiredSkill {
    name: string;
    description: string;
    desiredProficiencyLevel: string;
    _id: string;
}

interface User {
    name: string;
    email: string;
    phone: number;
    skills: Skill[];
    desiredSkills: DesiredSkill[];
}

export interface CompletionStatus {
    percentage: number;
    missingFields: string[];
}

export interface Profile {
    _id: string;
    userId: string;
    bio: string;
    description: string;
    location: string;
    socialLinks: string[];
    profession: string;
    interests: string[];
    birthDate?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    user: User;
    completionStatus: CompletionStatus;
    profileExists: boolean;
}