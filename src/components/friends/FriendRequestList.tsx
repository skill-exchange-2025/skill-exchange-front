// src/components/friends/FriendRequestList.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetFriendRequestsQuery } from '@/redux/features/friends/friendRequestApi';
import { FriendRequestItem } from './FriendRequestItem';

export const FriendRequestList: React.FC = () => {
  const { data: friendRequests, isLoading, error } = useGetFriendRequestsQuery();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load friend requests. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Friend Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {friendRequests?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No friend requests at the moment
          </p>
        ) : (
          friendRequests?.map((request) => (
            <FriendRequestItem key={request._id} request={request} />
          ))
        )}
      </CardContent>
    </Card>
  );
};