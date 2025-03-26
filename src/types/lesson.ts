export interface Lesson {
    _id: string;
    title: string;
    description: string;
    content: string;
    listingId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLessonDto {
    title: string;
    description: string;
    content: string;
    listingId: string;
}

export interface UpdateLessonDto {
    title?: string;
    description?: string;
    content?: string;
}