import { baseApi } from "@/redux/api/baseApi";
import {ChangePasswordRequest,
    ChangeRoleRequest, CreateUserRequest, PaginatedResponse, PaginationParams, UpdateUserRequest, User, UserMetrics } from "@/types/user";



export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all users with pagination and search
        getUsers: builder.query<PaginatedResponse<User>, PaginationParams>({
            query: (params) => ({
                url: '/users',
                method: 'GET',
                params,
            }),
        }),

        // Get user by ID
        getUserById: builder.query<User, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'GET',
            }),
        }),

        // Create new user
        createUser: builder.mutation<User, CreateUserRequest>({
            query: (body) => ({
                url: '/users',
                method: 'POST',
                body,
            }),
        }),

        // Update user
        updateUser: builder.mutation<User, { id: string; data: UpdateUserRequest }>({
            query: ({ id, data }) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),

        // Delete user
        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
        }),

        // Change user password
        changePassword: builder.mutation<void, { id: string; data: ChangePasswordRequest }>({
            query: ({ id, data }) => ({
                url: `/users/${id}/change-password`,
                method: 'POST',
                body: data,
            }),
        }),

        // Get user metrics
        getUserMetrics: builder.query<UserMetrics, void>({
            query: () => ({
                url: '/users/metrics',
                method: 'GET',
            }),
        }),

        // Change user role
        changeRole: builder.mutation<User, ChangeRoleRequest>({
            query: (body) => ({
                url: '/users/change-role',
                method: 'POST',
                body,
            }),
        }),

        // Verify user
        verifyUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}/verify`,
                method: 'POST',
            }),
        }),

         // Activate user (new endpoint for activation)
         activateUser: builder.mutation<User, string>({
            query: (id) => ({
                url: `/users/${id}/activate`,
                method: 'POST',
            }),
        }),
        
          
        // desactivate user 
        updateUserStatus: builder.mutation<User, { userId: string; isActive: boolean }>({
            query: ({ userId, isActive }) => ({
              url: `/users/deactivate/${userId}`,  // This is your deactivation endpoint
              method: 'PATCH',
              body: { isActive },  // You can still send the isActive status if needed
            }),
          }),

        

    }),
});



// Export hooks for usage in components
export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useChangePasswordMutation,
    useGetUserMetricsQuery,
    useChangeRoleMutation,
    useUpdateUserStatusMutation,
    useActivateUserMutation,
    useVerifyUserMutation,
} = usersApi;