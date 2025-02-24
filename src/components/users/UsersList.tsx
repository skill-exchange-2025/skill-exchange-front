import { useDeleteUserMutation, useGetUsersQuery } from "@/redux/features/users/usersApi";
import { User } from "@/types/user";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSelector } from "react-redux";
import { selectFilters, selectPagination } from "@/redux/features/users/usersSlice.ts";
import { useState } from "react";

// UsersList.tsx
export const UsersList: React.FC<{ users: User[] }> = ({ users }) => {
    const [deleteUser] = useDeleteUserMutation();
    const filters = useSelector(selectFilters);
    const pagination = useSelector(selectPagination);
    const {refetch: getUsers } = useGetUsersQuery({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search,
    });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = async () => {
        if (selectedUser) {
            await deleteUser(selectedUser._id);
            await getUsers();
            setIsDialogOpen(false);
        }
    };

    return (
        <Card className="p-4">
            <h2 className="text-lg font-bold mb-4">Users</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="outline">Edit</Button>
                                <Dialog open={isDialogOpen && selectedUser?._id === user._id} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" onClick={() => { setSelectedUser(user); setIsDialogOpen(true); }}>
                                            Delete
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Confirm Deletion</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};
