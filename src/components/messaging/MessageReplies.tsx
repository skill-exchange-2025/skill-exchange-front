import React, { useState } from 'react';
import { Message as MessageType } from '@/types/channel';
import { Button } from '../ui/button';
import { CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useGetMessageRepliesQuery } from '@/redux/api/messagingApi';
import Message from './Message';
import { Loader2 } from 'lucide-react';

interface MessageRepliesProps {
  message: MessageType;
}

const MessageReplies: React.FC<MessageRepliesProps> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: repliesData,
    isLoading,
    isFetching,
  } = useGetMessageRepliesQuery(
    {
      messageId: message._id,
      page: 1,
      limit: 20,
    },
    {
      skip: !isExpanded || !message._id,
    }
  );

  const replyCount = message.replyCount || 0;

  if (replyCount === 0) {
    return null;
  }

  return (
    <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CornerDownRight size={14} />
        <span>
          {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
        </span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Button>

      {isExpanded && (
        <div className="ml-2">
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-gray-500">Loading replies...</span>
            </div>
          ) : repliesData && repliesData.replies.length > 0 ? (
            <div className="space-y-2">
              {repliesData.replies.map((reply) => (
                <Message key={reply._id} message={reply} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-2">No replies found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageReplies;
