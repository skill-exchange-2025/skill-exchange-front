// components/UserMetrics.tsx
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export const UserMetrics: React.FC<{ metrics?: any }> = ({ metrics }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{metrics?.totalUsers || 0}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{metrics?.activeUsers || 0}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Verified Users</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{metrics?.verifiedUsers || 0}</p>
            </CardContent>
        </Card>
    </div>
);
