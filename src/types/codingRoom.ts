// src/types/codingRoom.ts
// src/types/codingRoom.ts
export type ParticipantRole = 'owner' | 'editor' | 'viewer';

export interface Participant {
    user: string;
    username?: string;
    role: ParticipantRole;
    joinedAt: string;
}

export interface CodingRoom {
    _id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    language: string;
    theme: string;
    tags?: string[];
    currentCode: string;
    participants?: Participant[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'inactive' | 'archived';
}
