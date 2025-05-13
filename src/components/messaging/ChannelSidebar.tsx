import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useAppSelector} from '../../redux/hooks';
import {useCreateChannelMutation, useGetChannelsQuery, useJoinChannelMutation} from '../../redux/api/messagingApi';
import {Channel} from '../../types/channel';
import {Archive, Hash, Loader2, LogIn, MessageSquare, MessageSquareOff, Plus, Search,} from 'lucide-react';
import {Button} from '../ui/button';
import NewChannelModal from './NewChannelModal';
import {Input} from '../ui/input';
import {Badge} from '../ui/badge';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import socketService from '../../services/socket.service';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '../ui/dialog';
import {Switch} from '../ui/switch';
import ChannelDetails from './ChannelDetails';
import { toast } from 'sonner';
const channelSchema = z.object({
  name: z
    .string()
    .min(3, 'Channel name must be at least 3 characters')
    .max(80, 'Channel name must be less than 80 characters')
    .regex(/^[a-z0-9-_]+$/, {
      message:
        'Channel name can only contain lowercase letters, numbers, hyphens, and underscores',
    }),
  topic: z
    .string()
    .max(250, 'Topic must be less than 250 characters')
    .optional(),
});

type ChannelFormValues = z.infer<typeof channelSchema>;

const ChannelSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [createChannel, { isLoading: isCreatingChannel }] =
    useCreateChannelMutation();
  const [joinChannel, { isLoading: isJoiningChannel }] =
    useJoinChannelMutation();

  // Access channels state from Redux store
  const channelsState = useAppSelector((state) => state.channels);
  const currentChannel = channelsState.currentChannel;
  const user = useAppSelector((state) => state.auth.user);

  // Fetch channels data
  const {
    data: channelsData,
    isLoading: isLoadingChannelsData,
    refetch: refetchChannels,
  } = useGetChannelsQuery(undefined, {
    pollingInterval: 0, // Disable polling, we'll use socket updates
    refetchOnMountOrArgChange: true,
  });

  const isLoadingChannels = channelsState.isLoadingChannels;
  const channels = channelsState.channels;

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: '',
      topic: '',
    },
  });

  // Focus search input when pressing Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle channel selection
  const handleChannelSelect = (channel: Channel) => {
    navigate(`/messaging/${channel._id}`);
  };

  const handleCreateChannel = async (values: ChannelFormValues) => {
    try {
      await createChannel({
        name: values.name,
        topic: values.topic || '',
        members: [],
      }).unwrap();
      setShowNewChannelModal(false);
      form.reset();
      toast.success('Channel created', {
        description: `#${values.name} has been created successfully`,
      });
      // Refetch channels to get the new channel in the list
      refetchChannels();
    } catch (error) {
      toast.error('Failed to create channel', {
        description:
          'There was an error creating the channel. Please try again.',
      });
    }
  };

  // Filter channels based on search term
  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if the user is a member of the channel
  const isUserChannelMember = (channel: Channel) => {
    if (!user) return false;
    return channel.members.some((member) => {
      if (typeof member === 'string') {
        return member === user._id;
      }
      return member._id === user._id;
    });
  };

  // Check if there are new messages in the channel
  const hasNewMessages = (channel: Channel) => {
    return channel.unreadCount && channel.unreadCount > 0;
  };

  // Handle joining a channel
  const handleJoinChannel = async (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to the channel

    try {
      await joinChannel(channelId).unwrap();
      toast.success('Joined channel', {
        description: 'You have successfully joined the channel',
      });

      // Navigate to the channel after joining
      navigate(`/messaging/${channelId}`);

      // Notify via socket - this will trigger the userJoinedChannel event from the server
      socketService.joinChannel(channelId);

      // Remove manual triggering of system message as it causes duplication
      // The server will emit userJoinedChannel event which will be handled automatically
    } catch (error) {
      console.error('Failed to join channel:', error);
      toast.error('Error', {
        description: 'Failed to join channel',
      });
    }
  };

  const isLoading = isLoadingChannels || isLoadingChannelsData;

  return (
    <div className="flex flex-col h-full pt-0 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Channels
          </h2>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-2.5 top-2.5 text-gray-400"
            />
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              className="pl-9 pr-4 py-1 h-9 w-40 text-sm bg-gray-100 dark:bg-gray-700 border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquareOff className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No channels available</p>
            <p className="text-sm">Create a new channel to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChannels.map((channel) => {
              const isNewMessages = hasNewMessages(channel);
              const isMember = isUserChannelMember(channel);

              return (
                <div key={channel._id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleChannelSelect(channel)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex-grow ${
                        currentChannel?._id === channel._id
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {channel.isArchived ? (
                        <Archive
                          size={18}
                          className="flex-shrink-0 text-gray-400"
                        />
                      ) : (
                        <Hash
                          size={18}
                          className={`${
                            currentChannel?._id === channel._id
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        />
                      )}
                      <span
                        className={`truncate flex-1 ${
                          channel.isArchived ? 'text-gray-500' : ''
                        }`}
                      >
                        {channel.name}
                      </span>

                      <div className="flex items-center">
                        {isNewMessages && (
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                        )}
                        {channel.isArchived && (
                          <Badge
                            variant="outline"
                            className="ml-1 py-0 h-5 text-xs text-gray-500 border-gray-300"
                          >
                            Archived
                          </Badge>
                        )}
                      </div>
                    </button>

                    {/* Join button for non-members */}
                    {!isUserChannelMember(channel) && !channel.isArchived && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-8 w-8 flex-shrink-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                        onClick={(e) => handleJoinChannel(channel._id, e)}
                        disabled={isJoiningChannel}
                        title="Join channel"
                      >
                        <LogIn size={16} />
                      </Button>
                    )}

                    {/* Channel details button */}
                    <ChannelDetails channel={channel} variant="sidebar" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setShowNewChannelModal(true)}
          disabled={channelsState.isLoadingChannels}
        >
          <Plus size={16} className="mr-1.5" />
          New Channel
        </Button>
      </div>

      <NewChannelModal
        open={showNewChannelModal}
        onOpenChange={setShowNewChannelModal}
        form={form}
        onSubmit={handleCreateChannel}
        isLoading={isCreatingChannel}
      />

      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Channel Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Appearance</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show archived channels</span>
                <Switch id="show-archived" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Notifications</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notification sounds</span>
                <Switch id="notification-sound" defaultChecked />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettingsModal(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelSidebar;
