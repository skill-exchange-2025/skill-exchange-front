import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, User } from 'lucide-react';
import {
  useSearchUsersQuery,
  useSendFriendRequestMutation,
} from '@/redux/features/friends/friendRequestApi';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const SendFriendRequest: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: suggestions = [], isLoading: isSearching } = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 1,
  });

  const [sendRequest, { isLoading }] = useSendFriendRequestMutation();

  const handleSendRequest = async (name: string) => {
    try {
      await sendRequest({ name }).unwrap();
      toast({
        title: 'Friend request sent',
        description: 'Your friend request has been sent successfully',
      });
      setSearchTerm('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send friend request. Please try again.',
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
          {suggestions.map((user) => (
            <div
              key={user._id}
              className="p-3 border-b hover:bg-accent cursor-pointer"
            >
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
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendRequest(user.name)}
                  disabled={isLoading}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
