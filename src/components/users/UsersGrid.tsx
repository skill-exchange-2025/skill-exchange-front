import { User } from "@/types/user";
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";

// components/UsersGrid.tsx
export const UsersGrid: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
            <Card key={user._id} className="p-4">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                        {user.name.charAt(0)}
                    </div>
                    <h3 className="mt-2 font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-4 flex justify-center gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                </div>
            </Card>
        ))}
    </div>
);