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
import {
  AlertCircle,
  ChevronLeft,
  Code,
  PlayCircle,
  Share2,
  Settings,
  Users,
  TerminalSquare
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const isUnmountingRef = useRef<boolean>(false);
  const lastSyncedCodeRef = useRef<string>('');
  const isLocalChangeRef = useRef<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const {
    room,
    code,
    language,
    theme,
    isLoading,
    error,
    connectedUsers,
    userLeftRoom,
    handleCodeChange,
    changeLanguage,
    changeTheme
  } = useCodeRoom(roomId);

  // Initialize local code when the room first loads
  useEffect(() => {
    if (code && !localCode) {
      setLocalCode(code);
      lastSyncedCodeRef.current = code;
    }
  }, [code, localCode]);

  // Update local code when server code changes (from other users)
  useEffect(() => {
    // Only update if we have a code value and it differs from our local value
    // and it's not a local change we just made
    if (code && code !== localCode && !isLocalChangeRef.current) {
      console.log('Updating editor with server code');
      setLocalCode(code);
      lastSyncedCodeRef.current = code;

      // If we have an editor reference, update it directly
      if (editorRef.current) {
        const currentPosition = editorRef.current.getPosition();
        editorRef.current.setValue(code);
        if (currentPosition) {
          editorRef.current.setPosition(currentPosition);
        }
      }
    }

    // Reset the local change flag
    isLocalChangeRef.current = false;
  }, [code, localCode]);

  // Handle editor mount
  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set initial value if we have code
    if (code) {
      editor.setValue(code);
      lastSyncedCodeRef.current = code;
    }
  };

  // Handle editor change with debounce to prevent infinite loops
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      // Always update local state immediately
      setLocalCode(value);

      // Mark this as a local change
      isLocalChangeRef.current = true;

      // Clear any existing timeout
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }

      // Debounce code updates to server
      codeUpdateTimeoutRef.current = setTimeout(() => {
        // Only send to server if the code has actually changed
        if (value !== lastSyncedCodeRef.current) {
          console.log('Sending code update to server');
          handleCodeChange(value);
          lastSyncedCodeRef.current = value;
        }
      }, 500);
    }
  };

  // Execute code function
  const executeCode = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    setDialogOpen(true);

    try {
      // Get the current code from editor
      const currentCode = editorRef.current?.getValue() || localCode;

      // Validate we have code to execute
      if (!currentCode || currentCode.trim() === '') {
        setExecutionError('No code to execute');
        setIsExecuting(false);
        return;
      }

      // Make sure the JSON is valid
      const payload = { code: currentCode };

      // Send to execution API
      const response = await axios.post('http://127.0.0.1:8000/run', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Format the response based on the actual structure
      const result = response.data;

      let formattedOutput = '';

      // Add stdout if it exists
      if (result.stdout && result.stdout.trim()) {
        formattedOutput += `Output:\n${result.stdout}`;
      }

      // Add stderr if it exists (shows errors)
      if (result.stderr && result.stderr.trim()) {
        if (formattedOutput) formattedOutput += '\n\n';
        formattedOutput += `Errors:\n${result.stderr}`;
      }

      // Show full output in the result section
      setExecutionResult(formattedOutput || 'Code executed with no output');

      // If returncode is not 0, it means there was an error
      if (result.returncode !== 0) {
        setExecutionError(`Execution failed with code ${result.returncode}`);
      }
    } catch (err) {
      console.error('Error executing code:', err);
      setExecutionError(err instanceof Error ? err.message : 'Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };

  // Close dialog handler
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle dialog trigger
  const handleOpenResults = () => {
    if (executionResult || executionError) {
      setDialogOpen(true);
    } else {
      executeCode();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;

      // Clear any pending timeouts
      if (codeUpdateTimeoutRef.current) {
        clearTimeout(codeUpdateTimeoutRef.current);
      }

      // Don't leave the room when unmounting to maintain the connection
      // This prevents the socket from disconnecting
    };
  }, []);

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
                  variant={!userLeftRoom ? "default" : "destructive"}
                  className={!userLeftRoom ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {!userLeftRoom ? "Connected" : "User Left Room"}
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

            <Button
                variant="default"
                size="sm"
                onClick={executeCode}
                disabled={isExecuting}
                className="bg-green-600 hover:bg-green-700"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              {isExecuting ? 'Running...' : 'Run Code'}
            </Button>

            {(executionResult || executionError) && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenResults}
                >
                  <TerminalSquare className="h-4 w-4 mr-2" />
                  View Results
                </Button>
            )}

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

        {/* Main Content - Editor */}
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
                  className={`h-2 w-2 rounded-full mr-2 ${!userLeftRoom ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span>
              {!userLeftRoom ? 'Connected' : 'User Left Room'} • Last change made 2 minutes ago
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

        {/* Execution Results Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <TerminalSquare className="mr-2 h-5 w-5" />
                {isExecuting ? 'Running Code...' : 'Execution Results'}
              </DialogTitle>
              <DialogDescription>
                {language === 'javascript' || language === 'typescript'
                    ? 'JavaScript execution results'
                    : language === 'python'
                        ? 'Python execution results'
                        : `${language} execution results`}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-auto">
              {isExecuting && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="ml-3">Running your code...</span>
                  </div>
              )}

              {executionError && !isExecuting && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{executionError}</AlertDescription>
                  </Alert>
              )}

              {executionResult && !isExecuting && (
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md overflow-auto">
                {executionResult}
              </pre>
              )}

              {!executionResult && !executionError && !isExecuting && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <PlayCircle className="h-12 w-12 mb-2 opacity-30" />
                    <p>Run your code to see results here</p>
                  </div>
              )}
            </div>

            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isExecuting}
              >
                Close
              </Button>
              <Button
                  variant="default"
                  onClick={executeCode}
                  disabled={isExecuting}
                  className="bg-green-600 hover:bg-green-700"
              >
                {isExecuting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Running...
                    </>
                ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Run Again
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default CodingRoomPage;
