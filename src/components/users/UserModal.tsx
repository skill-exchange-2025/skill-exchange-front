import { useCreateUserMutation, useUpdateUserMutation } from "@/redux/features/users/usersApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { User } from "@/types/user";
import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface UserFormData {
    name: string;
    email: string;
    phone: string;
    roles: string[];
    password?: string;
}

export const UserModal: React.FC<{
    open: boolean;
    onClose: () => void;
    user?: User
}> = ({ open, onClose, user }) => {
    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone?.toString() || '',
            roles: user?.roles || ['user'],
        }
    });

    const onSubmit = async (data: UserFormData) => {
        try {
            if (user) {
                await updateUser({
                    id: user._id,
                    data: {
                        name: data.name,
                        email: data.email,
                        phone: Number(data.phone),
                        roles: data.roles,
                    }
                }).unwrap();
            } else {
                await createUser({
                    ...data,
                    phone: Number(data.phone)
                }).unwrap();
            }
            onClose();
        } catch (error) {
            setError('Failed to save user');
            console.error('Error saving user:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && (
                            <span className="text-sm text-red-500">{errors.name.message}</span>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && (
                            <span className="text-sm text-red-500">{errors.email.message}</span>
                        )}
                    </div>

                    {!user && (
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            {errors.password && (
                                <span className="text-sm text-red-500">{errors.password.message}</span>
                            )}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            {...register("phone", {
                                required: "Phone is required",
                                pattern: {
                                    value: /^\d+$/,
                                    message: "Please enter a valid phone number"
                                }
                            })}
                        />
                        {errors.phone && (
                            <span className="text-sm text-red-500">{errors.phone.message}</span>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="roles">Role</Label>
                        <select
                            id="roles"
                            {...register("roles")}
                            className="w-full rounded-md border p-2"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500">{error}</div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};