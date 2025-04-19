// src/components/messaging/PrivateMessageChat.tsx
import { useGetMessagesWithUserQuery, useSendPrivateMessageMutation } from '@/redux/features/privatemsgs/privateMessagesApi';
import React, { useState } from 'react';


interface PrivateMessageChatProps {
  recipientId: string;
  recipientName: string;
}

const PrivateMessageChat: React.FC<PrivateMessageChatProps> = ({ 
  recipientId, 
  recipientName 
}) => {
  const [message, setMessage] = useState('');
  const [sendMessage] = useSendPrivateMessageMutation();
  const { data: messages, isLoading } = useGetMessagesWithUserQuery(recipientId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        recipientId,
        content: message,
      }).unwrap();
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with {recipientName}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className={`mb-2 p-2 rounded ${
              msg.sender === recipientId ? 'bg-gray-100' : 'bg-blue-100 ml-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivateMessageChat;