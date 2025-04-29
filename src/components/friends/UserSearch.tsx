import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSearchUsersQuery, useGetFriendRequestsQuery, useGetFriendsQuery } from '@/redux/features/friends/friendRequestApi';
import { User } from '@/types/user';

interface UserSearchProps {
  onSelectUser: (user: User) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: users, isLoading: isSearching } = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 2,
  });

  const { data: friendRequests = [] } = useGetFriendRequestsQuery();
  const { data: friends = [] } = useGetFriendsQuery();

  // Enhanced filtering logic
  const filteredUsers = users?.filter((user) => {
    // Check if there's any pending friend request (sent or received)
    const hasPendingRequest = friendRequests.some(
      (request) => {
        const isPending = request.status === 'pending';
        const isInvolved = request.sender._id === user._id || request.recipient._id === user._id;
        return isPending && isInvolved;
      }
    );

    // Check if the user is already a friend
    const isFriend = friends.some((friend) => friend._id === user._id);

    // Only include users who are neither friends nor have pending requests
    return !hasPendingRequest && !isFriend;
  });

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search users by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm.length >= 2 && (
        <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg z-10">
          {isSearching ? (
            <div className="p-2 text-muted-foreground">Searching...</div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
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
            ))
          ) : (
            <div className="p-2 text-muted-foreground">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};