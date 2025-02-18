// src/routes/UserRoutes.tsx
import { useRoutes } from 'react-router-dom';
import { routeGenerator } from "@/utils/routeGenerator";
import { userPaths } from "./user.routes";
import { useAppSelector } from '@/redux/hooks';
import { useCurrentUser } from '@/redux/features/auth/authSlice';

const UserRoutes = () => {
    const user = useAppSelector(useCurrentUser);
    const userPermissions = user?.permissions || [];
    const routes = routeGenerator(userPaths, userPermissions);
    return useRoutes(routes);
};

export default UserRoutes;