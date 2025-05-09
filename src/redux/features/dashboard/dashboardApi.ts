// features/dashboard/dashboardApi.ts
import { baseApi } from '@/redux/api/baseApi';
import {
    DashboardStats,
    GrowthData,
    SkillStat,
    ActivityData,
    Period
} from '@/types/dashboard';

// Helper function for safe data access
const getSafeValue = <T,>(value: T | undefined, fallback: T): T => {
    return value !== undefined ? value : fallback;
};

export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardSummary: builder.query<DashboardStats, void>({
            query: () => ({
                url: '/users/stats/summary',
                method: 'GET'
            }),
            transformResponse: (baseQueryReturnValue: unknown): DashboardStats => {
                const response = baseQueryReturnValue as {
                    totalUsers?: number;
                    activeUsers?: number;
                    verificationRate?: number;
                    activeRate?: number;
                    newUsersToday?: number;
                    newUsersThisWeek?: number;
                    newUsersThisMonth?: number;
                    usersByRole?: Record<string, number>;
                    usersByCountry?: Array<{ name: string; value: number }>;
                };

                return {
                    totalUsers: getSafeValue(response.totalUsers, 0),
                    activeUsers: getSafeValue(response.activeUsers, 0),
                    verificationRate: getSafeValue(response.verificationRate, 0),
                    retentionRate: getSafeValue(response.activeRate, 0),
                    newUsersToday: getSafeValue(response.newUsersToday, 0),
                    newUsersThisWeek: getSafeValue(response.newUsersThisWeek, 0),
                    newUsersThisMonth: getSafeValue(response.newUsersThisMonth, 0),
                    usersByRole: getSafeValue(response.usersByRole, {}),
                    usersByCountry: getSafeValue(response.usersByCountry, []),
                    userGrowth: [],
                    userActivity: { daily: [], weekly: [] },
                    userSkills: []
                };
            }
        }),

        getGrowthData: builder.query<GrowthData[], Period>({
            query: (period) => ({
                url: `/users/stats/growth?period=${period}`,
                method: 'GET'
            }),
            transformResponse: (response: unknown): GrowthData[] => {
                return Array.isArray(response)
                    ? response.map(item => ({
                        period: item.period || '',
                        count: item.count || 0
                    }))
                    : [];
            }
        }),

        getSkillStats: builder.query<SkillStat[], void>({
            query: () => ({
                url: '/users/stats/skills',
                method: 'GET'
            }),
            transformResponse: (response: unknown): SkillStat[] => {
                return Array.isArray(response)
                    ? response.map(item => ({
                        skill: item.skill || '',
                        count: item.count || 0,
                        avgProficiency: item.avgProficiency || 0
                    }))
                    : [];
            }
        }),

        getActivityData: builder.query<ActivityData, void>({
            query: () => ({
                url: '/users/stats/activity',
                method: 'GET'
            }),
            transformResponse: (response: unknown): ActivityData => {
                const data = response as {
                    daily?: Array<{ hour: string; active: number }>;
                    weekly?: Array<{ day: string; active: number }>;
                };

                return {
                    daily: Array.isArray(data?.daily) ? data.daily : [],
                    weekly: Array.isArray(data?.weekly) ? data.weekly : []
                };
            }
        })
    }),
    overrideExisting: false
});

export const {
    useGetDashboardSummaryQuery,
    useGetGrowthDataQuery,
    useGetSkillStatsQuery,
    useGetActivityDataQuery
} = dashboardApi;