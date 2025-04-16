import React, { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Channel } from '@/types/channel';
import { useAppSelector } from '../../redux/hooks';
import {
  useJoinChannelMutation,
  useLeaveChannelMutation,
} from '../../redux/api/messagingApi';
import {
  Users,
  Hash,
  Info,
  ExternalLink,
  LogOut,
  LogIn,
  CalendarClock,
  PenSquare,
  Archive,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import socketService from '../../services/socket.service';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ChannelDetailsProps {
  channel: Channel;
  variant?: 'default' | 'sidebar';
}

const ChannelDetails: React.FC<ChannelDetailsProps> = ({
  channel,
  variant = 'default',
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [joinChannel, { isLoading: isJoining }] = useJoinChannelMutation();

  // Check if user is a member of the channel
  const isMember = useMemo(() => {
    if (!user) return false;
    return channel.members.some((member) => {
      if (typeof member === 'string') {
        return member === user._id;
      }
      return member._id === user._id;
    });
  }, [channel.members, user]);

  const handleJoinChannel = async () => {
    try {
      await joinChannel(channel._id).unwrap();
      toast.success('Joined channel', {
        description: `You've successfully joined #${channel.name}`,
      });
      // Notify other members via socket
      socketService.joinChannel(channel._id);

      // Manually trigger the system message event
      const joinEvent = new CustomEvent('userJoinedChannel', {
        detail: {
          channelId: channel._id,
          user: {
            _id: user?._id || '',
            name: user?.name || 'Unknown User',
          },
        },
      });

      document.dispatchEvent(joinEvent);
    } catch (error) {
      console.error('Failed to join channel:', error);
      toast.error('Error', {
        description: 'Failed to join channel',
      });
    }
  };


  const getMemberInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Button styles based on variant
  const buttonClasses =
    variant === 'sidebar'
      ? 'h-8 w-8 flex-shrink-0 text-gray-500 hover:text-gray-600 hover:bg-gray-50'
      : 'h-8 w-8';

  // Sheet width based on variant
  const sheetWidth =
    variant === 'sidebar' ? 'w-[300px] sm:w-[350px]' : 'w-[340px] sm:w-[400px]';

  // Render member list
  const renderMemberList = () => {
    if (!isMember) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Join this channel to see member details</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {channel.members.map((member) => {
          const memberObj =
            typeof member === 'string'
              ? { _id: member, name: 'Unknown User' }
              : member;

          const isCurrentUser = memberObj._id === user?._id;

          return (
            <div
              key={memberObj._id}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback
                  className={`${
                    isCurrentUser
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {getMemberInitials(memberObj.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm flex-1">{memberObj.name}</span>
              {isCurrentUser && (
                <Badge
                  variant="outline"
                  className="text-xs py-0 h-5 bg-green-50 text-green-600 border-green-200"
                >
                  You
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render action button (join or leave)
  const renderActionButton = () => {
    if (!isMember) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
          onClick={handleJoinChannel}
          disabled={isJoining}
        >
          <LogIn size={14} className="mr-1" />
          Join Channel
        </Button>
      );
    }
    return null;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={buttonClasses}
          aria-label="Channel details"
        >
          <Info size={variant === 'sidebar' ? 14 : 16} />
        </Button>
      </SheetTrigger>
      <SheetContent className={sheetWidth}>
        <SheetHeader>
          <SheetTitle className="flex items-center">
            {channel.isArchived ? (
              <Archive size={18} className="mr-2 text-gray-500" />
            ) : (
              <Hash size={18} className="mr-2 text-green-500" />
            )}
            <span className="truncate">{channel.name}</span>
            {channel.isArchived && (
              <Badge variant="outline" className="ml-2 text-xs">
                Archived
              </Badge>
            )}
          </SheetTitle>
          {channel.createdAt && (
            <SheetDescription className="flex items-center text-xs text-gray-500">
              <CalendarClock size={12} className="mr-1" />
              Created on {formatDate(channel.createdAt)}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="py-4">
          <h3 className="text-sm font-medium mb-1 flex items-center">
            <PenSquare size={14} className="mr-2" />
            Topic
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 pl-6">
            {channel.topic || 'No topic set'}
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 py-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <Users size={14} className="mr-2" />
              Members ({channel.members.length})
            </h3>
            {renderActionButton()}
          </div>

          {renderMemberList()}
        </div>

        <SheetFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
          <div className="w-full">
            <Link to={`/messaging/${channel._id}`} className="w-full">
              <Button variant="secondary" size="sm" className="w-full">
                <Sparkles size={14} className="mr-2" />
                Open Channel
              </Button>
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ChannelDetails;
