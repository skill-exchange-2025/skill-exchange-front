import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, User, UserMinus } from 'lucide-react'; // Add UserMinus icon
import {
  useSearchUsersQuery,
  useSendFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetFriendRequestsQuery,
  friendRequestApi,
} from '@/redux/features/friends/friendRequestApi';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector } from '@/redux/hooks';
import { useCheckFriendStatusQuery } from '@/redux/features/friends/friendRequestApi';

export const SendFriendRequest: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const [searchTerm, setSearchTerm] = useState('');
  const { data: suggestions = [], isLoading: isSearching } = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 1,
  });
  
  // Get current friend requests to check status
  const { data: friendRequests = [] } = useGetFriendRequestsQuery();
  
  const [sendRequest, { isLoading: isSending }] = useSendFriendRequestMutation();
  const [cancelRequest, { isLoading: isCancelling }] = useCancelFriendRequestMutation();

  
  // Function to check if a request is pending for a user
  const isPendingRequest = (userId: string) => {
    return friendRequests.some(
      (request) =>
        (request.recipient._id === userId || request.sender._id === userId) &&
        request.status === 'pending'
    );
  };
  
  const getPendingRequest = (userId: string) => {
    return friendRequests.find(
      (request) =>
        (request.sender._id === userId || request.recipient._id === userId) &&
        request.status === 'pending'
    );
  };
  
  
  
  // Function to get request ID for a user
  const getRequestId = (userName: string) => {
    const request = friendRequests.find(request => 
      request.sender.name === userName || request.recipient.name === userName
    );
    return request?._id;
  };

  const handleFriendAction = async (user: any) => {
    const pendingRequest = getPendingRequest(user._id);
    try {
      if (pendingRequest) {
        await cancelRequest(pendingRequest._id).unwrap();
        toast({
          title: 'Friend request cancelled',
          description: 'The friend request has been cancelled successfully',
        });
      } else {
        await sendRequest({ name: user.name }).unwrap();
  
  
        toast({
          title: 'Friend request sent',
          description: 'Your friend request has been sent successfully',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: pendingRequest 
          ? 'Failed to cancel friend request'
          : 'Failed to send friend request',
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
      {searchTerm.length >= 1 && suggestions.length > 0 && (
        <div className="absolute w-full bg-background border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
         {suggestions.map((user) => {
  const pendingRequest = getPendingRequest(user._id);
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
          disabled={isSending || isCancelling}
        >
          {pendingRequest ? (
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