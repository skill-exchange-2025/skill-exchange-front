// src/components/friends/SendFriendRequest.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { useSendFriendRequestMutation } from '@/redux/features/friends/friendRequestApi';
import { toast } from '@/hooks/use-toast';

export const SendFriendRequest: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [sendRequest, { isLoading }] = useSendFriendRequestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await sendRequest({ email }).unwrap();
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully",
      });
      setEmail('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send friend request. Please check the email and try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Enter friend's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" disabled={isLoading}>
        <UserPlus className="h-4 w-4 mr-2" />
        Send Request
      </Button>
    </form>
  );
};