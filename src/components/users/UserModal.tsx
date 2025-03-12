import { useCreateUserMutation, useGetUsersQuery, useUpdateUserMutation } from "@/redux/features/users/usersApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { User } from "@/types/user";
import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectFilters, selectPagination } from "@/redux/features/users/usersSlice";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SelectedSkill } from "@/components/ui/badge-selector";
import {SkillsEditDialog} from "../Profile/SkillsEditDialog.tsx";

interface UserFormData {
    name: string;
    email: string;
    phone: number | "";
    roles: string | string[];
    password?: string;
    skills?: SelectedSkill[];
}

export const UserModal: React.FC<{
    open: boolean;
    onClose: () => void;
    user?: User;
}> = ({ open, onClose, user }) => {
    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();
    const [error, setError] = useState<string | null>(null);
    const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>(
        user?.skills.map(skill => ({
            name: skill.name,
            proficiencyLevel: skill.proficiencyLevel
        })) || []
    );

    const filters = useSelector(selectFilters);
    const pagination = useSelector(selectPagination);

    const { refetch: getUsers } = useGetUsersQuery({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search,
    });

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<UserFormData>({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            roles: user?.roles?.[0] || 'user',
            skills: selectedSkills,
        }
    });

    const handleSaveSkills = async (skills: SelectedSkill[]) => {
        try {
            if (user) {
                await updateUser({
                    id: user._id,
                    data: {
                        ...user,
                        skills: skills.map(skill => ({
                            name: skill.name,
                            proficiencyLevel: skill.proficiencyLevel,
                            description: ''
                        }))
                    }
                }).unwrap();
                setSelectedSkills(skills);
                await getUsers();
            }
        } catch (error) {
            setError('Failed to update skills');
            console.error('Error updating skills:', error);
        }
    };

    const onSubmit = async (data: UserFormData) => {
        try {
            const rolesArray = Array.isArray(data.roles) ? data.roles : [data.roles];
            if (user) {
                await updateUser({
                    id: user._id,
                    data: {
                        name: data.name,
                        email: data.email,
                        phone: Number(data.phone),
                        roles: rolesArray,
                        skills: selectedSkills.map(skill => ({
                            name: skill.name,
                            proficiencyLevel: skill.proficiencyLevel,
                            description: ''
                        }))
                    }
                }).unwrap();
            } else {
                await createUser({
                    ...data,
                    phone: Number(data.phone),
                    roles: rolesArray,
                    skills: [],
                }).unwrap();
            }
            await getUsers();
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
                        <Input id="name" {...register("name", { required: "Name is required" })} />
                        {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
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
                        {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                    </div>

                    {!user && (
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                                })}
                            />
                            {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            {...register("phone", {
                                required: "Phone is required",
                                validate: (value) => !isNaN(Number(value)) || "Please enter a valid phone number",
                            })}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, "");
                                setValue("phone", numericValue ? Number(numericValue) : "");
                            }}
                        />
                        {errors.phone && <span className="text-sm text-red-500">{errors.phone.message}</span>}
                    </div>

                    <div>
                        <Label htmlFor="roles">Role</Label>
                        <select id="roles" {...register("roles")} className="w-full rounded-md border p-2">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>

                    {user && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Skills</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSkillsDialogOpen(true)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Skills
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedSkills.map((skill, index) => (
                                    <Badge key={index} variant="secondary">
                                        {skill.name} - {skill.proficiencyLevel}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div className="text-sm text-red-500">{error}</div>}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>

                <SkillsEditDialog
                    open={isSkillsDialogOpen}
                    onClose={() => setIsSkillsDialogOpen(false)}
                    user={user}
                    onSave={handleSaveSkills}
                />
            </DialogContent>
        </Dialog>
    );
};