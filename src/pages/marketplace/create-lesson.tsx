import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCreateLessonMutation } from '@/redux/features/lessons/lessonApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileTextIcon,
    Clock,
    FileText,
    Save,
    ChevronLeft,
    Eye,
    CheckCircle,
    Upload,
    X,
    File
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect, useCallback } from "react";
import { filesToBase64 } from '@/utils/fileUpload';
import dynamic from 'next/dynamic';

// Dynamically import markdown editor with SSR disabled
const MarkdownEditor = dynamic(
    () => import('@uiw/react-markdown-editor'),
    { ssr: false }
);

interface UploadedFile {
    name: string;
    size: number;
    type: string;
    url: string;
}

// Custom MarkdownTextarea component
const MarkdownTextarea = ({ value, onChange, initialRows = 20, className = '', placeholder = '' }) => {
    return (
        <div className={`markdown-editor-container ${className}`}>
            <MarkdownEditor
                value={value}
                onChange={(value) => {
                    onChange({ target: { name: 'content', value } });
                }}
                height={`${initialRows * 24}px`}
                visible={true}
                placeholder={placeholder}
                options={{
                    scrollbarStyle: "overlay",
                    lineWrapping: true
                }}
                enablePreview={true}
                previewWidth="50%"
                className="border rounded-md overflow-hidden"
            />
        </div>
    );
};

export function CreateLesson() {
    const { id: listingId } = useParams();
    const navigate = useNavigate();
    const [createLesson, { isLoading }] = useCreateLessonMutation();
    const [previewMode, setPreviewMode] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [createdLesson, setCreatedLesson] = useState(null);
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [fileUploadError, setFileUploadError] = useState<string | null>(null);

    const [lessonData, setLessonData] = useState({
        title: '',
        description: '',
        duration: 0,
        content: '',
        materials: [] as string[]
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setEditorLoaded(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLessonData((prev) => ({
            ...prev,
            [name]: name === 'duration' ? Number(value) : value,
        }));
    };

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate file types and sizes
        const maxSize = 10 * 1024 * 1024; // 10MB
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            setFileUploadError('Only PDF and Word documents are allowed');
            return;
        }

        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            setFileUploadError('Files must be smaller than 10MB');
            return;
        }

        setFileUploadError(null);

        try {
            // Convert files to base64 for preview and temporary storage
            const base64Files = await filesToBase64(files);

            const newFiles: UploadedFile[] = files.map((file, index) => ({
                name: file.name,
                size: file.size,
                type: file.type,
                url: base64Files[index]
            }));

            setUploadedFiles(prev => [...prev, ...newFiles]);
            setLessonData(prev => ({
                ...prev,
                materials: [...prev.materials, ...base64Files]
            }));

            toast.success('Files uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload files');
            setFileUploadError('Failed to process files');
        }
    }, []);

    const removeFile = (index: number) => {
        setUploadedFiles(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });

        setLessonData(prev => ({
            ...prev,
            materials: prev.materials.filter((_, i) => i !== index)
        }));
    };

    const getFileSize = (size: number): string => {
        if (size < 1024) return `${size} bytes`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!listingId) {
            toast.error('No listing ID provided.');
            return;
        }

        const payload = {
            title: lessonData.title,
            description: lessonData.description,
            duration: Number(lessonData.duration),
            content: lessonData.content,
            materials: lessonData.materials
        };

        try {
            const result = await createLesson({ listingId, data: payload }).unwrap();
            toast.success('Lesson created successfully!');
            setCreatedLesson(result);
            setSuccessDialogOpen(true);
        } catch (error) {
            console.error('Failed to create lesson:', error);
            toast.error(error?.data?.message || 'Failed to create lesson');
        }
    };

    const insertTemplate = (template) => {
        setLessonData((prev) => ({
            ...prev,
            content: prev.content ? `${prev.content}\n\n${template}` : template
        }));
    };

    const handleViewCreatedLesson = () => {
        setSuccessDialogOpen(false);
        if (createdLesson?._id) {
            navigate(`/marketplace/item/${listingId}/lessons/${createdLesson._id}`);
        } else {
            navigate(`/marketplace/item/${listingId}/lessons`);
        }
    };

    const handleReturnToLessons = () => {
        setSuccessDialogOpen(false);
        navigate(`/marketplace/item/${listingId}/lessons`);
    };

    // Default markdown placeholder content
    const defaultMarkdownPlaceholder = `# Lesson Content

Write your lesson content using Markdown formatting.

## Section 1
This is where you can add your content, including:
- Key points
- Examples
- Explanations

## Section 2
Continue organizing your lesson with additional sections.`;

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => navigate(`/marketplace/item/${listingId}/lessons`)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Lessons
                </Button>
                <h1 className="text-3xl font-bold">Create New Lesson</h1>
            </div>

            <Card className="shadow-md">
                <CardHeader className="bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">Lesson Details</CardTitle>
                            <CardDescription>Create educational content for your students</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-primary text-white">
                            <FileTextIcon className="h-4 w-4 mr-1" /> New Lesson
                        </Badge>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Lesson Title</label>
                                <Input
                                    name="title"
                                    value={lessonData.title}
                                    onChange={handleChange}
                                    placeholder="Enter an engaging lesson title"
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    <Clock className="h-4 w-4 inline mr-1" /> Duration (minutes)
                                </label>
                                <Input
                                    type="number"
                                    name="duration"
                                    value={lessonData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 60"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea
                                name="description"
                                value={lessonData.description}
                                onChange={handleChange}
                                placeholder="Provide a brief overview of what students will learn"
                                required
                                className="resize-none"
                                rows={3}
                            />
                        </div>

                        <Separator />

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">Lesson Content</label>
                                <div className="space-x-2">
                                    <Button
                                        type="button"
                                        variant={previewMode ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => setPreviewMode(false)}
                                    >
                                        <FileText className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={previewMode ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPreviewMode(true)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" /> Preview
                                    </Button>
                                </div>
                            </div>

                            {previewMode ? (
                                <div className="prose max-w-none border rounded-md p-4 bg-white min-h-[300px] overflow-y-auto">
                                    {lessonData.content ? (
                                        <ReactMarkdown>
                                            {lessonData.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="text-gray-400 italic">Content preview will appear here...</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Tabs defaultValue="editor">
                                        <TabsList className="mb-2">
                                            <TabsTrigger value="editor">Editor</TabsTrigger>
                                            <TabsTrigger value="templates">Templates</TabsTrigger>
                                            <TabsTrigger value="help">Markdown Help</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="editor" className="mt-0">
                                            {editorLoaded ? (
                                                <MarkdownTextarea
                                                    value={lessonData.content}
                                                    onChange={handleChange}
                                                    initialRows={12}
                                                    placeholder={defaultMarkdownPlaceholder}
                                                    className="min-h-[300px]"
                                                />
                                            ) : (
                                                <Textarea
                                                    name="content"
                                                    value={lessonData.content}
                                                    onChange={handleChange}
                                                    placeholder={defaultMarkdownPlaceholder}
                                                    required
                                                    className="font-mono text-sm min-h-[300px]"
                                                    rows={12}
                                                />
                                            )}
                                        </TabsContent>

                                        <TabsContent value="templates" className="mt-0">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("# Lesson Overview\n\n## Learning Objectives\n- Objective 1\n- Objective 2\n- Objective 3\n\n## Prerequisites\n- Prerequisite 1\n- Prerequisite 2")}>
                                                    <CardHeader className="py-3">
                                                        <CardTitle className="text-sm">Lesson Overview</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="py-2 text-xs text-gray-500">
                                                        Insert lesson objectives and prerequisites structure
                                                    </CardContent>
                                                </Card>

                                                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("## Key Concept: [Name]\n\n### Definition\nProvide definition here\n\n### Examples\n1. First example\n2. Second example\n\n### Practice Exercise\nDescribe a practice activity here")}>
                                                    <CardHeader className="py-3">
                                                        <CardTitle className="text-sm">Key Concept</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="py-2 text-xs text-gray-500">
                                                        Insert a key concept with examples and practice
                                                    </CardContent>
                                                </Card>

                                                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("## Discussion Questions\n\n1. Question 1?\n   * Hint or guidance\n   * Possible answer\n\n2. Question 2?\n   * Hint or guidance\n   * Possible answer")}>
                                                    <CardHeader className="py-3">
                                                        <CardTitle className="text-sm">Discussion Questions</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="py-2 text-xs text-gray-500">
                                                        Insert discussion questions with hints
                                                    </CardContent>
                                                </Card>

                                                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("## Assignment\n\n### Instructions\nProvide detailed instructions here\n\n### Requirements\n- Requirement 1\n- Requirement 2\n\n### Submission Guidelines\nExplain how to submit the assignment")}>
                                                    <CardHeader className="py-3">
                                                        <CardTitle className="text-sm">Assignment Template</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="py-2 text-xs text-gray-500">
                                                        Insert an assignment with instructions
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="help" className="mt-0">
                                            <div className="bg-white p-4 border rounded-md text-sm">
                                                <h3 className="font-medium mb-2">Markdown Cheat Sheet</h3>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-sm">Headers</h4>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs"># Heading 1
## Heading 2
### Heading 3</pre>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-sm">Text Formatting</h4>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">**Bold text**
*Italic text*
~~Strikethrough~~</pre>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-sm">Lists</h4>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">- Bullet point
1. Numbered list
   - Nested item</pre>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-sm">Links & Images</h4>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">[Link text](URL)
![Image alt](URL)</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                <Upload className="h-4 w-4 inline mr-1" /> Upload Materials
                            </label>
                            <div className="mt-2">
                                <Input
                                    type="file"
                                    onChange={handleFileUpload}
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload PDF and Word documents (max 10MB each)
                                </p>
                                {fileUploadError && (
                                    <p className="text-sm text-red-500 mt-1">{fileUploadError}</p>
                                )}
                            </div>
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <h4 className="text-sm font-medium">Uploaded Files</h4>
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-md">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{getFileSize(file.size)}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="text-gray-500 hover:text-red-500"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="mr-2"
                                onClick={() => navigate(`/marketplace/item/${listingId}/lessons`)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="px-6"
                            >
                                {isLoading ? 'Creating...' : (
                                    <>
                                        <Save className="h-4 w-4 mr-1" /> Save Lesson
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>

            <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-green-600">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Lesson Created Successfully
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Your lesson "{createdLesson?.title}" has been created successfully. What would you like to do next?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h3 className="text-sm font-medium mb-2">Lesson Content Preview</h3>
                        <div className="max-h-40 overflow-y-auto prose prose-sm">
                            {createdLesson?.content ? (
                                <ReactMarkdown>
                                    {createdLesson.content.substring(0, 300)}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-gray-500 italic">No content available.</p>
                            )}
                            {createdLesson?.content && createdLesson.content.length > 300 && (
                                <div className="text-primary text-sm">
                                    ... (content continues)
                                </div>
                            )}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleReturnToLessons}>
                            Return to All Lessons
                        </AlertDialogAction>
                        <AlertDialogAction onClick={handleViewCreatedLesson} className="bg-primary">
                            <Eye className="h-4 w-4 mr-1" />
                            View Full Lesson
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default CreateLesson;