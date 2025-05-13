import React from 'react';
import { PrivateMessage } from '@/types/user';
import { useRemoveReactionMutation,useAddReactionMutation } from '@/redux/features/privatemsgs/privateMessagesApi';
import { socketService } from '@/services/socketService';

interface MessageReactsProps {
  message: PrivateMessage;
  currentUserId: string;
}

const MessageReacts: React.FC<MessageReactsProps> = ({ message, currentUserId }) => {
  const [removeReaction, { isLoading: isRemoving }] = useRemoveReactionMutation();
  const [addReaction, { isLoading: isAdding }] = useAddReactionMutation();

  const handleReactionClick = async (type: string) => {
    if (isRemoving || isAdding) return; 

    try {
      const existingReaction = message.reactions?.find(
        reaction => reaction.user.toString() === currentUserId && reaction.type === type
      );
  
      if (existingReaction) {
        await removeReaction({ messageId: message._id }).unwrap();
        socketService.socket?.emit('reactionRemoved', {
          messageId: message._id,
          type: type,
          userId: currentUserId
        });
      } else {
        await addReaction({ messageId: message._id, type }).unwrap();
        socketService.socket?.emit('reactionAdded', {
          messageId: message._id,
          type: type,
          userId: currentUserId
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };


  // Group reactions by type
  const reactionCounts = message.reactions?.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="message-reactions">
      <div className="existing-reactions">
        {Object.entries(reactionCounts).map(([type, count]) => (
          <button
            key={type}
            disabled={isRemoving || isAdding}
            className={`reaction-badge ${
              message.reactions?.some(r => r.user.toString() === currentUserId && r.type === type)
                ? 'active'
                : ''
            } ${(isRemoving || isAdding) ? 'opacity-50' : ''}`}
            onClick={() => handleReactionClick(type)}
          >
            {type} {count}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageReacts;