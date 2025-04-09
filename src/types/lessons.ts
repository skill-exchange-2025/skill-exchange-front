export interface Instructor {
    _id: string;
    name: string;
    email: string;
}

export interface Lessons {
    _id: string;
    instructor: Instructor;
    title: string;
    description: string;
    duration: number;
    type: string;
    order: number;
    status: string;
    textContent: string;
    videoUrl?: string;  // Optional video URL
    materials: string[];  // Assumed to be an array of string (e.g., file URLs)
    imageUrls: string[];  // Array of image URLs
    isPreview: boolean;
    createdAt: string;
    updatedAt: string;
}
interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

interface LessonsState {
    lessons: Lessons[];
    selectedLesson: Lessons | null;
    error: string | null;
    loading: boolean;
    pagination: PaginationState;
}
