import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAppSelector } from '../../redux/hooks';
import {
  useAddReactionMutation,
  useRemoveReactionMutation,
  useDeleteMessageMutation,
} from '../../redux/api/messagingApi';
import { Message as MessageType } from '../../types/channel';
import { User } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Smile,
  FileIcon,
  Link as LinkIcon,
  Download,
  Trash2,
  MoreVertical,
  X,
  ImageIcon,
  FileText,
  File,
  Eye,
  MessageCircle,
  UserCircle,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '../use-toast';
import socketService from '../../services/socket.service';
import MessageReactions from './MessageReactions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Badge } from '../ui/badge';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { currentChannel } = useAppSelector((state) => state.channels);
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();
  const [deleteMessage, { isLoading: isDeleting }] = useDeleteMessageMutation();
  const { toast } = useToast();

  const handleEmojiClick = async (emojiData: EmojiClickData) => {
    try {
      if (!currentChannel) return;

      const emoji = emojiData.emoji;
      const hasUserReacted =
        message.reactions &&
        message.reactions[emoji] &&
        message.reactions[emoji].includes(user?._id || '');

      if (hasUserReacted) {
        // Remove reaction
        await removeReaction({
          messageId: message._id,
          emoji,
        });
        // Also notify via socket for real-time updates
        socketService.removeReaction(message._id, currentChannel._id, emoji);
      } else {
        // Add reaction
        await addReaction({
          messageId: message._id,
          emoji,
        });
        // Also notify via socket for real-time updates
        socketService.addReaction(message._id, currentChannel._id, emoji);
      }

      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to handle reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to process reaction',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveReaction = async (emoji: string) => {
    if (!currentChannel) return;

    try {
      await removeReaction({
        messageId: message._id,
        emoji,
      });
      // Also notify via socket for real-time updates
      socketService.removeReaction(message._id, currentChannel._id, emoji);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!currentChannel) return;

    try {
      await deleteMessage(message._id).unwrap();
      // Also notify via socket for real-time updates
      socketService.deleteMessage(message._id, currentChannel._id);

      toast({
        title: 'Message deleted',
        description: 'Your message has been successfully deleted',
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  // Format message content with HTML (already processed by backend)
  const formatContent = () => {
    return { __html: message.content };
  };

  // Extract sender info
  const sender = message.sender as User;
  const senderName = sender?.name || 'Unknown User';
  const senderInitials = senderName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Check if current user is the message sender
  const isCurrentUserMessage = sender?._id === user?._id;

  // Format timestamp
  const timestamp = new Date(message.createdAt);
  const formattedTime = format(timestamp, 'h:mm a');
  const formattedDate = format(timestamp, 'MMM d, yyyy');

  const getFileIcon = () => {
    if (!message.attachment)
      return <FileIcon size={20} className="text-gray-400" />;

    const filename = message.attachment.originalname.toLowerCase();
    const mimetype = message.attachment.mimetype;

    if (mimetype && mimetype.startsWith('image/')) {
      return <ImageIcon size={20} className="text-blue-500" />;
    } else if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
      return <FileText size={20} className="text-red-500" />;
    } else if (
      mimetype === 'application/msword' ||
      mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filename.endsWith('.doc') ||
      filename.endsWith('.docx')
    ) {
      return <FileText size={20} className="text-blue-600" />;
    } else if (
      mimetype === 'application/vnd.ms-excel' ||
      mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      filename.endsWith('.xls') ||
      filename.endsWith('.xlsx')
    ) {
      return <FileText size={20} className="text-green-600" />;
    } else {
      return <File size={20} className="text-gray-500" />;
    }
  };

  const isImageAttachment = () => {
    if (!message.attachment) return false;
    const mimetype = message.attachment.mimetype;
    return mimetype && mimetype.startsWith('image/');
  };

  const isPdfAttachment = () => {
    if (!message.attachment) return false;
    const mimetype = message.attachment.mimetype;
    const filename = message.attachment.originalname.toLowerCase();
    return mimetype === 'application/pdf' || filename.endsWith('.pdf');
  };

  const getFileSize = () => {
    if (!message.attachment) return '';

    const size = message.attachment.size;
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Helper function to get full URL for attachment
  const getAttachmentUrl = (path: string) => {
    if (!path) return '';

    // If path already starts with http(s), return as is
    if (path.startsWith('http')) {
      return path;
    }

    // Otherwise, prepend base URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  return (
    <>
      <div
        className={`group rounded-lg p-3 mb-2 transition-colors ${
          isCurrentUserMessage
            ? 'hover:bg-green-50 dark:hover:bg-green-900/20 border-l-4 border-green-400 dark:border-green-600'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex gap-3">
          <Avatar
            className={`h-10 w-10 ring-2 ${
              isCurrentUserMessage
                ? 'ring-green-200 dark:ring-green-800'
                : 'ring-gray-200 dark:ring-gray-700'
            }`}
          >
            <AvatarImage src="" alt={senderName} />
            <AvatarFallback
              className={`${
                isCurrentUserMessage
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {senderInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`font-medium ${
                  isCurrentUserMessage
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {senderName}
              </span>
              {isCurrentUserMessage && (
                <Badge
                  variant="outline"
                  className="text-xs py-0 h-5 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                >
                  You
                </Badge>
              )}
              <span className="text-xs text-gray-500" title={formattedDate}>
                {formattedTime}
              </span>
            </div>

            {/* File Attachment (Before Message Content) */}
            {message.attachment && (
              <div
                className="mb-3 cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={
                  isImageAttachment() || isPdfAttachment()
                    ? () => setShowAttachmentPreview(true)
                    : undefined
                }
              >
                {isImageAttachment() ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="relative">
                      <img
                        src={getAttachmentUrl(message.attachment.path)}
                        alt={message.attachment.originalname}
                        className="max-h-80 w-auto object-contain bg-gray-50 dark:bg-gray-900"
                        onError={(e) => {
                          console.error(
                            'Image failed to load:',
                            e,
                            message.attachment
                          );
                          e.currentTarget.src =
                            'https://via.placeholder.com/300x200?text=Image+Not+Available';
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                          <ImageIcon size={12} className="mr-1" />
                          Image
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm truncate text-gray-700 dark:text-gray-300 font-medium">
                        {message.attachment.originalname}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getAttachmentUrl(message.attachment?.path || ''),
                            '_blank'
                          );
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mr-4">
                        {getFileIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                          {message.attachment.originalname}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getFileSize()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              getAttachmentUrl(message.attachment?.path || ''),
                              '_blank'
                            );
                          }}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <Download
                            size={16}
                            className="mr-1 text-blue-600 dark:text-blue-400"
                          />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message Content */}
            {message.content && (
              <div
                className="prose prose-sm dark:prose-invert max-w-none mt-1 mb-2 text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={formatContent()}
              />
            )}

            {/* Reactions */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="mt-2">
                <MessageReactions
                  messageId={message._id}
                  reactions={message.reactions}
                  onEmojiClick={handleEmojiClick}
                />
              </div>
            )}
          </div>

          {/* Message actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1 pt-1">
            {/* Emoji Reaction Button */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Smile
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-0"
                align="end"
                side="top"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={350}
                />
              </PopoverContent>
            </Popover>

            {/* Message Options (Delete, etc.) - Only for user's own messages */}
            {isCurrentUserMessage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreVertical
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top">
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={handleDeleteMessage}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Dialog */}
      {message.attachment && (
        <Dialog
          open={showAttachmentPreview}
          onOpenChange={setShowAttachmentPreview}
        >
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {getFileIcon()}
                <span className="ml-2">{message.attachment.originalname}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="my-4 flex justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
              {isImageAttachment() ? (
                <img
                  src={getAttachmentUrl(message.attachment.path)}
                  alt={message.attachment.originalname}
                  className="max-h-[70vh] max-w-full object-contain rounded"
                  onError={(e) => {
                    console.error(
                      'Image preview failed to load:',
                      e,
                      message.attachment
                    );
                    // If image still fails to load, use placeholder
                    e.currentTarget.src =
                      'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    e.currentTarget.onerror = null; // Prevent infinite loop
                  }}
                />
              ) : isPdfAttachment() ? (
                <iframe
                  src={getAttachmentUrl(message.attachment.path)}
                  title="PDF Preview"
                  className="w-full h-[70vh] border-0 rounded"
                  onError={(e) => {
                    console.error('PDF preview failed to load:', e);
                    // PDF load error handling
                    const container = e.currentTarget.parentElement;
                    if (container) {
                      const errorMsg = document.createElement('div');
                      errorMsg.className =
                        'flex flex-col items-center justify-center p-8 text-gray-500';
                      errorMsg.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <path d="M14 2v6h6"></path>
                          <path d="M16 13H8"></path>
                          <path d="M16 17H8"></path>
                          <path d="M10 9H8"></path>
                        </svg>
                        <p>Failed to load PDF preview</p>
                        <p class="text-sm mt-2">Please download the file to view it</p>
                      `;
                      container.replaceChild(errorMsg, e.currentTarget);
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <File size={48} className="mb-4" />
                  <p>Preview not available for this file type</p>
                  <p className="text-sm mt-2">Download the file to view it</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAttachmentPreview(false)}
                className="mr-2"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  window.open(
                    getAttachmentUrl(message.attachment?.path || ''),
                    '_blank'
                  );
                }}
              >
                <Download size={16} className="mr-2" />
                Download File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Message;
