import {selectFilters, setRoleFilter, setSortBy} from "@/redux/features/users/usersSlice";
import {useDispatch, useSelector} from "react-redux";

// components/UserFilters.tsx
export const UserFilters: React.FC = () => {
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);

    return (
        <div className="flex gap-4">
            <select
                value={filters.role || ''}
                onChange={(e) => dispatch(setRoleFilter(e.target.value || null))}
                className="rounded-md border p-2"
            >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
            </select>
            <select
                value={filters.sortBy}
                onChange={(e) => dispatch(setSortBy(e.target.value))}
                className="rounded-md border p-2"
            >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
            </select>
        </div>
    );
};