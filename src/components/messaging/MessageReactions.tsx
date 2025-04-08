import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import {
  useAddReactionMutation,
  useRemoveReactionMutation,
} from '../../redux/api/messagingApi';
import { EmojiClickData } from 'emoji-picker-react';
import { X } from 'lucide-react';
import { useToast } from '../use-toast';
import socketService from '../../services/socket.service';

interface MessageReactionsProps {
  messageId: string;
  reactions: Record<string, string[]>;
  onEmojiClick: (emojiData: EmojiClickData) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onEmojiClick,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentChannel } = useAppSelector((state) => state.channels);
  const [removeReaction] = useRemoveReactionMutation();
  const { toast } = useToast();

  const handleRemoveReaction = async (emoji: string) => {
    if (!currentChannel) return;

    try {
      await removeReaction({
        messageId,
        emoji,
      });
      // Also notify via socket for real-time updates
      socketService.removeReaction(messageId, currentChannel._id, emoji);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive',
      });
    }
  };

  if (!reactions || Object.keys(reactions).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(reactions).map(([emoji, users]) => {
        const userReacted =
          Array.isArray(users) && users.includes(user?._id || '');
        return (
          <div
            key={emoji}
            className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
              userReacted
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <button
              className="mr-1"
              onClick={() => onEmojiClick({ emoji } as EmojiClickData)}
            >
              <span>{emoji}</span>
            </button>
            <span>{Array.isArray(users) ? users.length : 0}</span>
            {userReacted && (
              <button
                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleRemoveReaction(emoji)}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageReactions;
