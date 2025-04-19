// src/pages/friends.tsx
import { FriendRequestList } from '@/components/friends/FriendRequestList';
import { SendFriendRequest } from '@/components/friends/SendFriendRequest';
import { Card,CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetFriendsQuery } from '@/redux/features/friends/friendRequestApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // assuming you're re-exporting Radix Avatar here
import { User } from 'lucide-react';

export default function FriendsPage() {
  const { data: friends, isLoading } = useGetFriendsQuery();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends?.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage
                          src={`http://localhost:5000${friend.avatarUrl}`}
                          alt={friend.name}
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{friend.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Friend Requests Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Friend</CardTitle>
            </CardHeader>
            <CardContent>
              <SendFriendRequest />
            </CardContent>
          </Card>
          <FriendRequestList />
        </div>
      </div>
    </div>
  );
}