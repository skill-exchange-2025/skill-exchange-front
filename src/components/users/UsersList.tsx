import {useDeleteUserMutation } from "@/redux/features/users/usersApi";
import { User } from "@/types/user";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// components/UsersList.tsx
export const UsersList: React.FC<{ users: User[] }> = ({ users }) => {
    //const [updateUser] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();
    console.log("users",users)
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteUser(id);
        }
    };

    return (
        <div className="space-y-4">
            {users.map((user) => (
                <Card key={user._id} className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => {}}>Edit</Button>
                            <Button variant="destructive" onClick={() => handleDelete(user._id)}>Delete</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};