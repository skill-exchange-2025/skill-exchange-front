import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useSearchUsersQuery } from '@/redux/features/friends/friendRequestApi';
import { User } from '@/types/user';

interface UserSearchProps {
  onSelectUser: (user: User) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users, isLoading } = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 2,
  });

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search users by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm.length >= 2 && users && (
        <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg z-10">
          {users.map((user) => (
            <div
              key={user._id}
              className="p-2 hover:bg-accent cursor-pointer"
              onClick={() => {
                onSelectUser(user);
                setSearchTerm('');
              }}
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-2 text-muted-foreground">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};