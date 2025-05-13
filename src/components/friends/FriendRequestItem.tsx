// src/components/friends/FriendRequestItem.tsx

import React from 'react';
import { FriendRequest } from '@/types/friendRequest';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { toast } from '@/hooks/use-toast';
import { User, Check, X } from 'lucide-react';
import { useAcceptFriendRequestMutation, useRejectFriendRequestMutation } from '@/redux/features/friends/friendRequestApi';

interface FriendRequestItemProps {
  request: FriendRequest;
}

export const FriendRequestItem: React.FC<FriendRequestItemProps> = ({ request }) => {
  const [acceptRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectFriendRequestMutation();

  const handleAccept = async () => {
    try {
      await acceptRequest(request._id).unwrap();
      toast({
        title: "Friend request accepted",
        description: `You are now friends with ${request.sender.name}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept friend request",
      });
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest(request._id).unwrap();
      toast({
        title: "Friend request rejected",
        description: "The friend request has been rejected",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject friend request",
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={`http://localhost:5000${request.sender.avatarUrl}`}
            alt={request.sender.name}
          />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{request.sender.name}</h4>
          <p className="text-sm text-muted-foreground">{request.sender.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={isAccepting || isRejecting}
        >
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isAccepting || isRejecting}
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>
    </div>
  );
};