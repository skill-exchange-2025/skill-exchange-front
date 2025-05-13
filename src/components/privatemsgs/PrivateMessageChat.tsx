  import { 
    useGetMessagesWithUserQuery, 
    useSendPrivateMessageMutation,
    useDeletePrivateMessageMutation,
    useEditPrivateMessageMutation ,
    useAddReactionMutation,
    useMarkMessagesAsReadMutation,
    useSendVoiceMessageMutation,
    useUploadFileWithMessageMutation
  } from '@/redux/features/privatemsgs/privateMessagesApi';
  import { MoreVertical, Paperclip } from 'lucide-react';
  import { socketService } from '@/services/socketService';
  import React, { useState, useEffect, useRef } from 'react';
  import { Mic, Square,Trash2, Edit2, X, Check, MessageSquare, Smile, Send } from 'lucide-react';
  import { useAppSelector } from '@/redux/hooks';
  import { PrivateMessage } from '@/types/user';
  import { useGetUserByIdQuery } from '@/redux/features/users/usersApi';
  import { ScrollArea } from '@/components/ui/scroll-area';
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
  import { useGetProfileByUserIdQuery } from '@/redux/features/profile/profileApi';
  import { Button } from 'antd';
  import { TooltipProvider } from '@radix-ui/react-tooltip';
import { toast } from 'sonner';



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
  }) => {
     const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFileWithMessage] = useUploadFileWithMessageMutation();
    const navigate = useNavigate();
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    const [showProfilePreview, setShowProfilePreview] = useState(false);

    const { data: recipientProfile } = useGetProfileByUserIdQuery(recipientId);
    const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
    const [sendVoiceMessage] = useSendVoiceMessageMutation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [addReaction] = useAddReactionMutation();
    const [markMessagesAsRead] = useMarkMessagesAsReadMutation();
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const recordingTimer = useRef<NodeJS.Timeout>();
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
      const [message, setMessage] = useState('');
      const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
      const [editContent, setEditContent] = useState('');
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
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB'
      });
      return;
    }

    // Validate file type if needed
    const allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'];
    if (!allowedTypes.some(type => file.type.match(type))) {
      toast.error('Invalid file type', {
        description: 'Please select an image, PDF, or document file'
      });
      return;
    }

    setSelectedFile(file);
  }
};


      const ProfilePreviewDialog = () => (
        <Dialog open={showProfilePreview} onOpenChange={setShowProfilePreview}>
          <DialogContent className="max-w-3xl">
            <ProfileView />
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
      }


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
      console.log('Opening emoji picker for message:', messageId);
      setCurrentMessageId(messageId);
      setShowEmojiPicker(true);
    };
  
  const handleEmojiSelect = async (emojiObject: any) => {
    try {
      if (currentMessageId) {
        // Log de l'URL complète
        const url = `/api/private-messages/${currentMessageId}/reactions`;
        console.log('URL de la requête:', url);
        console.log('Données envoyées:', {
          messageId: currentMessageId,
          type: emojiObject.emoji
        });

        const result = await addReaction({
          messageId: currentMessageId,
          type: emojiObject.emoji
        }).unwrap();

        console.log('Réponse du serveur:', result);

        // Mise à jour optimiste des messages locaux
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
                    }
                  ]
                }
              : msg
          )
        );

        // Émettre l'événement socket
        socketService.socket?.emit('reactionAdded', {
          messageId: currentMessageId,
          type: emojiObject.emoji,
          userId: currentUserId
        });

        setShowEmojiPicker(false);
        setCurrentMessageId(null);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      toast.error('Échec de l\'ajout de la réaction');
    }
  };

useEffect(() => {
  // Initialiser la connexion socket
  const initializeSocket = async () => {
    try {
      if (!socketService.socket?.connected) {
        await socketService.connect(recipientId);
        console.log('Socket connecté avec succès');
      }
    } catch (error) {
      console.error('Erreur de connexion socket:', error);
    }
  };

  initializeSocket();

  // Nettoyage lors du démontage du composant
  return () => {
    if (socketService.socket?.connected) {
      socketService.socket.disconnect();
    }
  };
}, []); // Exécuter une seule fois au montage

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!message.trim() && !selectedFile) return;

  try {
    // Vérifier la connexion socket avant d'envoyer
    if (!socketService.socket?.connected) {
      console.log('Tentative de reconnexion socket...');
      await socketService.connect(recipientId);
    }

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('recipientId', recipientId);
      if (message.trim()) {
        formData.append('content', message);
      }
      if (replyTo?._id) {
        formData.append('replyTo', replyTo._id);
      }

      const result = await uploadFileWithMessage(formData).unwrap();
      
      if (socketService.socket?.connected) {
        socketService.socket.emit('newPrivateMessage', {
          recipientId,
          content: message.trim() || '',
          attachment: {
            filename: selectedFile.name,
            originalname: selectedFile.name,
            mimetype: selectedFile.type,
            size: selectedFile.size,
            path: result.attachment?.path
          }
        });
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (message.trim()) {
      await sendMessage({
        recipientId,
        content: message,
        replyTo: replyTo?._id
      }).unwrap();
      
      if (socketService.socket?.connected) {
        socketService.sendPrivateMessage(recipientId, message);
      }
    }

    setMessage('');
    setReplyTo(null);
    
    setTimeout(scrollToBottom, 100);
  } catch (error) {
    console.error('Failed to send message:', error);
    toast.error('Failed to send message', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
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

    useGetUserByIdQuery(currentUserId || '', {
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
    const handleReactionAdded = (data: { messageId: string, type: string, userId: string }) => {
      setLocalMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  {
                    type: data.type,
                    user: data.userId,
                    _id: Date.now().toString() // ID temporaire
                  }
                ]
              }
            : msg
        )
      );
    };

    const handleReactionRemoved = (data: { messageId: string, type: string, userId: string }) => {
      setLocalMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? {
                ...msg,
                reactions: (msg.reactions || []).filter(
                  reaction => !(reaction.type === data.type && reaction.user === data.userId)
                )
              }
            : msg
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
      (message.content || message.attachment) &&
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
        {/* Avatar pour l'autre utilisateur */}
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

        {/* Message bubble */}
        <div
          className={`relative p-3 pr-16 rounded-lg ${
            msg.sender._id === recipientId
              ? 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
              : 'bg-blue-500 text-white rounded-tr-none'
          }`}
        >
          <div className="text-sm font-semibold mb-1">
            {msg.sender.name}
          </div>
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
          
{msg.attachment && (
  <div className="mt-2">
    {msg.attachment.mimetype.startsWith('image/') ? (
      <img 
        src={`http://localhost:5000${msg.attachment.path}`}
        alt={msg.attachment.originalname} 
        className="max-w-full rounded-lg"
      />
    ) : (
      <a 
        href={`http://localhost:5000${msg.attachment.path}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
      >
        <Paperclip size={16} />
        <span className="text-sm">{msg.attachment.originalname}</span>
      </a>
    )}
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

        {/* Avatar pour l'utilisateur actuel */}
        {msg.sender._id === currentUserId && (
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
          <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
        >
          <Paperclip size={16} />
        </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
          >
            <Smile size={16} />
          </button>
        </div>
      </div>
      {selectedFile && (
      <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
        <div className="flex items-center">
          <Paperclip size={16} className="mr-2" />
          <span className="text-sm truncate">{selectedFile.name}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="text-gray-500 hover:text-red-500"
        >
          <X size={16} />
        </button>
      </div>
    )}
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
