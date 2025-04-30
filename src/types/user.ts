interface Skill {
    _id: string;
    name: string;
    description: string;
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface DesiredSkill {
    _id: string;
    name: string;
    description: string;
    desiredProficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface User {
    _id: string;
    email: string;
    name: string;
    phone: number;
    isActive: boolean;
    roles: string[];
    permissions: string[];
    permissionGroups: string[];
    skills: Skill[];
    desiredSkills: DesiredSkill[];
    avatarUrl?: string;
}
export interface FriendRequest {
    _id: string;
    sender: User;
    recipient: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
  }
  export interface PrivateMessage {
    _id: string;
    sender: {
      _id: string;
      name: string;
    };
    recipient: {
      _id: string;
      name: string;
    };
    reactions: Array<{
        user: string;
        type: string;
      }>;
    content: string;
    createdAt: string;
    updatedAt: string;
    replyTo?: {
      _id: string;
      content: string;
      sender: {
        _id: string;
        name: string;
      };
    } | null;
  }

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    
}

export interface CreateUserRequest {
    email: string;
    password?: string;
    name: string;
    phone: number;
    roles: string[];
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: number;
    roles?: string[];
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ChangeRoleRequest {
    userId: string;
    roles: string[];
}

export interface UserMetrics {
    totalUsers: number;
    activeUsers: number;
    // Add other metrics as needed
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Define the state structure
export interface UsersState {
    selectedUser: User | null;
    filters: {
        search: string;
        role: string | null;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    };
    pagination: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
    };
    userPreferences: {
        viewMode: 'grid' | 'list';
        showDeactivatedUsers: boolean;
    };
    metrics: {
        totalUsers: number;
        activeUsers: number;
        lastUpdated: string | null;
    };
}