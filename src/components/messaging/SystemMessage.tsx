import React from 'react';
import {User, UserMinus, UserPlus} from 'lucide-react';

interface SystemMessageProps {
  type: 'join' | 'leave' | 'info';
  username: string;
  timestamp: string;
}

const SystemMessage: React.FC<SystemMessageProps> = ({
  type,
  username,
  timestamp,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageContent = () => {
    switch (type) {
      case 'join':
        return (
          <>
            <UserPlus className="h-4 w-4 mr-1 text-green-500" />
            <span className="font-medium">{username}</span> joined the channel;;
          </>
        );
      case 'leave':
        return (
          <>
            <UserMinus className="h-4 w-4 mr-1 text-red-500" />
            <span className="font-medium">{username}</span> left the channel;;
          </>
        );
      case 'info':
        return (
          <>
            <User className="h-4 w-4 mr-1 text-blue-500" />
            <span className="font-medium">{username}</span> {timestamp}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center my-4 animate-fadeIn">
      <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center shadow-sm">
        {getMessageContent()}
        {type !== 'info' && (
          <span className="ml-2 text-gray-400 text-xs">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};

export default SystemMessage;
