import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  setCurrentChannel,
  setMessages,
} from '../../redux/features/messaging/channelsSlice';
import ChannelSidebar from '../../components/messaging/ChannelSidebar';
import MessageList from '../../components/messaging/MessageList';
import MessageInput from '../../components/messaging/MessageInput';
import socketService from '../../services/socket.service';
import {
  Hash,
  Archive,
  InfoIcon,
  Loader2,
  Users,
  CalendarIcon,
  LogIn,
  Menu,
  ChevronLeft,
  LogOut,
  Search,
  X,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  useJoinChannelMutation,
  useLeaveChannelMutation,
} from '../../redux/api/messagingApi';
import { useToast } from '../../hooks/use-toast';

const ChannelPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [showChannelDetails, setShowChannelDetails] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [joinChannel, { isLoading: isJoining }] = useJoinChannelMutation();
  const [leaveChannel, { isLoading: isLeaving }] = useLeaveChannelMutation();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { channels, currentChannel, lastSelectedChannelId, messages } =
    useAppSelector((state) => state.channels);
  const { user } = useAppSelector((state) => state.auth);

  // Check if user is a member of the current channel
  const isChannelMember = () => {
    if (!user || !currentChannel) return false;
    return currentChannel.members.some((member) => {
      if (typeof member === 'string') {
        return member === user._id;
      }
      return member._id === user._id;
    });
  };

  // Handle joining a channel
  const handleJoinChannel = async () => {
    if (!channelId || !user) return;

    try {
      await joinChannel(channelId).unwrap();
      toast({
        title: 'Joined channel',
        description: 'You have successfully joined the channel',
      });

      // Notify via socket
      socketService.joinChannel(channelId);

      // Manually trigger system message immediately
      socketService.triggerSystemMessage('join', channelId, {
        _id: user._id || '',
        name: user.name || 'You',
      });
    } catch (error) {
      console.error('Failed to join channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to join channel',
        variant: 'destructive',
      });
    }
  };

  // Handle leaving a channel
  const handleLeaveChannel = async () => {
    if (!channelId || !user) return;

    try {
      // Manually trigger system message before leaving
      socketService.triggerSystemMessage('leave', channelId, {
        _id: user._id || '',
        name: user.name || 'You',
      });

      await leaveChannel(channelId).unwrap();
      toast({
        title: 'Left channel',
        description: 'You have successfully left the channel',
      });

      // Notify via socket
      socketService.leaveChannel(channelId);

      // Redirect to channel list after leaving
      navigate('/messaging');
    } catch (error) {
      console.error('Failed to leave channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave channel',
        variant: 'destructive',
      });
    }
  };

  // Redirect to saved channel if no channelId is provided in URL
  useEffect(() => {
    if (!channelId && lastSelectedChannelId && channels.length > 0) {
      const savedChannel = channels.find(
        (c) => c._id === lastSelectedChannelId
      );
      if (savedChannel) {
        navigate(`/messaging/${lastSelectedChannelId}`);
      }
    }
  }, [channelId, lastSelectedChannelId, channels, navigate]);

  // Find and set the current channel when the component mounts or channelId changes
  useEffect(() => {
    if (!channelId) return;

    setLoading(true);

    // First leave any previously joined channel
    if (currentChannel && currentChannel._id !== channelId) {
      socketService.leaveChannel(currentChannel._id);
      // Reset messages to prevent showing messages from previous channel
      dispatch(setMessages({ messages: [], total: 0 }));
    }

    if (channelId && channels.length > 0) {
      const channel = channels.find((c) => c._id === channelId);
      if (channel) {
        dispatch(setCurrentChannel(channel));
        socketService.joinChannel(channelId);
        setLoading(false);
      } else {
        // If channel not found, try to use the saved channel
        if (lastSelectedChannelId) {
          const savedChannel = channels.find(
            (c) => c._id === lastSelectedChannelId
          );
          if (savedChannel) {
            navigate(`/messaging/${lastSelectedChannelId}`);
          } else if (channels[0]) {
            // If saved channel not found, redirect to the first available channel
            navigate(`/messaging/${channels[0]._id}`);
          }
        } else if (channels[0]) {
          // If no saved channel, redirect to the first available channel
          navigate(`/messaging/${channels[0]._id}`);
        }
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    // Clean up when unmounting or changing channels
    return () => {
      if (channelId) {
        socketService.leaveChannel(channelId);
      }
    };
  }, [
    channelId,
    channels,
    dispatch,
    navigate,
    currentChannel,
    lastSelectedChannelId,
  ]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  // Get member initials for avatar
  const getMemberInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle search mode
  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    // Simple client-side search for now
    // In a real app, you'd want to call an API endpoint for searching messages
    if (e.target.value.trim()) {
      const results = messages.filter((msg: any) => {
        if (typeof msg.content === 'string') {
          return msg.content
            .toLowerCase()
            .includes(e.target.value.toLowerCase());
        }
        return false;
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Loading view
  const renderLoadingView = () => (
    <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
      <div className="flex flex-col items-center">
        <Loader2 size={40} className="animate-spin text-green-500 mb-2" />
        <span className="text-gray-500">Loading channel...</span>
      </div>
    </div>
  );

  // Empty view - no channel selected
  const renderEmptyView = () => (
    <div className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
      <div className="p-8 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
        <Hash size={64} className="opacity-60" />
      </div>
      <h2 className="text-2xl font-semibold mb-3">No channel selected</h2>
      <p className="text-base text-center max-w-md px-4">
        Select a channel from the sidebar or create a new one to start messaging
      </p>
    </div>
  );

  // Join prompt view - when user is not a member of the channel
  const renderJoinPromptView = () => (
    <div className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
      <div className="p-8 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
        <Hash size={64} className="opacity-60" />
      </div>
      <h2 className="text-2xl font-semibold mb-3">Join this channel</h2>
      <p className="text-base text-center max-w-md px-4 mb-6">
        You need to join #{currentChannel?.name} to view messages
      </p>
      <Button
        onClick={handleJoinChannel}
        disabled={isJoining}
        className="bg-green-600 hover:bg-green-700"
      >
        <LogIn size={16} className="mr-2" />
        {isJoining ? 'Joining...' : 'Join Channel'}
      </Button>
    </div>
  );

  // Channel header
  const renderChannelHeader = () => (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center">
        {/* Sidebar toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden lg:flex"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </Button>
        <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 mr-3">
          {currentChannel?.isArchived ? (
            <Archive size={22} className="text-gray-500" />
          ) : (
            <Hash size={22} className="text-green-500 dark:text-green-400" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {currentChannel?.name}
            {currentChannel?.isArchived && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                Archived
              </span>
            )}
          </h2>
          {currentChannel?.topic && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
              {currentChannel.topic}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        {/* Search input that appears when searching */}
        {isSearching ? (
          <div className="relative mr-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search in channel..."
              className="h-9 py-2 pl-9 pr-4 w-[250px] text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
            />
            <Search
              size={16}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            />
            <button
              onClick={toggleSearch}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleSearch}
          >
            <Search size={18} className="text-gray-500" />
          </Button>
        )}

        <div className="flex items-center mr-4">
          <Users size={16} className="text-gray-500 mr-1" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentChannel?.members?.length || 0} members
          </span>
        </div>

        {/* Leave Channel Button - Only shown for members */}
        {isChannelMember() && !currentChannel?.isArchived && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveChannel}
            disabled={isLeaving}
            className="mr-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} className="mr-1" />
            Leave
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setShowChannelDetails(true)}
        >
          <InfoIcon size={18} className="text-gray-500" />
        </Button>
      </div>
    </div>
  );

  // Channel content view - for members only
  const renderChannelContent = () => (
    <div className="flex flex-col h-full">
      {renderChannelHeader()}

      {/* Message area container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Search results panel */}
        {isSearching && searchQuery.trim() && (
          <div className="absolute top-0 right-0 w-72 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-10 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-20">
              <h3 className="text-sm font-medium flex items-center justify-between">
                <span>Search Results</span>
                <span className="text-xs text-gray-500">
                  {searchResults.length} found
                </span>
              </h3>
            </div>

            <div className="p-2">
              {searchResults.length > 0 ? (
                searchResults.map((message: any) => (
                  <div
                    key={message._id}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mb-1 cursor-pointer"
                    onClick={() => {
                      // Scroll to message logic would go here
                      toast({
                        title: 'Message found',
                        description: 'Scrolled to message',
                      });
                    }}
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      {message.sender?.name || 'Unknown user'}
                      <span className="ml-2">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                    <p className="text-sm line-clamp-2">{message.content}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Search size={48} className="mb-4 opacity-40" />
                  <p className="text-center">No messages found</p>
                  <p className="text-xs text-center mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message list area */}
        <div className="flex-1 overflow-hidden">
          {channelId && <MessageList channelId={channelId} />}
        </div>

        {/* Message input */}
        {!currentChannel?.isArchived && channelId && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <MessageInput channelId={channelId} />
          </div>
        )}
      </div>
    </div>
  );

  // Main content renderer
  const renderMainContent = () => {
    if (loading) return renderLoadingView();
    if (!currentChannel) return renderEmptyView();
    if (!isChannelMember()) return renderJoinPromptView();
    return renderChannelContent();
  };

  // Channel details dialog
  const renderChannelDetailsDialog = () => {
    if (!currentChannel) return null;

    return (
      <Dialog open={showChannelDetails} onOpenChange={setShowChannelDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 mr-3">
                {currentChannel.isArchived ? (
                  <Archive size={18} className="text-gray-500" />
                ) : (
                  <Hash
                    size={18}
                    className="text-green-500 dark:text-green-400"
                  />
                )}
              </div>
              <span>{currentChannel.name}</span>
              {currentChannel.isArchived && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Archived
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Channel details and members</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Topic */}
            {currentChannel.topic && (
              <div>
                <h3 className="text-sm font-semibold mb-1">Topic</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentChannel.topic}
                </p>
              </div>
            )}

            {/* Created date */}
            {currentChannel.createdAt && (
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon size={14} className="mr-2" />
                <span>Created on {formatDate(currentChannel.createdAt)}</span>
              </div>
            )}

            {/* Member list */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <Users size={14} className="mr-2" />
                Members ({currentChannel.members?.length || 0})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {currentChannel.members?.map((member: any) => (
                  <div
                    key={typeof member === 'string' ? member : member._id}
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {getMemberInitials(
                          typeof member === 'string'
                            ? 'Unknown User'
                            : member.name
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {typeof member === 'string'
                          ? 'Unknown User'
                          : member.name}
                      </p>
                      {typeof member !== 'string' && member.email && (
                        <p className="text-xs text-gray-500">{member.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar toggle button for mobile/small screens that's always visible */}
      {sidebarCollapsed && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-20 md:hidden shadow-md bg-white"
          onClick={toggleSidebar}
        >
          <Menu size={18} />
        </Button>
      )}

      {/* Channel sidebar - collapsible */}
      <div
        className={`border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
        }`}
      >
        <ChannelSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderMainContent()}
      </div>

      {/* Channel Details Dialog */}
      {renderChannelDetailsDialog()}
    </div>
  );
};

export default ChannelPage;
