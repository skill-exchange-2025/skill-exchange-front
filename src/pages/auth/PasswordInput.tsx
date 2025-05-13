import {Eye, EyeOff} from 'lucide-react';
import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {FormControl} from '@/components/ui/form';

interface PasswordInputProps {
    field: any; // Consider creating a proper type for the field prop
}

export function PasswordInput({ field }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <FormControl>
            <div className="relative">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    {...field}
                />
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </FormControl>
    );
}