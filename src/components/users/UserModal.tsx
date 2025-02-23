import { useCreateUserMutation, useUpdateUserMutation } from "@/redux/features/users/usersApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { User } from "@/types/user";
import { Label } from "@radix-ui/react-label";
// components/UserModal.tsx
export const UserModal: React.FC<{ open: boolean; onClose: () => void; user?: User }> = ({
                                                                                             open,
                                                                                             onClose,
                                                                                             user
                                                                                         }) => {
    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();

    const handleSubmit = async (data: any) => {
        try {
            if (user) {
                await updateUser({ id: user._id, data });
            } else {
                await createUser(data);
            }
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={user?.name} />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" defaultValue={user?.phone} />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <select id="role" defaultValue={user?.roles?.[0]} className="w-full rounded-md border p-2">
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MODERATOR">Moderator</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};