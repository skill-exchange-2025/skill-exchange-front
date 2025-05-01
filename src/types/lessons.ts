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
    textContent: string;
    order: number;
    status: 'draft' | 'published' | 'archived';
    videoUrl?: string;
    materials: string[];
    imageUrls: string[];
    isPreview: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

export interface LessonsState {
    lessons: Lesson[];
    selectedLesson: Lesson | null;
    filters: {
        search: string;
        status: string;
        instructor: string;
    };
    pagination: PaginationState;
    error: string | null;
    loading: boolean;
}