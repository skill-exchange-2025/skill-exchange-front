// src/types/lessons.ts

export interface Instructor {
    _id: string;
    name: string;
    email: string;
}

export interface Lesson {
    _id: string;
    instructor?: Instructor;
    title: string;
    description: string;
    duration: number;
    content: string;       // changed from "textContent" to "content"
    order: number;
    status: 'draft' | 'published' | 'archived';
    videoUrl?: string;
    materials: string[];
    imageUrls: string[];
    isPreview: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

export interface LessonsState {
    lessons: Lesson[];
    selectedLesson: Lesson | null;
    error: string | null;
    loading: boolean;
    pagination: PaginationState;
}