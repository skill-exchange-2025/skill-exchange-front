import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, User, UserMinus } from 'lucide-react';
import {
  useSearchUsersQuery,
  useSendFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetFriendRequestsQuery,
  useGetFriendsQuery,
} from '@/redux/features/friends/friendRequestApi';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector } from '@/redux/hooks';

export const SendFriendRequest: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Queries and mutations
  const { data: suggestions = []} = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 1,
  });
  const { data: friendRequests = [] } = useGetFriendRequestsQuery();
  const { data: friends = [] } = useGetFriendsQuery();
  const [sendRequest, { isLoading: isSending }] = useSendFriendRequestMutation();
  const [cancelRequest, { isLoading: isCancelling }] = useCancelFriendRequestMutation();

  // Helper functions
  const isAlreadyFriend = (userId: string) => {
    return friends?.some(friend => friend._id === userId);
  };

  const getPendingRequest = (userId: string) => {
    return friendRequests.find(
      (request) =>
        (request.sender._id === userId || request.recipient._id === userId) &&
        request.status === 'pending'
    );
  };

  // Filter suggestions to remove current user, friends, and users with pending requests
  const filteredSuggestions = suggestions.filter((user) => {
    if (user._id === currentUser?._id) return false;
    if (isAlreadyFriend(user._id)) return false;
    
    const hasPendingRequest = friendRequests.some(
      request => 
        (request.sender._id === user._id || request.recipient._id === user._id) &&
        request.status === 'pending'
    );
    
    return !hasPendingRequest;
  });

  const handleFriendAction = async (user: any) => {
    if (isAlreadyFriend(user._id)) {
      toast({
        variant: 'destructive',
        title: 'Already Friends',
        description: 'You are already friends with this user',
      });
      return;
    }
  
    const pendingRequest = getPendingRequest(user._id);
    try {
      if (pendingRequest) {
        await cancelRequest(pendingRequest._id).unwrap();
        toast({
          title: 'Friend request cancelled',
          description: 'The friend request has been cancelled successfully',
        });
      } else {
        await sendRequest({ 
          email: user.email 
        }).unwrap();
  
        toast({
          title: 'Friend request sent',
          description: 'Your friend request has been sent successfully',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.data?.message || (pendingRequest 
          ? 'Failed to cancel friend request'
          : 'Failed to send friend request'),
      });
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      {searchTerm.length >= 1 && filteredSuggestions.length > 0 && (
        <div className="absolute w-full bg-background border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((user) => {
            const pendingRequest = getPendingRequest(user._id);
            const isFriend = isAlreadyFriend(user._id);
            
            return (
              <div key={user._id} className="p-3 border-b hover:bg-accent cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={
                          user.avatarUrl
                            ? `http://localhost:5000${user.avatarUrl}`
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={pendingRequest ? "destructive" : "default"}
                    onClick={() => handleFriendAction(user)}
                    disabled={isSending || isCancelling || isFriend}
                  >
                    {isFriend ? (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Friends
                      </>
                    ) : pendingRequest ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};