import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useCurrentUser } from '@/redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuthRedirect = () => {
    const currentUser = useAppSelector(useCurrentUser);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            if (currentUser.roles.includes('admin')) {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } else {
            navigate('/signin');
        }
    }, [currentUser, navigate]);
};