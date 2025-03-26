import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lesson } from '@/types/lesson';

export interface LessonsState {
    lessons: Lesson[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: LessonsState = {
    lessons: [],
    status: 'idle',
    error: null,
};

const lessonsSlice = createSlice({
    name: 'lessons',
    initialState,
    reducers: {
        setLessons: (state, action: PayloadAction<Lesson[]>) => {
            state.lessons = action.payload;
        },
        addLesson: (state, action: PayloadAction<Lesson>) => {
            state.lessons.push(action.payload);
        },
        updateLesson: (state, action: PayloadAction<Lesson>) => {
            const index = state.lessons.findIndex(lesson => lesson._id === action.payload._id);
            if (index !== -1) {
                state.lessons[index] = action.payload;
            }
        },
        removeLesson: (state, action: PayloadAction<string>) => {
            state.lessons = state.lessons.filter(lesson => lesson._id !== action.payload);
        },
    },
});

export const lessonsActions = lessonsSlice.actions;

export const { setLessons, addLesson, updateLesson, removeLesson } = lessonsSlice.actions;

export const lessonsReducer = lessonsSlice.reducer;

export default lessonsReducer;