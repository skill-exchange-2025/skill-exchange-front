import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {useCreateMessageMutation, useUploadFileWithMessageMutation,} from '../../redux/api/messagingApi';
import {Button} from '../ui/button';
import {Textarea} from '../ui/textarea';
import {Camera, File, FileText, ImageIcon, Mic, Paperclip, Plus, Send, Smile, X,} from 'lucide-react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '../ui/dialog';
import {Badge} from '../ui/badge';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from '../ui/tooltip';
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {useTheme} from 'next-themes';
import socketService from '@/services/socket.service';
import { toast } from '../use-toast';
import MessageReplyPreview from './MessageReplyPreview';
import { Message } from '../../types/channel';

interface MessageInputProps {
  channelId: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

// Emoji categories to filter
const emojiCategories = [
  'people',
  'nature',
  'foods',
  'activity',
  'places',
  'objects',
  'symbols',
  'flags',
];

// Common emoji shortcuts
const quickEmojis = [
  '👍',
  '❤️',
  '😂',
  '🎉',
  '🙏',
  '👏',
  '🔥',
  '✅',
  '👀',
  '👆',
  '👇',
  '👈',
  '👉',
  '👌',
  '👋',
  '👍',
  '👎',
  '👊',
  '👏',
  '👐',
  '👑',
  '👒',
  '👓',
  '👔',
  '👕',
  '👖',
  '👗',
  '👘',
  '👙',
  '👚',
  '👛',
  '👜',
  '👝',
  '👞',
  '👟',
  '👠',
  '👡',
  '👢',
  '👣',
  '👤',
  '👥',
  '👦',
  '👧',
];

const MessageInput: React.FC<MessageInputProps> = ({
  channelId,
  replyingTo = null,
  onCancelReply = () => {},
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [, { isLoading: isSending }] = useCreateMessageMutation();
  const [uploadFileWithMessage, { isLoading: isUploading }] =
    useUploadFileWithMessageMutation();
  const isSubmitting = isSending || isUploading;
  const { theme } = useTheme();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [channelId]);

  // Handle typing indicator with throttling
  const handleTyping = () => {
    if (!channelId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing event (throttled)
    socketService.emitTyping(channelId);

    // Set timeout to emit stopped typing event
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping(channelId);
    }, 2000); // 2 seconds after last keystroke
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTextareaResize(e);
    handleTyping();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check file size (limit to 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 25MB',
        });
        return;
      }

      setSelectedFile(file);

      // Create preview URL for image files
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      // Focus back on the textarea after file select
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Focus back on the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleOpenPreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
    setIsEmojiPickerOpen(false);

    // Focus and resize textarea after adding emoji
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  const insertQuickEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);

    // Focus and resize textarea after adding emoji
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  // Clean up typing timeout on unmount or channel change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        if (channelId) {
          socketService.emitStopTyping(channelId);
        }
      }
    };
  }, [channelId]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && !selectedFile) return;

    try {
      // Cancel any pending typing timeout and explicitly stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketService.emitStopTyping(channelId);
      }

      // Generate a client-side ID for this message (for optimistic updates)
      const clientMessageId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      console.log(
        `Message submission with clientMessageId: ${clientMessageId}`
      );

      // Create reply preview if replying to a message
      let replyPreview = null;
      if (replyingTo) {
        const senderName =
          typeof replyingTo.sender === 'object'
            ? replyingTo.sender.name
            : 'Unknown User';

        replyPreview = {
          content: replyingTo.content
            ? replyingTo.content.substring(0, 100)
            : 'Attachment',
          sender:
            typeof replyingTo.sender === 'object'
              ? replyingTo.sender._id
              : replyingTo.sender,
          senderName,
        };
      }

      // Step 1: For files, we'll do a dual approach:
      // a) Send metadata via socket for real-time updates
      // b) Upload the actual file via REST API
      if (selectedFile) {
        // First, send a message with attachment metadata via socket
        // This will show a "pending" preview of the attachment immediately
        console.log(
          `Sending attachment metadata via socket: ${selectedFile.name}`
        );
        socketService.sendMessage({
          channelId,
          content: message,
          attachment: selectedFile,
          clientMessageId,
          // Add reply data if replying
          ...(replyingTo && {
            isReply: true,
            parentMessageId: replyingTo._id,
            parentMessagePreview: replyPreview,
          }),
        });

        // Create FormData for file upload via REST API
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('channel', channelId);
        formData.append('channelId', channelId); // Add both channel and channelId for safety
        formData.append('content', message || '');
        formData.append('clientMessageId', clientMessageId); // Send the client ID to link with socket message

        // Add reply data to formData if replying
        if (replyingTo) {
          formData.append('isReply', 'true');
          formData.append('parentMessageId', replyingTo._id);
          if (replyPreview) {
            formData.append('replyPreview', JSON.stringify(replyPreview));
          }
        }

        // Notify user about upload
        toast({
          title: 'Uploading file...',
          duration: 3000,
        });

        // Upload the file via API
        console.log(`Uploading file via REST API: ${selectedFile.name}`);
        await uploadFileWithMessage(formData)
          .unwrap()
          .then(() => {
            console.log(`File upload successful: ${selectedFile.name}`);
            toast({
              title: 'File uploaded successfully',
              duration: 2000,
            });
          })
          .catch((error) => {
            console.error('Error with file upload via API:', error);
            toast({
              title: 'File upload issue',
              description:
                'Your message was sent but file upload may have issues',
            });
          });
      } else {
        // Step 2: For text-only messages, use socket for real-time delivery
        console.log(`Sending text-only message via socket`);
        if (replyingTo) {
          // If replying, use the sendReply method
          await socketService.sendReply({
            channelId,
            content: message,
            parentMessageId: replyingTo._id,
            parentMessagePreview: replyPreview || undefined,
            clientMessageId,
          });
        } else {
          // Regular message
          socketService.sendMessage({
            channelId,
            content: message,
            clientMessageId,
          });
        }
      }

      // Clear form after successful submission
      setMessage('');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }

      // Clear reply state after sending
      if (replyingTo) {
        onCancelReply();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error sending message',
        description: 'Please try again later',
      });
    }
  };

  // Auto-resize textarea
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Paperclip size={18} />;

    const fileType = selectedFile.type;
    if (fileType.startsWith('image/')) {
      return <ImageIcon size={18} className="text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={18} className="text-red-500" />;
    } else {
      return <File size={18} className="text-gray-500" />;
    }
  };

  const getFileSize = () => {
    if (!selectedFile) return '';

    const size = selectedFile.size;
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const getFileTypeLabel = () => {
    if (!selectedFile) return '';

    const fileType = selectedFile.type;
    if (fileType.startsWith('image/')) {
      return 'Image';
    } else if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (fileType.includes('document') || fileType.includes('word')) {
      return 'Document';
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return 'Spreadsheet';
    } else {
      return 'File';
    }
  };

  return (
    <>
      <form
        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pt-2 pb-3 px-4 shadow-md z-10"
        onSubmit={handleSubmit}
      >
        {/* Show reply preview if replying to a message */}
        {replyingTo && (
          <MessageReplyPreview
            parentMessage={replyingTo}
            onCancel={onCancelReply}
          />
        )}

        {/* Quick emoji bar */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            {quickEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => insertQuickEmoji(emoji)}
                className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Attached file preview */}
        {selectedFile && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-full mr-3">
                {getFileIcon()}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                    {selectedFile.name}
                  </span>
                  <Badge className="ml-2 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 font-normal">
                    {getFileTypeLabel()}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {getFileSize()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600"
                    onClick={handleOpenPreview}
                  >
                    <ImageIcon
                      size={14}
                      className="mr-1 text-blue-600 dark:text-blue-400"
                    />
                    Preview
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="relative flex items-end">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onInput={handleTextareaResize}
            placeholder={`Type a message...`}
            className="pr-24 py-3 min-h-[44px] max-h-[200px] overflow-y-auto resize-none rounded-2xl bg-gray-50 dark:bg-gray-700 focus-visible:ring-offset-1 text-base"
            disabled={isSubmitting}
          />

          <div className="absolute bottom-2 right-2 flex items-center space-x-1">
            {/* Attachment options popover */}
            <Popover
              open={showAttachOptions}
              onOpenChange={setShowAttachOptions}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  disabled={isSubmitting}
                >
                  <Plus size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-56 p-2">
                <div className="grid grid-cols-3 gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex flex-col items-center justify-center h-16 w-full"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowAttachOptions(false);
                          }}
                        >
                          <Paperclip size={20} className="mb-1" />
                          <span className="text-xs">File</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Upload files</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex flex-col items-center justify-center h-16 w-full"
                          onClick={() => {
                            setShowAttachOptions(false);
                            toast({
                              title: 'Coming soon',
                              description:
                                'Image capture will be available soon',
                            });
                          }}
                        >
                          <div className="relative">
                            <Camera size={20} className="mb-1" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                          </div>
                          <span className="text-xs">Image</span>
                          <span className="text-[10px] opacity-60 mt-0.5">
                            Soon
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Take photos (Coming soon)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex flex-col items-center justify-center h-16 w-full"
                          onClick={() => {
                            setShowAttachOptions(false);
                            toast({
                              title: 'Coming soon',
                              description:
                                'Voice recording will be available soon',
                            });
                          }}
                        >
                          <div className="relative">
                            <Mic size={20} className="mb-1" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                          </div>
                          <span className="text-xs">Audio</span>
                          <span className="text-[10px] opacity-60 mt-0.5">
                            Soon
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Record voice message (Coming soon)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </PopoverContent>
            </Popover>

            {/* Emoji picker */}
            <Popover
              open={isEmojiPickerOpen}
              onOpenChange={setIsEmojiPickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  disabled={isSubmitting}
                >
                  <Smile size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-full p-0 border-none bg-transparent"
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  set="native"
                  categories={emojiCategories}
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </PopoverContent>
            </Popover>

            {/* Standard file input that's hidden */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              disabled={isSubmitting}
            />

            {/* Attach file button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || selectedFile !== null}
            >
              <Paperclip size={20} />
            </Button>

            {/* Send button */}
            <Button
              type="submit"
              variant={message.trim() || selectedFile ? 'default' : 'ghost'}
              size="icon"
              className={`h-8 w-8 rounded-full ${
                message.trim() || selectedFile
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              disabled={isSubmitting || (!message.trim() && !selectedFile)}
            >
              <Send
                size={18}
                className={message.trim() || selectedFile ? 'text-white' : ''}
              />
            </Button>
          </div>
        </div>
      </form>

      {/* File preview dialog */}
      <Dialog open={showPreview} onOpenChange={handleClosePreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>

          {previewUrl && selectedFile && (
            <div className="flex flex-col items-center justify-center">
              {selectedFile.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[500px] object-contain rounded-md"
                />
              ) : selectedFile.type === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  className="w-full h-[500px] rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <File size={64} className="text-gray-400 mb-4" />
                  <p className="text-lg font-medium">
                    Preview not available for this file type
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedFile.name} ({getFileTypeLabel()})
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClosePreview}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageInput;
