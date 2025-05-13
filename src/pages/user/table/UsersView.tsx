// UsersView.tsx
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useGetUserMetricsQuery, useGetUsersQuery} from '@/redux/features/users/usersApi';
import {
    selectFilters,
    selectPagination,
    selectUserPreferences,
    setCurrentPage,
    setSearchTerm
} from '@/redux/features/users/usersSlice';
import {UsersList} from '@/components/users/UsersList';
import {UsersGrid} from '@/components/users/UsersGrid';
import {UserFilters} from '@/components/users/UserFilters';
import {UserMetrics} from '@/components/users/UserMetrics';
import {Pagination} from '@/components/users/Pagination';
import {UserModal} from '@/components/users/UserModal';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent} from '@/components/ui/card';
import {Plus} from 'lucide-react';

export const UsersView: React.FC = () => {
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);
    const pagination = useSelector(selectPagination);
    const { viewMode } = useSelector(selectUserPreferences);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const { data: usersData, isLoading } = useGetUsersQuery({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search,
    });

    const { data: metrics } = useGetUserMetricsQuery();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>

            </div>

            {/* Metrics Cards */}
            <UserMetrics metrics={metrics} />

            {/* Filters Section */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-4 items-center">
                        <UserFilters />
                        <Input
                            placeholder="Search users..."
                            value={filters.search}
                            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                            className="max-w-sm"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Users List/Grid */}
            {viewMode === 'list' ? (
                <UsersList users={usersData?.data || []} />
            ) : (
                <UsersGrid users={usersData?.data || []} />
            )}

            {/* Pagination */}
            <Pagination
                currentPage={pagination.currentPage}
                totalPages={Math.ceil((usersData?.total || 0) / pagination.itemsPerPage)}
                onPageChange={(page) => dispatch(setCurrentPage(page))}
            />

            {/* User Modal */}
            <UserModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

