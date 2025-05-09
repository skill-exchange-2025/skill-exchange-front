export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    verificationRate: number;
    retentionRate: number; // Mapped from backend's activeRate
    usersByRole: Record<string, number>;
    usersByCountry: Array<{ name: string; value: number }>;
    userGrowth: Array<{ month: string; users: number }>;
    userActivity: {
        daily: Array<{ hour: string; active: number }>;
        weekly: Array<{ day: string; active: number }>;
    };
    userSkills: Array<{ name: string; count: number }>;
}

// Match backend API response structure
export interface GrowthData {
    period: string;
    count: number;
}

export interface SkillStat {
    skill: string;
    count: number;
    avgProficiency: number;
}

export interface ActivityData {
    daily: Array<{ hour: string; active: number }>;
    weekly: Array<{ day: string; active: number }>;
}

export type Period = 'day' | 'week' | 'month' | 'year';