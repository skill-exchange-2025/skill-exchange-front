// src/components/Notifications.tsx
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAppSelector } from '@/redux/hooks';
import { selectFriendRequests } from '@/redux/features/friends/friendRequestsSlice';

export const Notifications = () => {
  const friendRequests = useAppSelector(selectFriendRequests);

  useEffect(() => {
    const lastRequest = friendRequests[friendRequests.length - 1];
    if (lastRequest) {
      // Play notification sound
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {}); // Catch and ignore autoplay errors

      // Show toast notification
      toast({
        title: "New Friend Request",
        description: `${lastRequest.sender.name} sent you a friend request`,
        duration: 5000,
      });
    }
  }, [friendRequests]);

  return null;
};