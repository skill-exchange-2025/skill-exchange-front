import { 
  useGetMessagesWithUserQuery, 
  useSendPrivateMessageMutation,
  useDeletePrivateMessageMutation,
  useEditPrivateMessageMutation 
} from '@/redux/features/privatemsgs/privateMessagesApi';
import { socketService } from '@/services/socketService';
import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, X, Check, MessageSquare } from 'lucide-react'; // Import icons
import { useAppSelector } from '@/redux/hooks';
import { User } from '@/types/user';

interface PrivateMessageChatProps {
  recipientId: string;
  recipientName: string;
}
interface ReplyToMessage {
  _id: string;
  content: string;
  sender: User;
}


const PrivateMessageChat: React.FC<PrivateMessageChatProps> = ({ 
  recipientId, 
  recipientName 
}) => {
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const [sendMessage] = useSendPrivateMessageMutation();
  const [deleteMessage] = useDeletePrivateMessageMutation();
  const [editMessage] = useEditPrivateMessageMutation();
  const { data: messages, isLoading } = useGetMessagesWithUserQuery(recipientId);
  const [localMessages, setLocalMessages] = useState(messages || []);
  const [replyTo, setReplyTo] = useState<ReplyToMessage | null>(null);
  const currentUserId = useAppSelector((state) => state.auth.user?._id);

  // Update local messages when query data changes
  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
    }
  }, [messages]);

  // Set up socket listeners for real-time messages
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      if ((message.sender === recipientId || message.recipient === recipientId) && message.content) {
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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };


  const handleReply = (msg: any) => {
    setReplyTo({
      _id: msg._id,
      content: msg.content,
      sender: msg.sender
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with {recipientName}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {localMessages.map((msg) => (
          <div
          key={msg._id}
          className={`group mb-2 p-2 rounded relative ${
            msg.sender._id === recipientId ? 'bg-gray-100' : 'bg-blue-100 ml-auto'
          }`}
        >
{/* Show replied to message if exists */}
{msg.replyTo && (
  <div className="text-sm text-gray-600 border-l-2 border-gray-400 pl-2 mb-1">
    <div className="italic">
      {msg.sender._id === recipientId 
        ? (msg.replyTo.sender._id === recipientId 
          ? `${recipientName} replied to themselves`
          : `${recipientName} replied to you`)
        : (msg.replyTo.sender._id === recipientId 
          ? `You replied to ${recipientName}`
          : "You replied to yourself")}
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
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {/* Reply button shown for all messages */}
                  <button
                    onClick={() => handleReply(msg)}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    <MessageSquare size={16} />
                  </button>
                  
                  {/* Edit and Delete buttons only shown for user's own messages */}
                  {msg.sender._id !== recipientId && (
                    <>
                      <button
                        onClick={() => handleStartEdit(msg._id, msg.content)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Rest of the form remains the same */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
{/* Show reply preview if replying */}
{replyTo && (
  <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
    <div>
      <div className="text-sm text-gray-600">
        {replyTo.sender._id === recipientId 
          ? `Replying to ${recipientName}`
          : "Replying to yourself"}
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
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder={replyTo ? "Type your reply..." : "Type a message..."}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
);
};

export default PrivateMessageChat;