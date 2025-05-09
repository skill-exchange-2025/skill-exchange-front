  import { 
    useGetMessagesWithUserQuery, 
    useSendPrivateMessageMutation,
    useDeletePrivateMessageMutation,
    useEditPrivateMessageMutation ,
    useAddReactionMutation,
    useRemoveReactionMutation,
    useMarkMessagesAsReadMutation,
    useUploadVoiceMessageMutation,
    useSendVoiceMessageMutation
  } from '@/redux/features/privatemsgs/privateMessagesApi';
  import { MoreVertical } from 'lucide-react';
  import { socketService } from '@/services/socketService';
  import React, { useState, useEffect, useRef } from 'react';
  import { Mic, Square,Trash2, Edit2, X, Check, MessageSquare, Smile, Send } from 'lucide-react';
  import { useAppSelector } from '@/redux/hooks';
  import { PrivateMessage, User } from '@/types/user';
  import { useGetUserByIdQuery, useGetUsersQuery } from '@/redux/features/users/usersApi';
  import { ScrollArea } from '@/components/ui/scroll-area';
  import { MoreHorizontal } from 'lucide-react'; 
  import MessageReacts from './MessageReacts';
  import EmojiPicker from 'emoji-picker-react';
  import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
  import { useNavigate } from 'react-router-dom';
  import { Dialog, DialogContent } from "@/components/ui/dialog";
  import { ProfileView } from "@/components/Profile/ProfileView";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

  import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger 
  } from '@/components/ui/dropdown-menu';
  // import * as lamejs from 'lamejs';
  import lamejs from 'lamejs';
  import { useGetProfileByUserIdQuery } from '@/redux/features/profile/profileApi';
  import { Button } from 'antd';
  import { TooltipProvider } from '@radix-ui/react-tooltip';

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

  const PrivateMessageChat: React.FC<PrivateMessageChatProps> = ({ 
    recipientId, 
    recipientName 
  }) => {
    const navigate = useNavigate();
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    const [showProfilePreview, setShowProfilePreview] = useState(false);

    const { data: recipientProfile } = useGetProfileByUserIdQuery(recipientId);
    const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
    const [uploadVoiceMessage] = useUploadVoiceMessageMutation();
    const [sendVoiceMessage] = useSendVoiceMessageMutation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [addReaction] = useAddReactionMutation();
    const [markMessagesAsRead] = useMarkMessagesAsReadMutation();
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const recordingTimer = useRef<NodeJS.Timeout>();
    const [removeReaction] = useRemoveReactionMutation();
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
      const [message, setMessage] = useState('');
      const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
      const [editContent, setEditContent] = useState('');
      const [openMenuId, setOpenMenuId] = useState<string | null>(null);
      const [sendMessage] = useSendPrivateMessageMutation();
      const [deleteMessage] = useDeletePrivateMessageMutation();
      const [editMessage] = useEditPrivateMessageMutation();
      const { data: messages, isLoading } = useGetMessagesWithUserQuery(recipientId);
      const [localMessages, setLocalMessages] = useState<PrivateMessage[]>(messages || []);
      const [replyTo, setReplyTo] = useState<ReplyToMessage | null>(null);
      const currentUserId = useAppSelector((state) => state.auth.user?._id);
      const ProfilePreviewTooltip = ({ userId, children }: { userId: string, children: React.ReactNode }) => {
        const { data: profile } = useGetProfileByUserIdQuery(userId);
        
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              {children}
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2">
                <h4 className="font-semibold">{profile?.user.name}</h4>
                {profile?.profession && (
                  <p className="text-sm">{profile.profession}</p>
                )}
                <p className="text-xs text-gray-500">{profile?.location}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      };
      const ProfilePreviewDialog = () => (
        <Dialog open={showProfilePreview} onOpenChange={setShowProfilePreview}>
          <DialogContent className="max-w-3xl">
            <ProfileView userId={recipientId} />
            <Button 
              onClick={() => {
                setShowProfilePreview(false);
                navigate(`/profile/${recipientId}`);
              }}
              className="mt-4"
            >
              View Full Profile
            </Button>
          </DialogContent>
        </Dialog>
      );


      const renderProfileInfo = () => {
        if (recipientProfile) {
          return (
            <div className="flex items-center gap-2">
              <Avatar 
                className="h-8 w-8 cursor-pointer"
                onClick={() => handleProfileClick(recipientId)}
              >
                <AvatarImage 
                  src={recipientProfile.avatarUrl 
                    ? `http://localhost:5000${recipientProfile.avatarUrl}`
                    : undefined}
                  alt={recipientData?.name || ''} 
                />
                <AvatarFallback>{getInitials(recipientData?.name || '')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{recipientData?.name}</h3>
                {recipientProfile.profession && (
                  <p className="text-sm text-gray-500">{recipientProfile.profession}</p>
                )}
              </div>
            </div>
          );
        }
        return null;
      };
      const handleProfileClick = (senderId: string) => {
        if (senderId === currentUserId) {
          // If clicking own avatar, go to user profile
          navigate('/profile');
        } else {
          // If clicking other user's avatar, go to their profile
          navigate(`/profile/${senderId}`);
        }
      };

    const convertToMp3 = (audioData: Float32Array): Blob => {
      try {
        const channels = 1; // Mono
        const sampleRate = 44100; // Standard sample rate
        const kbps = 128; // Bitrate
    
        const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
        const mp3Data: Int8Array[] = [];
    
        // Convert Float32Array to Int16Array
        const samples = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          const s = Math.max(-1, Math.min(1, audioData[i]));
          samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
    
        // Process chunks
        const chunkSize = 1152;
        for (let i = 0; i < samples.length; i += chunkSize) {
          const chunk = samples.slice(i, i + chunkSize);
          const mp3Buffer = mp3Encoder.encodeBuffer(chunk);
          if (mp3Buffer.length > 0) {
            mp3Data.push(mp3Buffer);
          }
        }
    
        const end = mp3Encoder.flush();
        if (end.length > 0) {
          mp3Data.push(end);
        }
    
        return new Blob(mp3Data, { type: 'audio/mpeg' });
      } catch (error) {
        console.error('MP3 conversion error:', error);
        throw new Error('Failed to convert audio to MP3');
      }
    };


    const handleVoiceMessageSend = async (audioBlob: Blob, duration: number) => {
      try {
        // Convert blob to File or handle appropriately for your storage solution
        const formData = new FormData();
        const audioUrl = URL.createObjectURL(audioBlob);

        formData.append('audio', audioBlob, 'recording.mp3');
        formData.append('duration', duration.toString());
        
        // Send to your API
        await sendVoiceMessage({
          recipientId,
          audioUrl:audioUrl,
          duration,
          isVoiceMessage: true
        });
      } catch (error) {
        console.error('Error sending voice message:', error);
      }
    };
    const handleStopRecording = async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.ondataavailable = async (e) => {
          const audioBlob = e.data;
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Get audio duration
          const audio = new Audio(audioUrl);
          audio.addEventListener('loadedmetadata', () => {
            const duration = audio.duration;
            // Now send the message with the correct duration
            handleVoiceMessageSend(audioBlob, duration);
          });
        };
      }
    };
    
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
    
        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/mpeg' }); // Change to audio/mpeg
          const duration = Math.round((Date.now() - recordingStartTime) / 1000);
          try {
            await handleVoiceMessageSend(audioBlob, duration);
          } catch (error) {
            console.error('Error handling voice message:', error);
          }
        };
    
        recorder.start();
        setMediaRecorder(recorder);
        setRecordingStartTime(Date.now());
        setIsRecording(true);
        
        // Start duration timer
        recordingTimer.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
      }
    };

    const stopRecording = () => {
      try {
        if (mediaRecorder && audioStream) {
          mediaRecorder.stop();
          audioStream.getTracks().forEach(track => track.stop());
          
          // Don't reset the duration immediately
          const finalDuration = recordingDuration;
          
          setIsRecording(false);
          setMediaRecorder(null);
          setAudioStream(null);
          
          if (recordingTimer.current) {
            clearInterval(recordingTimer.current);
            recordingTimer.current = undefined;
          }
    
          // Only reset duration after it's been used
          setTimeout(() => setRecordingDuration(0), 100);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        setMediaRecorder(null);
        setAudioStream(null);
        setRecordingDuration(0);
      }
      
    };

    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
      }
    };

    const { data: recipientData } = useGetUserByIdQuery(recipientId || '', {
      skip: !recipientId // Skip if recipientId is not available
    });

    const handleOpenEmojiPicker = (messageId: string) => {
      setCurrentMessageId(messageId);
      setShowEmojiPicker(true);
    };
  
  // In PrivateMessageChat.tsx
  const handleEmojiSelect = async (emojiObject: any) => {
    try {
      if (currentMessageId) {
        // Use the private messages reaction mutation instead
        const result = await addReaction({
          messageId: currentMessageId,
          type: emojiObject.emoji  // Note: the private messages API uses 'type' instead of 'emoji'
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

  const { data: currentUserData } = useGetUserByIdQuery(currentUserId || '', {
    skip: !currentUserId // Skip if currentUserId is not available
  });

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
    
  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (recipientId && currentUserId && messages?.length) {
      markMessagesAsRead(recipientId).catch((err) =>
        console.error('Failed to mark messages as read:', err)
      );
    }
  }, [recipientId, currentUserId, messages]);


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
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [mediaRecorder, audioStream]);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);




    useEffect(() => {
      scrollToBottom();
    }, [localMessages]); 

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }, []); // Run once on mount
    
    useEffect(() => {
      const handleNewMessage = (message: PrivateMessage) => {
        if (
          message &&
          message.content &&
          (message.sender._id === recipientId || message.recipient._id === recipientId)
        ) {
          setLocalMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      };
    
      socketService.socket?.on('newPrivateMessage', handleNewMessage);
      socketService.socket?.on('messageSaved', handleNewMessage);
    
      return () => {
        socketService.socket?.off('newPrivateMessage', handleNewMessage);
        socketService.socket?.off('messageSaved', handleNewMessage);
      };
    }, [recipientId]);
    
    






    if (isLoading) return <div>Loading...</div>;

    


  return (
    <TooltipProvider>

    <div className="flex flex-col h-[calc(100vh-180px)]">
    {/* Header section remains the same */}
    <div className="p-4 border-b">
    {renderProfileInfo()}

  </div>
    
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4 overflow-hidden">
          {localMessages.map((msg) => (
    <div
      key={msg._id}
      className={`flex ${
        msg.sender._id === recipientId ? 'justify-start' : 'justify-end'
      } mb-4`}
    >
      <div className="flex items-start gap-2 max-w-[70%]">
  {msg.sender._id === recipientId && (
    <ProfilePreviewTooltip userId={msg.sender._id}>
      <Avatar 
        className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
        onClick={() => handleProfileClick(msg.sender._id)}
      >
        <AvatarImage 
          src={msg.sender.avatarUrl 
            ? `http://localhost:5000${msg.sender.avatarUrl}`
            : undefined}
          alt={msg.sender.name} 
        />
        <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
      </Avatar>
    </ProfilePreviewTooltip>
  )}

  {msg.sender._id !== recipientId && (
    <ProfilePreviewTooltip userId={msg.sender._id}>
      <Avatar 
        className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
        onClick={() => handleProfileClick(msg.sender._id)}
      >
        <AvatarImage 
          src={msg.sender.avatarUrl 
            ? `http://localhost:5000${msg.sender.avatarUrl}`
            : undefined}
          alt={msg.sender.name} 
        />
        <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
      </Avatar>
    </ProfilePreviewTooltip>
  )}

        {/* Message bubble */}
        <div
  className={`relative p-3 pr-16 rounded-lg ${  // Add pr-16 for more space on the right
    msg.sender._id === recipientId
      ? 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
      : 'bg-blue-500 text-white rounded-tr-none'
  }`}
>
          {/* Reply content if exists */}
          {msg.replyTo && (
            <div className="text-sm opacity-75 border-l-2 border-current pl-2 mb-1">
              <div className="italic">
                {msg.replyTo.sender._id === currentUserId 
                  ? `Reply to yourself`
                  : `Reply to ${msg.replyTo.sender.name}`}
              </div>
              <div className="truncate">{msg.replyTo.content}</div>
            </div>
          )}

          {/* Message content */}
          {editingMessageId === msg._id ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 p-1 rounded border text-gray-900"
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
              <div className="break-words">{msg.content}</div>

              {/* Audio message if exists */}
              {msg.audioUrl && (
                <div className="mt-2">
                  <audio controls preload="metadata" key={msg._id}>
                    <source src={msg.audioUrl} type="audio/mpeg" />
                    <source src={msg.audioUrl} type="audio/wav" />
                    <source src={msg.audioUrl} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                  {msg.duration && msg.duration > 0 && (
                    <span className="text-xs opacity-75 ml-2">
                      {Math.floor(msg.duration)}:
                      {Math.floor((msg.duration % 1) * 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              )}

              {/* Message footer */}
              <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {msg.sender._id === currentUserId && msg.isRead && (
                  <span>✓ Read</span>
                )}
              </div>

              {/* Message actions */}
            {/* Message actions */}
            <div className="absolute top-2 right-2 text-black-500 group-hover:text-green-700 transition-colors flex items-center gap-1">
            <button
      onClick={() => handleOpenEmojiPicker(msg._id)}
      className="p-1 rounded-full hover:bg-black/10"
    >
      <Smile size={16} />
    </button>
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-full hover:bg-black/10">
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {/* Reply option - available for all messages */}
        <DropdownMenuItem 
          onClick={() => handleReply(msg)}
          className="flex items-center gap-2"
        >
          <MessageSquare size={14} />
          Reply
        </DropdownMenuItem>

        {/* Edit and Delete options - only for user's own messages */}
        {msg.sender._id === currentUserId && (
          <>
            <DropdownMenuItem 
              onClick={() => handleStartEdit(msg._id, msg.content)}
              className="flex items-center gap-2"
            >
              <Edit2 size={14} />
              Edit
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleDeleteMessage(msg._id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
            </>
          )}

          {/* Reactions */}
          <MessageReacts 
            message={msg}
            currentUserId={currentUserId || ''}
          />
        </div>

        {/* Avatar - Show only for sender's messages on the right */}
        {msg.sender._id !== recipientId && (
          <Avatar 
            className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => handleProfileClick(msg.sender._id)}
          >
            <AvatarImage 
              src={msg.sender.avatarUrl 
                ? `http://localhost:5000${msg.sender.avatarUrl}`
                : undefined}
              alt={msg.sender.name} 
            />
            <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
          </Avatar>
        )}
      </div>
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

          {/* <div className="flex gap-2">
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
    onClick={isRecording ? stopRecording : startRecording}
    className={`px-4 py-2 rounded ${
      isRecording 
        ? 'bg-red-500 hover:bg-red-600' 
        : 'bg-blue-500 hover:bg-blue-600'
    } text-white`}
  >
    {isRecording ? <Square size={20} /> : <Mic size={20} />}
  </button>
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
          </div> */}
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
        <div className="absolute right-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
          >
            <Smile size={16} />
          </button>
        </div>
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
    type="button"
    onClick={isRecording ? stopRecording : startRecording}
    className={`px-4 py-2 rounded flex items-center gap-2 ${
      isRecording 
        ? 'bg-red-500 hover:bg-red-600' 
        : 'bg-blue-500 hover:bg-blue-600'
    } text-white`}
  >
    {isRecording ? (
      <>
        <Square size={20} />
        <span>{recordingDuration}s</span>
      </>
    ) : (
      <Mic size={20} />
    )}
  </button>
    <button
      type="submit"
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      <Send className="w-5 h-5 text-darkblack-400 hover:text-white-600 cursor-pointer" />
    </button>
  </div>
        </form>
        <ProfilePreviewDialog />

      </div>
          </TooltipProvider>

    );
  
    
  };

  export default PrivateMessageChat;