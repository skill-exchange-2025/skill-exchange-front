import React from 'react';
import { Message } from '@/types/channel';
import { CornerUpLeft, X } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageReplyPreviewProps {
  parentMessage: Message;
  onCancel: () => void;
}

const MessageReplyPreview: React.FC<MessageReplyPreviewProps> = ({
  parentMessage,
  onCancel,
}) => {
  // Get the sender name from the parent message
  const senderName =
    typeof parentMessage.sender === 'object'
      ? parentMessage.sender.name
      : 'Unknown User';

  // Get a preview of the content (truncate if too long)
  const contentPreview = parentMessage.content
    ? parentMessage.content.length > 100
      ? `${parentMessage.content.substring(0, 100)}...`
      : parentMessage.content
    : parentMessage.attachment
    ? 'Attachment'
    : 'Empty message';

  return (
    <div className="px-4 py-2 border-t border-l-4 border-green-400 bg-green-50 dark:bg-green-900/30 dark:border-green-600 flex items-start justify-between">
      <div className="flex items-start">
        <CornerUpLeft
          size={16}
          className="mr-2 mt-1 text-blue-500 dark:text-green-400"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            Replying to {senderName}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {contentPreview}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={onCancel}
      >
        <X size={14} />
      </Button>
    </div>
  );
};

export default MessageReplyPreview;
