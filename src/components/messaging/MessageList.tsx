import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {useGetChannelMessagesQuery} from '../../redux/api/messagingApi';
import {incrementPage, setCurrentPage, setLoading, setMessages,} from '../../redux/features/messaging/channelsSlice';
import {Message as MessageType} from '../../types/channel';
import Message from './Message';
import SystemMessage from './SystemMessage';
import {ArrowDown, Loader2, MessageSquare} from 'lucide-react';
import {Button} from '../ui/button';
import {format} from 'date-fns';
import socketService from '../../services/socket.service';

interface MessageListProps {
  channelId: string;
}

const MessageList: React.FC<MessageListProps> = ({ channelId }) => {
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const { messages, isLoadingMessages, pagination } = useAppSelector(
    (state) => state.channels
  );
  const [systemMessages, setSystemMessages] = useState<
    {
      id: string;
      type: 'join' | 'leave';
      username: string;
      timestamp: string;
      channelId: string;
    }[]
  >([]);

  // Reset pagination when channelId changes
  useEffect(() => {
    dispatch(setCurrentPage(1));
    // Reset scroll state when channel changes
    setUserHasScrolled(false);
    setIsScrolledToBottom(true);
  }, [channelId, dispatch]);

  const { data, isLoading, isFetching } = useGetChannelMessagesQuery(
    {
      channelId,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
    },
    {
      skip: !channelId,
      refetchOnMountOrArgChange: true,
    }
  );

  // Check if scrolled to bottom
  const checkScrollPosition = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    // Consider "scrolled to bottom" if within 50px of the bottom
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsScrolledToBottom(atBottom);
  };

  // Handle infinite scrolling
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    // Set that user has manually scrolled
    if (!userHasScrolled) {
      setUserHasScrolled(true);
    }

    const { scrollTop } = messagesContainerRef.current;

    // When user scrolls near the top of the container, load more messages
    if (
      scrollTop < 100 &&
      !isFetching &&
      data &&
      messages.length < data.total
    ) {
      dispatch(incrementPage());
    }

    // Update scroll position state
    checkScrollPosition();
  };

  // Update messages when data changes
  useEffect(() => {
    dispatch(setLoading({ type: 'messages', loading: isLoading }));

    if (data) {
      // Only update messages if we have valid data and channelId
      dispatch(setMessages({ messages: data.messages, total: data.total }));
    }
  }, [data, isLoading, dispatch, channelId]);

  // Run after initial render to set scroll position
  useEffect(() => {
    // Add a small delay to ensure DOM is fully rendered
    setTimeout(() => {
      checkScrollPosition();
    }, 200);
  }, []);

  // Scroll to bottom ONLY on initial load or channel change
  useEffect(() => {
    const isInitialLoad =
      messages.length > 0 && pagination.currentPage === 1 && !userHasScrolled;

    if (isInitialLoad && messagesContainerRef.current) {
      setTimeout(() => {
        const { current: container } = messagesContainerRef;
        if (container) {
          container.scrollTop = container.scrollHeight;
          checkScrollPosition();
        }
      }, 100);
    }
  }, [messages.length, pagination.currentPage, userHasScrolled]);

  // Function to manually scroll to bottom when button is clicked
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;

      // After scrolling, update the scroll state
      setTimeout(() => {
        setIsScrolledToBottom(true);
      }, 100);
    }
  };

  // Group messages by date for better organization
  const groupMessagesByDate = (messages: MessageType[]) => {
    const groups: { [key: string]: MessageType[] } = {};

    [...messages].reverse().forEach((message) => {
      if (!message.createdAt) return; // Skip messages without a valid createdAt

      const date = new Date(message.createdAt);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      const dateKey = format(date, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Format date for display
  const formatDateHeading = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  // Prepare messages with grouping by sender and date
  const messageElements = useMemo(() => {
    // Create a merged array of regular and system messages
    const allMessages = [
      ...messages.map((msg) => ({
        type: 'regular' as const,
        message: msg,
        timestamp: msg.createdAt,
      })),
      ...systemMessages.map((sysMsg) => ({
        type: 'system' as const,
        message: sysMsg,
        timestamp: sysMsg.timestamp,
      })),
    ].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group messages by date
    const messagesByDate: Record<string, any[]> = {};

    allMessages.forEach((item) => {
      const date = new Date(item.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!messagesByDate[dateKey]) {
        messagesByDate[dateKey] = [];
      }

      messagesByDate[dateKey].push(item);
    });

    // Create elements with date separators
    const elements: React.ReactNode[] = [];

    Object.keys(messagesByDate).forEach((dateKey) => {
      // Add date separator
      elements.push(
        <div key={`date-${dateKey}`} className="relative py-2 my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
              {formatDateHeading(dateKey)}
            </span>
          </div>
        </div>
      );

      // Add messages for this date
      messagesByDate[dateKey].forEach((item) => {
        if (item.type === 'system') {
          const sysMsg = item.message as (typeof systemMessages)[0];
          elements.push(
            <SystemMessage
              key={sysMsg.id}
              type={sysMsg.type}
              username={sysMsg.username}
              timestamp={sysMsg.timestamp}
            />
          );
        } else {
          const msg = item.message as MessageType;
          elements.push(<Message key={msg._id} message={msg} />);
        }
      });
    });

    return (
      <>
        {elements}
        <div ref={messagesEndRef} />
      </>
    );
  }, [messages, systemMessages]);

  // Load system messages from localStorage on mount
  useEffect(() => {
    if (channelId) {
      const storedMessages = localStorage.getItem(
        `systemMessages_${channelId}`
      );
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          setSystemMessages(parsedMessages);
        } catch (error) {
          console.error('Failed to parse stored system messages:', error);
        }
      }
    }
  }, [channelId]);

  // Save system messages to localStorage when they change
  useEffect(() => {
    if (channelId && systemMessages.length > 0) {
      localStorage.setItem(
        `systemMessages_${channelId}`,
        JSON.stringify(systemMessages)
      );
    }
  }, [channelId, systemMessages]);

  // Listen for socket events and custom DOM events (join/leave)
  useEffect(() => {
    console.log('Setting up event listeners for channel:', channelId);

    // Listen for socket message updates
    socketService.listenForChannelMessages(channelId, (message) => {
      console.log('New message received:', message);
      if (messagesContainerRef.current && isScrolledToBottom) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    });

    // Handle user join event
    const handleUserJoined = (event: CustomEvent) => {
      console.log('User joined event received:', event.detail);

      if (
        event.detail &&
        event.detail.channelId === channelId &&
        event.detail.user
      ) {
        console.log(
          'Creating system message for user join:',
          event.detail.user.name
        );

        // Create a unique ID for this system message
        const newSystemMsg = {
          id: `join-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          type: 'join' as const,
          username: event.detail.user.name,
          timestamp: new Date().toISOString(),
          channelId: channelId,
        };

        // Add to state and immediately save to localStorage
        setSystemMessages((prev) => {
          const updated = [...prev, newSystemMsg];
          localStorage.setItem(
            `systemMessages_${channelId}`,
            JSON.stringify(updated)
          );
          return updated;
        });

        // Auto-scroll to bottom for system messages
        if (isScrolledToBottom) {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      }
    };

    // Handle user leave event
    const handleUserLeft = (event: CustomEvent) => {
      console.log('User left event received:', event.detail);

      if (
        event.detail &&
        event.detail.channelId === channelId &&
        event.detail.user
      ) {
        console.log(
          'Creating system message for user leave:',
          event.detail.user.name
        );

        // Create a unique ID for this system message
        const newSystemMsg = {
          id: `leave-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          type: 'leave' as const,
          username: event.detail.user.name,
          timestamp: new Date().toISOString(),
          channelId: channelId,
        };

        // Add to state and immediately save to localStorage
        setSystemMessages((prev) => {
          const updated = [...prev, newSystemMsg];
          localStorage.setItem(
            `systemMessages_${channelId}`,
            JSON.stringify(updated)
          );
          return updated;
        });

        // Auto-scroll to bottom for system messages
        if (isScrolledToBottom) {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      }
    };

    // Add event listeners for join/leave
    document.addEventListener(
      'userJoinedChannel',
      handleUserJoined as EventListener
    );
    document.addEventListener(
      'userLeftChannel',
      handleUserLeft as EventListener
    );

    // Clean up event listeners
    return () => {
      console.log('Removing event listeners for channel:', channelId);
      document.removeEventListener(
        'userJoinedChannel',
        handleUserJoined as EventListener
      );
      document.removeEventListener(
        'userLeftChannel',
        handleUserLeft as EventListener
      );
      socketService.stopListeningForChannelMessages();
    };
  }, [channelId, isScrolledToBottom, scrollToBottom]);

  return (
    <div className="h-full flex flex-col">
      <div
        ref={messagesContainerRef}
        className="h-full overflow-y-auto px-4 py-3"
        onScroll={handleScroll}
      >
        {isLoadingMessages && (
          <div className="flex justify-center py-6">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-2" />
              <span className="text-sm text-gray-500">Loading messages...</span>
            </div>
          </div>
        )}

        {messages.length === 0 &&
        systemMessages.length === 0 &&
        !isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
              <MessageSquare size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm text-center max-w-md">
              Be the first to send a message in this channel!
            </p>
          </div>
        ) : (
          <div className="pb-4 space-y-4">{messageElements}</div>
        )}
      </div>

      {/* Scroll to bottom button - only show when not at bottom */}
      {!isScrolledToBottom && messages.length > 5 && (
        <div className="absolute bottom-14 right-6 z-20">
          <Button
            onClick={scrollToBottom}
            variant="secondary"
            size="sm"
            className="rounded-full h-10 w-10 shadow-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageList;
