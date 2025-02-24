import {CompletionStatus} from "@/types/status.ts";

export interface Profile {
    bio: string;
    description: string;
    location: string;
    socialLinks: string[];
    profession: string;
    interests: string[];
    birthDate?: string;
    profileExists?: boolean;
    completionStatus?: CompletionStatus; // Add this line
}

export interface ProfileState {
    profile: Profile | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}
