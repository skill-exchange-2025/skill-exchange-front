import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import {
    useGetDashboardSummaryQuery,
    useGetGrowthDataQuery,
    useGetSkillStatsQuery,
    useGetActivityDataQuery
} from '@/redux/features/dashboard/dashboardApi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, Activity, TrendingUp, ArrowUpRight, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const selectedPeriod = useAppSelector((state) => state.dashboard.selectedPeriod);

    // RTK Query hooks
    const {
        data: summaryData,
        isLoading: isSummaryLoading,
        error: summaryError
    } = useGetDashboardSummaryQuery();

    const {
        data: growthData,
        isLoading: isGrowthLoading,
        error: growthError
    } = useGetGrowthDataQuery(selectedPeriod);

    const {
        data: skillsData,
        isLoading: isSkillsLoading,
        error: skillsError
    } = useGetSkillStatsQuery();

    const {
        data: activityData,
        isLoading: isActivityLoading,
        error: activityError
    } = useGetActivityDataQuery();

    // Combined loading and error states
    const isLoading = isSummaryLoading || isGrowthLoading || isSkillsLoading || isActivityLoading;
    const error = summaryError || growthError || skillsError || activityError;

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <Alert variant="destructive" className="m-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{String(error)}</AlertDescription>
            </Alert>
        );
    }

    // No data state
    if (!summaryData) {
        return (
            <Alert variant="default" className="m-6">
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>Could not load dashboard statistics.</AlertDescription>
            </Alert>
        );
    }

    // Calculate percentages
    const activeUserPercentage = summaryData.totalUsers > 0
        ? Math.round((summaryData.activeUsers / summaryData.totalUsers) * 100)
        : 0;

    const weeklyGrowthPercentage = summaryData.newUsersThisWeek > 0
        ? Math.round((summaryData.newUsersToday / summaryData.newUsersThisWeek) * 100)
        : 0;

    const monthlyGrowthPercentage = summaryData.newUsersThisMonth > 0
        ? Math.round((summaryData.newUsersThisWeek / summaryData.newUsersThisMonth) * 100)
        : 0;

    // Prepare chart data
    const safeGrowth = growthData || [];
    const safeSkills = skillsData || [];
    const safeUsersByCountry = summaryData.usersByCountry || [];
    const safeUsersByRole = summaryData.usersByRole
        ? Object.entries(summaryData.usersByRole).map(([name, value]) => ({ name, value }))
        : [];
    const safeDailyActivity = activityData?.daily || [];
    const safeWeeklyActivity = activityData?.weekly || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">User Analytics Dashboard</h1>
                <Badge variant="outline" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Last Updated: Today
                </Badge>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            {summaryData.activeUsers} active ({activeUserPercentage}%)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Users (Today)</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.newUsersToday}</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                            <span className="text-green-500">
                {weeklyGrowthPercentage}%
              </span> from yesterday
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.verificationRate}%</div>
                        <Progress value={summaryData.verificationRate} className="h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.retentionRate}%</div>
                        <Progress value={summaryData.retentionRate} className="h-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Different Analytics Views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3 lg:w-1/3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">User Activity</TabsTrigger>
                    <TabsTrigger value="demographics">Demographics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Growth</CardTitle>
                            <CardDescription>Monthly user registration trend</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2 h-80">
                            {safeGrowth.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={safeGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No growth data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Distribution by Role</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 h-64">
                                {safeUsersByRole.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={safeUsersByRole}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {safeUsersByRole.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">No role data available</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="text-sm text-muted-foreground">
                                Total users by assigned role in the system
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>New User Acquisition</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm">Today</span>
                                            <span className="text-sm font-semibold">{summaryData.newUsersToday}</span>
                                        </div>
                                        <Progress
                                            value={(summaryData.newUsersToday / summaryData.newUsersThisMonth) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm">This Week</span>
                                            <span className="text-sm font-semibold">{summaryData.newUsersThisWeek}</span>
                                        </div>
                                        <Progress
                                            value={monthlyGrowthPercentage}
                                            className="h-2"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm">This Month</span>
                                            <span className="text-sm font-semibold">{summaryData.newUsersThisMonth}</span>
                                        </div>
                                        <Progress value={100} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="text-sm text-muted-foreground">
                                User acquisition breakdown by time period
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Activity Pattern</CardTitle>
                                <CardDescription>User activity throughout the day</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2 h-80">
                                {safeDailyActivity.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={safeDailyActivity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="hour" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="active" fill="#8884d8" name="Active Users" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">No daily activity data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Activity Pattern</CardTitle>
                                <CardDescription>User activity by day of week</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2 h-80">
                                {safeWeeklyActivity.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={safeWeeklyActivity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="active" fill="#82ca9d" name="Active Users" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">No weekly activity data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Demographics Tab */}
                <TabsContent value="demographics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Users by Country</CardTitle>
                                <CardDescription>Geographical distribution</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2 h-80">
                                {safeUsersByCountry.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={safeUsersByCountry}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {safeUsersByCountry.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">No country data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Skills Distribution</CardTitle>
                                <CardDescription>Most common skills among users</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2 h-80">
                                {safeSkills.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={safeSkills}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="skill" type="category" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#ff7300" name="Users" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">No skills data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;