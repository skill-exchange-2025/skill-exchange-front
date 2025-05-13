import React from 'react';
import { Reply } from 'lucide-react';
import { Button } from '../ui/button';
import { Message } from '@/types/channel';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface MessageReplyButtonProps {
  message: Message;
  onReply: (message: Message) => void;
}

const MessageReplyButton: React.FC<MessageReplyButtonProps> = ({
  message,
  onReply,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onReply(message)}
          >
            <Reply size={16} className="text-gray-500 dark:text-gray-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Reply to message</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageReplyButton;
