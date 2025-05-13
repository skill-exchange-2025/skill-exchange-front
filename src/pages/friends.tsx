import { useState } from 'react';
import { FriendRequestList } from '@/components/friends/FriendRequestList';
import { SendFriendRequest } from '@/components/friends/SendFriendRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetFriendsQuery, useGetSentFriendRequestsQuery, useCancelFriendRequestMutation } from '@/redux/features/friends/friendRequestApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import PrivateMessageChat from '@/components/privatemsgs/PrivateMessageChat';

// Add SentFriendRequestList component
const SentFriendRequestList = () => {
  const { data: sentRequests, isLoading } = useGetSentFriendRequestsQuery();
  const [cancelRequest] = useCancelFriendRequestMutation();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sentRequests?.map((request) => (
            <div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{request.recipient.name}</h4>
                  <p className="text-sm text-muted-foreground">{request.recipient.email}</p>
                </div>
              </div>
              <button
                onClick={() => cancelRequest(request._id)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Cancel
              </button>
            </div>
          ))}
          {sentRequests?.length === 0 && (
            <p className="text-center text-muted-foreground">No pending sent requests</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function FriendsPage() {
  const { data: friends, isLoading } = useGetFriendsQuery();
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const handleFriendClick = (friend: any) => {
    if (selectedFriend && selectedFriend._id === friend._id) {
      setSelectedFriend(null);
    } else {
      setSelectedFriend(friend);
    }
  };

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
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => handleFriendClick(friend)}
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

          {/* Chat Section */}
          {selectedFriend && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Chat with {selectedFriend.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <PrivateMessageChat
                  recipientId={selectedFriend._id}
                  recipientName={selectedFriend.name}
                />
              </CardContent>
            </Card>
          )}
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
          <SentFriendRequestList /> {/* Add the new component */}
        </div>
      </div>
    </div>
  );
}