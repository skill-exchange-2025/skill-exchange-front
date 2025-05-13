// src/routes/AdminRoutes.tsx
import {Navigate, useRoutes} from 'react-router-dom';
import {routeGenerator} from "@/utils/routeGenerator";
import {adminPaths} from "./admin.routes";
import {useAppSelector} from '@/redux/hooks';
import {useCurrentUser} from '@/redux/features/auth/authSlice';

// src/routes/AdminRoutes.tsx
const AdminRoutes = () => {
    const user = useAppSelector(useCurrentUser);
    const userPermissions = user?.permissions || [];
    const routes = routeGenerator(adminPaths, userPermissions);

    // Add catch-all unauthorized route
    const finalRoutes = [
        ...routes,
        { path: "*", element: <Navigate to="/admin/unauthorized" replace /> }
    ];

    return useRoutes(finalRoutes);
};

export default AdminRoutes;