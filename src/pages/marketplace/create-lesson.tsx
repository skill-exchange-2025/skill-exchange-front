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
    HelpCircle,
    Moon,
    Sun
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect, useCallback } from "react";
import { filesToBase64 } from '@/utils/fileUpload';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
const MarkdownTextarea = ({
                              name = 'textContent',
                              value,
                              onChange,
                              initialRows = 20,
                              className = '',
                              placeholder = ''
                          }) => {
    return (
        <div className={`markdown-editor-container ${className}`}>
            <MarkdownEditor
                value={value}
                onChange={(val) => {
                    onChange({ target: { name, value: val } });
                }}
                height={`${initialRows * 24}px`}
                visible={true}
                placeholder={placeholder}
                options={{
                    scrollbarStyle: 'overlay',
                    lineWrapping: true,
                    theme: 'light',
                    mode: 'markdown',
                    lineNumbers: true,
                    styleActiveLine: true
                }}
                enablePreview={true}
                previewWidth="50%"
                className="border rounded-md overflow-hidden"
            />
        </div>
    );
};

const PreviewContent = ({ content }) => {
    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <FileText className="h-12 w-12 mb-2" />
                <p className="text-sm">No content to preview yet. Start writing to see the preview.</p>
            </div>
        );
    }

    return (
        <div className="prose prose-slate max-w-none">
            <ReactMarkdown
                components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 mt-6">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-medium mb-2 mt-4">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-700">{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>
                    ),
                    code: ({ children }) => (
                        <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                        <pre className="bg-gray-900 text-white rounded-lg p-4 overflow-x-auto">{children}</pre>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
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
    const [setMarkdownScore] = useState(0);
    const [achievements, setAchievements] = useState<string[]>([]);
    const { theme, setTheme } = useTheme();

    const [lessonData, setLessonData] = useState({
        title: '',
        description: '',
        duration: 0,
        textContent: '',
        materials: [] as string[]
    });

    // Add this new state for split view
    const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setEditorLoaded(true);
        }
    }, []);

    const trackMarkdownUsage = (content: string) => {
        let score = 0;
        const newAchievements = [];

        // Headers
        if (content.includes('#')) score += 10;
        if (content.includes('##')) {
            score += 5;
            if (!achievements.includes('Header Master'))
                newAchievements.push('Header Master');
        }

        // Lists
        if (content.includes('- ')) score += 8;
        if (content.includes('1. ')) {
            score += 8;
            if (!achievements.includes('List Pro'))
                newAchievements.push('List Pro');
        }

        // Code blocks
        if (content.includes('```')) {
            score += 15;
            if (!achievements.includes('Code Wizard'))
                newAchievements.push('Code Wizard');
        }

        // Tables
        if (content.includes('|---')) {
            score += 20;
            if (!achievements.includes('Table Master'))
                newAchievements.push('Table Master');
        }

        setMarkdownScore(score);
        if (newAchievements.length > 0) {
            setAchievements([...achievements, ...newAchievements]);
            newAchievements.forEach(achievement => {
                toast.success(`🏆 Achievement Unlocked: ${achievement}!`, {
                    description: "Keep using advanced Markdown features to earn more achievements!"
                });
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setLessonData((prev) => {
            const newData = {
                ...prev,
                [name]: name === 'duration' ? Number(value) : value
            };

            // Track markdown usage when content changes
            if (name === 'textContent' || name === 'content') {
                trackMarkdownUsage(value);
            }

            return newData;
        });
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
            textContent: lessonData.textContent,
            materials: lessonData.materials
        };

        try {
            const result = await createLesson({ listingId, data: payload }).unwrap();
            toast.success('Lesson created successfully!');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setCreatedLesson(result);
            setSuccessDialogOpen(true);
        } catch (error) {
            console.error('Failed to create lesson:', error);
        }
    };

    const insertTemplate = (template) => {
        setLessonData((prev) => ({
            ...prev,
            textContent: prev.textContent ? `${prev.textContent}\n\n${template}` : template
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
        <div className={cn(
            "container py-8",
            "transition-colors duration-200",
            "dark:bg-gray-900"
        )}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/marketplace/item/${listingId}/lessons`)}
                        className={cn(
                            "dark:bg-gray-800 dark:hover:bg-gray-700",
                            "transition-all duration-200"
                        )}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Lessons
                    </Button>
                    <h1 className="text-3xl font-bold dark:text-white">Create New Lesson</h1>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className={cn(
                                        "dark:bg-gray-800 dark:hover:bg-gray-700",
                                        "transition-all duration-200"
                                    )}
                                >
                                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Toggle theme</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <Card className={cn(
                "shadow-md",
                "dark:bg-gray-800 dark:border-gray-700",
                "transition-all duration-200"
            )}>
                <CardHeader className={cn(
                    "bg-gray-50 border-b",
                    "dark:bg-gray-800/50 dark:border-gray-700",
                    "transition-colors duration-200"
                )}>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl dark:text-white">Lesson Details</CardTitle>
                            <CardDescription className="dark:text-gray-400">Create educational content for your students</CardDescription>
                        </div>
                        <Badge variant="outline" className={cn(
                            "bg-primary text-white",
                            "dark:bg-primary/20 dark:text-primary-foreground"
                        )}>
                            <FileTextIcon className="h-4 w-4 mr-1" /> New Lesson
                        </Badge>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className={cn(
                        "space-y-6 p-6",
                        "dark:bg-gray-800/50"
                    )}>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium dark:text-gray-200">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1">
                                                    Lesson Title
                                                    <HelpCircle className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Choose a clear and engaging title for your lesson</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </label>
                                <Input
                                    name="title"
                                    value={lessonData.title}
                                    onChange={handleChange}
                                    placeholder="Enter an engaging lesson title"
                                    required
                                    className={cn(
                                        "w-full",
                                        "dark:bg-gray-900 dark:border-gray-700 dark:text-white",
                                        "focus:ring-primary dark:focus:ring-primary/50",
                                        "transition-colors duration-200"
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium dark:text-gray-200">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" /> Duration (minutes)
                                                    <HelpCircle className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Estimated time to complete the lesson</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </label>
                                <Input
                                    type="number"
                                    name="duration"
                                    value={lessonData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 60"
                                    required
                                    className={cn(
                                        "dark:bg-gray-900 dark:border-gray-700 dark:text-white",
                                        "focus:ring-primary dark:focus:ring-primary/50",
                                        "transition-colors duration-200"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium dark:text-gray-200">Description</label>
                            <Textarea
                                name="description"
                                value={lessonData.description}
                                onChange={handleChange}
                                placeholder="Provide a brief overview of what students will learn"
                                required
                                className={cn(
                                    "resize-none",
                                    "dark:bg-gray-900 dark:border-gray-700 dark:text-white",
                                    "focus:ring-primary dark:focus:ring-primary/50",
                                    "transition-colors duration-200"
                                )}
                                rows={3}
                            />
                        </div>

                        <Separator className="dark:border-gray-700" />

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium dark:text-gray-200">Lesson Content</label>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        type="button"
                                        variant={viewMode === 'edit' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode('edit')}
                                        className={cn(
                                            "dark:bg-gray-800 dark:hover:bg-gray-700",
                                            "transition-all duration-200"
                                        )}
                                    >
                                        <FileText className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={viewMode === 'split' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode('split')}
                                        className={cn(
                                            "dark:bg-gray-800 dark:hover:bg-gray-700",
                                            "transition-all duration-200"
                                        )}
                                    >
                                        <Eye className="h-4 w-4 mr-1" /> Split View
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={viewMode === 'preview' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode('preview')}
                                        className={cn(
                                            "dark:bg-gray-800 dark:hover:bg-gray-700",
                                            "transition-all duration-200"
                                        )}
                                    >
                                        <Eye className="h-4 w-4 mr-1" /> Preview
                                    </Button>
                                </div>
                            </div>

                            <div className={viewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''}>
                                {(viewMode === 'edit' || viewMode === 'split') && (
                                    <div className={cn(
                                        viewMode === 'split' ? 'border-r pr-4' : '',
                                        "dark:border-gray-700"
                                    )}>
                                        <Tabs defaultValue="editor" className="dark:border-gray-700">
                                            <TabsList className={cn(
                                                "mb-2",
                                                "dark:bg-gray-800",
                                                "transition-colors duration-200"
                                            )}>
                                                <TabsTrigger value="editor" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-700">Editor</TabsTrigger>
                                                <TabsTrigger value="templates" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-700">Templates</TabsTrigger>
                                                <TabsTrigger value="help" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-700">Markdown Help</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="editor" className="mt-0">
                                                {editorLoaded ? (
                                                    <MarkdownTextarea
                                                        name="textContent"
                                                        value={lessonData.textContent}
                                                        onChange={handleChange}
                                                        placeholder="Write your lesson content here..."
                                                        initialRows={20}
                                                    />
                                                ) : (
                                                    <Textarea
                                                        name="textContent"
                                                        value={lessonData.textContent}
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
                                                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("# 📚 Lesson Overview\n\n## 🎯 Learning Objectives\n- Objective 1\n- Objective 2\n- Objective 3\n\n## 📋 Prerequisites\n- Prerequisite 1\n- Prerequisite 2\n\n## ⏱️ Time Breakdown\n- Introduction (10 min)\n- Main Content (30 min)\n- Practice (15 min)\n- Discussion (5 min)")}>
                                                        <CardHeader className="py-3">
                                                            <CardTitle className="text-sm">Detailed Lesson Plan</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-2 text-xs text-gray-500">
                                                            Comprehensive lesson structure with time management
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("# 🎯 Interactive Exercise\n\n## 🤔 Challenge Scenario\nDescribe an engaging real-world scenario here\n\n## 🔍 Task Breakdown\n1. Initial Analysis\n   - What do you observe?\n   - What are the key elements?\n\n2. Problem-Solving Steps\n   - Step 1: [Action]\n   - Step 2: [Action]\n   - Step 3: [Action]\n\n## 💡 Hints\n<details>\n<summary>Hint 1</summary>\nFirst helpful hint here\n</details>\n\n<details>\n<summary>Hint 2</summary>\nSecond helpful hint here\n</details>\n\n## ✅ Success Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2\n- [ ] Criterion 3")}>
                                                        <CardHeader className="py-3">
                                                            <CardTitle className="text-sm">Interactive Exercise</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-2 text-xs text-gray-500">
                                                            Engaging problem-solving activity with progressive hints
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("# 📝 Case Study Analysis\n\n## 📖 Background\nProvide the context and background information\n\n## 🎯 Learning Goals\n- Understanding of...\n- Application of...\n- Analysis of...\n\n## 📊 Case Details\n### Situation\nDescribe the specific situation or problem\n\n### Key Challenges\n1. Challenge 1\n2. Challenge 2\n3. Challenge 3\n\n## 🤔 Discussion Questions\n1. What are the main issues presented in this case?\n2. How would you approach solving these challenges?\n3. What alternatives could be considered?\n\n## 📋 Assignment\n1. Analyze the case using the framework provided\n2. Propose solutions with justification\n3. Reflect on potential outcomes")}>
                                                        <CardHeader className="py-3">
                                                            <CardTitle className="text-sm">Case Study Template</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-2 text-xs text-gray-500">
                                                            Detailed case study analysis framework
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("# 🔄 Flipped Classroom Guide\n\n## 📚 Pre-class Preparation\n### Required Reading\n- Resource 1\n- Resource 2\n\n### Watch & Learn\n- Video 1: [Topic]\n- Video 2: [Topic]\n\n## 🤔 Reflection Questions\nThink about these questions while preparing:\n1. Question 1?\n2. Question 2?\n\n## 🎯 In-Class Activities\n### Warm-up (10 min)\n- Quick quiz on pre-class material\n- Discussion of key concepts\n\n### Group Work (30 min)\n1. Activity 1\n2. Activity 2\n\n### Wrap-up (10 min)\n- Key takeaways\n- Next steps")}>
                                                        <CardHeader className="py-3">
                                                            <CardTitle className="text-sm">Flipped Classroom</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-2 text-xs text-gray-500">
                                                            Structure for flipped classroom methodology
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("# 🧪 Practical Workshop\n\n## 🎯 Workshop Overview\nBrief description of the practical session\n\n## 🛠️ Required Tools\n- Tool 1\n- Tool 2\n- Tool 3\n\n## 📝 Step-by-Step Guide\n### 1. Setup (10 min)\n```\nSetup instructions here\n```\n\n### 2. Basic Implementation (20 min)\n```\nCode or implementation steps\n```\n\n### 3. Advanced Features (15 min)\n```\nAdvanced implementation\n```\n\n## 🔍 Common Issues & Solutions\n| Issue | Solution |\n|-------|----------|\n| Issue 1 | Solution 1 |\n| Issue 2 | Solution 2 |\n\n## 🎉 Challenge Exercise\nExtend the workshop with these challenges:\n1. Challenge 1\n2. Challenge 2")}>
                                                        <CardHeader className="py-3">
                                                            <CardTitle className="text-sm">Practical Workshop</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-2 text-xs text-gray-500">
                                                            Hands-on workshop structure with practical exercises
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => insertTemplate("# 🎮 Gamified Learning Module\n\n## 🎯 Quest Overview\nEngaging description of the learning challenge\n\n## 🏆 Achievement Levels\n### Level 1: Beginner\n- Task 1 (100 points)\n- Task 2 (150 points)\n\n### Level 2: Explorer\n- Task 1 (200 points)\n- Task 2 (250 points)\n\n### Level 3: Master\n- Task 1 (300 points)\n- Task 2 (350 points)\n\n## 💫 Special Challenges\n### 🌟 Speed Run\nComplete all tasks within [time limit]\n\n### 🎯 Perfect Score\nComplete all tasks without errors\n\n## 🏅 Rewards\n- Badge 1: [Achievement]\n- Badge 2: [Achievement]\n\n## 📊 Progress Tracking\n- [ ] Level 1 Complete\n- [ ] Level 2 Complete\n- [ ] Level 3 Complete")}>
                                                        <CardHeader className="py-3">
                                                            <CardTitle className="text-sm">Gamified Module</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="py-2 text-xs text-gray-500">
                                                            Gamification structure with achievements and rewards
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="help" className="mt-0">
                                                <div className="bg-white p-6 border rounded-md space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold">Markdown Guide</h3>
                                                        <div className="text-sm text-primary">
                                                            <span className="mr-2">🏆 Markdown Mastery Progress</span>
                                                            <div className="inline-block w-32 h-2 bg-gray-200 rounded-full">
                                                                <div className="h-full bg-primary rounded-full" style={{ width: `${lessonData.textContent.length > 0 ? Math.min(100, (lessonData.textContent.length / 500) * 100) : 0}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm flex items-center">
                                                                    <span className="mr-2">Headers</span>
                                                                    <span className="text-xs text-primary">+10 points</span>
                                                                </h4>
                                                                <pre className="bg-gray-50 p-3 rounded-md text-sm">
# Main Title
## Section Title
### Subsection</pre>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm flex items-center">
                                                                    <span className="mr-2">Text Styling</span>
                                                                    <span className="text-xs text-primary">+5 points</span>
                                                                </h4>
                                                                <pre className="bg-gray-50 p-3 rounded-md text-sm">
**Bold Text**
*Italic Text*
~~Strikethrough~~
`Inline Code`</pre>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm flex items-center">
                                                                    <span className="mr-2">Lists</span>
                                                                    <span className="text-xs text-primary">+8 points</span>
                                                                </h4>
                                                                <pre className="bg-gray-50 p-3 rounded-md text-sm">
- Bullet point
  - Nested bullet
1. Numbered item
2. Another item
   - Mixed nesting</pre>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm flex items-center">
                                                                    <span className="mr-2">Advanced Features</span>
                                                                    <span className="text-xs text-primary">+15 points</span>
                                                                </h4>
                                                                <pre className="bg-gray-50 p-3 rounded-md text-sm">
{`> Blockquote text
> Multiple lines

| Table | Header |
|-------|--------|
| Cell  | Cell   |

\`\`\`js
// Code block
console.log('Hello');
\`\`\`
`}</pre>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm flex items-center">
                                                                    <span className="mr-2">Links & Media</span>
                                                                    <span className="text-xs text-primary">+12 points</span>
                                                                </h4>
                                                                <pre className="bg-gray-50 p-3 rounded-md text-sm">
[Link Text](URL)
![Image Alt](URL)

[![Clickable Image](URL)](URL)</pre>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm flex items-center">
                                                                    <span className="mr-2">Special Elements</span>
                                                                    <span className="text-xs text-primary">+20 points</span>
                                                                </h4>
                                                                <pre className="bg-gray-50 p-3 rounded-md text-sm">
&lt;details&gt;
                                                                    &lt;summary&gt;Expandable Section&lt;/summary&gt;
                                                                    Hidden content here
                                                                    &lt;/details&gt;

                                                                    - [x] Completed task
- [ ] Pending task</pre>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 p-4 bg-primary/5 rounded-md">
                                                        <h4 className="font-medium text-sm mb-2">Pro Tips 💡</h4>
                                                        <ul className="text-sm space-y-2 text-gray-600">
                                                            <li>• Use headers to organize your content hierarchically</li>
                                                            <li>• Include code blocks for technical content</li>
                                                            <li>• Add tables for structured information</li>
                                                            <li>• Use task lists for actionable items</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}

                                {(viewMode === 'preview' || viewMode === 'split') && (
                                    <div className={`bg-white rounded-lg border p-6 ${viewMode === 'preview' ? 'min-h-[500px]' : 'min-h-[300px]'} overflow-y-auto`}>
                                        <PreviewContent content={lessonData.textContent} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="dark:border-gray-700" />

                        <div>
                            <label className="block text-sm font-medium dark:text-gray-200">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                <Upload className="h-4 w-4 inline mr-1" /> Upload Materials
                                                <HelpCircle className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Upload PDF and Word documents (max 10MB each)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </label>
                            <div className="mt-2">
                                <Input
                                    type="file"
                                    onChange={handleFileUpload}
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    className="w-full"
                                />
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
                <AlertDialogContent className={cn(
                    "dark:bg-gray-800 dark:border-gray-700",
                    "transition-colors duration-200"
                )}>
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
                            {createdLesson?.textContent ? (
                                <ReactMarkdown>
                                    {createdLesson.textContent.substring(0, 300)}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-gray-500 italic">No content available.</p>
                            )}
                            {createdLesson?.textContent && createdLesson.textContent.length > 300 && (
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


