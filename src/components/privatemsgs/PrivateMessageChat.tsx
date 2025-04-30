import { 
  useGetMessagesWithUserQuery, 
  useSendPrivateMessageMutation,
  useDeletePrivateMessageMutation,
  useEditPrivateMessageMutation ,
  useAddReactionMutation,
  useRemoveReactionMutation
} from '@/redux/features/privatemsgs/privateMessagesApi';
import { socketService } from '@/services/socketService';
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, X, Check, MessageSquare, Smile, Send } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { PrivateMessage, User } from '@/types/user';
import { useGetUserByIdQuery, useGetUsersQuery } from '@/redux/features/users/usersApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal } from 'lucide-react'; 
import MessageReacts from './MessageReacts';
import EmojiPicker from 'emoji-picker-react';
interface PrivateMessageChatProps {
  recipientId: string;
  recipientName: string;
}
interface Reaction {
  type: string;
  user: string;
  _id?: string;
}

interface PrivateMessageChatProps {
  recipientId: string;
  recipientName: string;
}

interface ReplyToMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
  };
}
interface ReplyToMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
  };
}

const PrivateMessageChat: React.FC<PrivateMessageChatProps> = ({ 
  recipientId, 
  recipientName 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [addReaction] = useAddReactionMutation();
const [removeReaction] = useRemoveReactionMutation();
const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { data: recipientData } = useGetUserByIdQuery(recipientId);
  const [sendMessage] = useSendPrivateMessageMutation();
  const [deleteMessage] = useDeletePrivateMessageMutation();
  const [editMessage] = useEditPrivateMessageMutation();
  const { data: messages, isLoading } = useGetMessagesWithUserQuery(recipientId);
  const [localMessages, setLocalMessages] = useState<PrivateMessage[]>(messages || []);
  const [replyTo, setReplyTo] = useState<ReplyToMessage | null>(null);
  const currentUserId = useAppSelector((state) => state.auth.user?._id);
 
  const handleEmojiSelect = async (emojiObject: any) => {
    try {
      if (currentMessageId) {
        const result = await addReaction({
          messageId: currentMessageId,
          type: emojiObject.emoji
        }).unwrap();
        
        setLocalMessages((prev: PrivateMessage[]) => 
          prev.map(msg => 
            msg._id === currentMessageId 
              ? {
                  ...msg,
                  reactions: [
                    ...(msg.reactions || []),
                    {
                      type: emojiObject.emoji,
                      user: currentUserId || '',
                      _id: result._id 
                    } as Reaction
                  ]
                }
              : msg
          )
        );
  
        socketService.socket?.emit('reactionAdded', {
          messageId: currentMessageId,
          type: emojiObject.emoji,
          userId: currentUserId
        });
      } else {
        setMessage(prev => prev + emojiObject.emoji);
      }
      
      setShowEmojiPicker(false);
      setCurrentMessageId(null);
    } catch (error) {
      console.error('Failed to handle emoji:', error);
    }
  };
  const handleOpenEmojiPicker = (messageId: string) => {
  setCurrentMessageId(messageId);
  setShowEmojiPicker(true);
};
useEffect(() => {
  if (messages) {
    setLocalMessages(messages);
  }
}, [messages]);
useEffect(() => {
  const handleReactionAdded = (updatedMessage: PrivateMessage) => {
    setLocalMessages(prev => 
      prev.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  };
  const handleReactionRemoved = (updatedMessage: PrivateMessage) => {
    setLocalMessages(prev => 
      prev.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  };

  socketService.socket?.on('reactionAdded', handleReactionAdded);
  socketService.socket?.on('reactionRemoved', handleReactionRemoved);
  
  return () => {
    socketService.socket?.off('reactionAdded', handleReactionAdded);
    socketService.socket?.off('reactionRemoved', handleReactionRemoved);
  };
}, []);









  useEffect(() => {
    scrollToBottom();
  }, [localMessages]); 
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []); // Run once on mount

  useEffect(() => {
    const handleNewMessage = (message: PrivateMessage) => {
      if ((message.sender._id === recipientId || message.recipient._id === recipientId) && message.content) {
        setLocalMessages(prev => [...prev, message]);
      }
    };

    const handleMessageDeleted = (messageId: string) => {
      setLocalMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    const handleMessageEdited = (updatedMessage: any) => {
      setLocalMessages(prev => 
        prev.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    };

    socketService.listenForPrivateMessages(handleNewMessage);
    socketService.listenForMessageDeleted(handleMessageDeleted);
    socketService.listenForMessageEdited(handleMessageEdited);

    return () => {
      socketService.stopListeningForPrivateMessages();
      socketService.stopListeningForMessageDeleted();
      socketService.stopListeningForMessageEdited();
    };
  }, [recipientId]);

  if (isLoading) return <div>Loading...</div>;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    try {
      await sendMessage({
        recipientId,
        content: message,
        replyTo: replyTo?._id
      }).unwrap();
      
      socketService.sendPrivateMessage(recipientId, message);
      setMessage('');
      setReplyTo(null);
      
      // Add scroll after sending
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReply = (msg: PrivateMessage) => {
    setReplyTo({
      _id: msg._id,
      content: msg.content,
      sender: {
        _id: msg.sender._id,
        name: msg.sender.name
      }
    });
  };
  
  const cancelReply = () => {
    setReplyTo(null);
  };
 

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId).unwrap();
      socketService.emitMessageDeleted(messageId);
      setLocalMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      const updatedMessage = await editMessage({ 
        messageId, 
        content: editContent 
      }).unwrap();
      
      socketService.emitMessageEdited(updatedMessage);
      setLocalMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, content: editContent } : msg
        )
      );
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

return (
  <div className="flex flex-col h-[calc(100vh-180px)]">
  {/* Header section remains the same */}
  <div className="p-4 border-b">
    <h2 className="text-lg font-semibold">
      {recipientData?.name ? `Chat with ${recipientData.name}` : 'Loading...'}
    </h2>
  </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4 overflow-hidden">
          {localMessages.map((msg) => (
            <div
              key={msg._id}
              className={`group mb-2 p-2 rounded relative inline-block max-w-[70%] min-w-[100px] ${
                msg.sender._id === recipientId 
                  ? 'bg-pink-100 float-left clear-both' 
                  : 'bg-green-100 float-right clear-both'
              }`}
              style={{
                wordWrap: 'break-word',
                width: 'fit-content',
                paddingRight: '40px'
              }}
            >
              {msg.replyTo && (
                <div className="text-sm text-gray-600 border-l-2 border-gray-400 pl-2 mb-1">
                  <div className="italic">
                    {msg.replyTo.sender._id === currentUserId 
                      ? `Reply to yourself`
                      : `Reply to ${msg.replyTo.sender.name}`}
                  </div>
                  <div className="truncate">{msg.replyTo.content}</div>
                </div>
              )}

              {editingMessageId === msg._id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 p-1 rounded border"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(msg._id)}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {msg.content}
<div className="message-actions flex gap-2">
  <button
    onClick={() => handleOpenEmojiPicker(msg._id)}
    className="reaction-button p-1 text-gray-400 hover:text-gray-600"
  >
    <Smile size={16} />
  </button>
  <MessageReacts 
    message={msg}
    currentUserId={currentUserId || ''}
  />
</div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setOpenMenuId((prev) => (prev === msg._id ? null : msg._id))}
                      className="p-1 hover:bg-gray-200 rounded-full ml-4"
                      style={{ marginLeft: '8px' }}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenuId === msg._id && (
                      <div className="absolute bottom-full right-0 mb-1 bg-white border rounded shadow-md flex flex-col z-10">
                        <button
                          onClick={() => {
                            handleReply(msg);
                            setOpenMenuId(null);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                        >
                          <MessageSquare size={14} />
                          Reply
                        </button>

                        {msg.sender._id !== recipientId && (
                          <>
                            <button
                              onClick={() => {
                                handleStartEdit(msg._id, msg.content);
                                setOpenMenuId(null);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteMessage(msg._id);
                                setOpenMenuId(null);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} style={{ clear: 'both' }} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        {replyTo && (
          <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">
                {replyTo.sender._id === currentUserId 
                  ? 'Replying to yourself'
                  : `Replying to ${replyTo.sender.name}`}
              </div>
              <div className="text-sm truncate">{replyTo.content}</div>
            </div>
            <button
              type="button"
              onClick={cancelReply}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="flex items-center w-full">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder={replyTo ? 'Type your reply...' : 'Type a message...'}
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              >
                <Smile size={16} />
              </button>
            </div>
            {showEmojiPicker && (
  <div className="absolute bottom-full right-0 mb-2 z-50">
    <EmojiPicker
      onEmojiClick={handleEmojiSelect}
      width={300}
      height={400}
    />
  </div>
)}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Send className="w-5 h-5 text-darkblack-400 hover:text-white-600 cursor-pointer" />

          </button>
        </div>
      </form>
    </div>
  );
  
};

export default PrivateMessageChat;