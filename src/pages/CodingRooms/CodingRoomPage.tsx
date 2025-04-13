// src/pages/CodingRooms/CodingRoomPage.tsx
import { Button } from '@/components/ui/button';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useCodeRoom } from '@/hooks/useCodeRoom';
import * as Monaco from 'monaco-editor';
// rest of imports remain the same
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft, Code, Share2, Settings, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface ErrorWithMessage {
  message?: string;
}

const CodingRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const [localCode, setLocalCode] = useState<string>('');
  const codeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // This ensures we don't trigger updates when we just received code
  const skipNextUpdateRef = useRef<boolean>(false);

  const {
    room,
    code,
    language,
    theme,
    isLoading,
    error,
    isConnected,
    connectedUsers,
    handleCodeChange,
    changeLanguage,
    changeTheme
  } = useCodeRoom(roomId);

  // Initialize local code when the room first loads
  useEffect(() => {
    if (code && !localCode) {
      setLocalCode(code);
    }
  }, [code, localCode]);

  // Update local code when server code changes (from other users)
  useEffect(() => {
    // Only update if we have a code value and it differs from our local value
    if (code && code !== localCode && !skipNextUpdateRef.current) {
      setLocalCode(code);
    }
    skipNextUpdateRef.current = false;
  }, [code, localCode]);

  // Handle editor mount
  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Handle editor change with debounce to prevent infinite loops
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && value !== code) {
      setLocalCode(value);

      // Clear any existing timeout
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }

      // Debounce code updates to server
      codeUpdateTimeoutRef.current = setTimeout(() => {
        skipNextUpdateRef.current = true;
        handleCodeChange(value);
      }, 500);
    }
  };



  // Rest of the component stays the same
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-120px)]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading coding room...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto py-8 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as ErrorWithMessage).message || 'Unable to load the coding room'}
            </AlertDescription>
          </Alert>
          <Button
              className="mt-4 w-full"
              onClick={() => navigate('/coding-rooms')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Room List
          </Button>
        </div>
    );
  }

  if (!room) {
    return (
        <div className="container mx-auto py-8 max-w-md">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>The requested coding room was not found.</AlertDescription>
          </Alert>
          <Button
              className="mt-4 w-full"
              onClick={() => navigate('/coding-rooms')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Room List
          </Button>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
        {/* Header */}
        <div className="bg-background border-b p-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-xl">{room.name}</h1>
              {room.isPrivate && (
                  <Badge variant="outline">Private</Badge>
              )}
              <Badge
                  variant={isConnected ? "default" : "destructive"}
                  className={isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{connectedUsers.length} user(s) online</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Room participants</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex -space-x-2">
                {room.participants?.slice(0, 3).map((participant, index) => (
                    <Avatar key={`${participant.user}-${index}`} className="border-2 border-background">
                      <AvatarFallback>
                        {participant.username?.substring(0, 2) || `U${index + 1}`}
                      </AvatarFallback>
                    </Avatar>
                ))}
                {(room.participants?.length || 0) > 3 && (
                    <Avatar className="border-2 border-background">
                      <AvatarFallback>
                        +{(room.participants?.length || 0) - 3}
                      </AvatarFallback>
                    </Avatar>
                )}
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-muted-foreground" />
              <Select
                  value={language}
                  onValueChange={changeLanguage}
              >
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <Select
                  value={theme}
                  onValueChange={changeTheme}
              >
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vs">Light</SelectItem>
                  <SelectItem value="vs-dark">Dark</SelectItem>
                  <SelectItem value="hc-black">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/coding-rooms')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Exit Room
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-grow relative">
          <Editor
              height="100%"
              language={language}
              value={localCode}
              theme={theme}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                fontFamily: "'JetBrains Mono', monospace",
                padding: { top: 10 },
                tabSize: 2,
              }}
          />
        </div>

        {/* Connected Users Bar */}
        <div className="border-t py-1 px-4 bg-background">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div
                  className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span>
              {isConnected ? 'Connected' : 'Disconnected'} • Last change made 2 minutes ago
            </span>
            </div>

            <Separator orientation="vertical" className="h-3" />

            <div>
              Tags:
              {room.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="ml-1 text-xs">
                    {tag}
                  </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CodingRoomPage;
