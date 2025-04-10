import React, { useState } from 'react';
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
    Video,
    FileText,
    Link,
    Save,
    ChevronLeft,
    Eye
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function CreateLesson() {
    // Extract listingId from URL params.
    const { id: listingId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [createLesson, { isLoading }] = useCreateLessonMutation();
    const [previewMode, setPreviewMode] = useState(false);

    // Our form state reflects our backend CreateLessonDto structure.
    const [lessonData, setLessonData] = useState({
        title: '',
        description: '',
        duration: 0,
        content: '',
        materials: '', // entered as comma separated list
        videoUrl: ''
    });

    // Sample markdown placeholders to help users
    const markdownPlaceholders = {
        header: "# Heading 1\n## Heading 2\n### Heading 3",
        text: "Regular text\n\n**Bold text**\n\n*Italic text*\n\n~~Strikethrough~~",
        lists: "- Item 1\n- Item 2\n  - Nested item\n\n1. Numbered item 1\n2. Numbered item 2",
        code: "```javascript\nconst greeting = 'Hello world!';\nconsole.log(greeting);\n```\n\nInline `code`",
        tables: "| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |",
        links: "[Link text](https://example.com)\n\n![Image alt text](https://example.com/image.jpg)",
        quotes: "> This is a blockquote\n>\n> It can span multiple lines"
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLessonData((prev) => ({
            ...prev,
            [name]: name === 'duration' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listingId) {
            toast.error('No listing ID provided.');
            return;
        }
        // Prepare payload: convert duration to number and parse materials into an array.
        const payload = {
            title: lessonData.title,
            description: lessonData.description,
            duration: Number(lessonData.duration),
            content: lessonData.content,
            materials: lessonData.materials
                ? lessonData.materials.split(',').map((s) => s.trim())
                : [],
            videoUrl: lessonData.videoUrl
        };

        try {
            await createLesson({ listingId, data: payload }).unwrap();
            toast.success('Lesson created successfully!');
            navigate(`/marketplace/item/${listingId}/lessons`);
        } catch (error: any) {
            console.error('Failed to create lesson:', error);
            toast.error(error?.data?.message || 'Failed to create lesson');
        }
    };

    const insertTemplate = (template: string) => {
        setLessonData((prev) => ({
            ...prev,
            content: prev.content ? `${prev.content}\n\n${template}` : template
        }));
    };

    // Simple markdown preview renderer (for demonstration)
    // In a real app, you'd use a proper markdown library like react-markdown
    const renderMarkdownPreview = () => {
        // This is a very basic preview - in production use a proper markdown renderer
        const content = lessonData.content;

        return (
            <div className="prose max-w-none border rounded-md p-4 bg-white min-h-[300px]">
                {content ? (
                    <pre className="whitespace-pre-wrap">{content}</pre>
                ) : (
                    <p className="text-gray-400 italic">Content preview will appear here...</p>
                )}
            </div>
        );
    };

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
                                renderMarkdownPreview()
                            ) : (
                                <>
                                    <Tabs defaultValue="editor">
                                        <TabsList className="mb-2">
                                            <TabsTrigger value="editor">Editor</TabsTrigger>
                                            <TabsTrigger value="templates">Templates</TabsTrigger>
                                            <TabsTrigger value="help">Markdown Help</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="editor" className="mt-0">
                                            <Textarea
                                                name="content"
                                                value={lessonData.content}
                                                onChange={handleChange}
                                                placeholder="# Lesson Content

Write your lesson content using Markdown formatting.

## Section 1
This is where you can add your content, including:
- Key points
- Examples
- Explanations

## Section 2
Continue organizing your lesson with additional sections."
                                                required
                                                className="font-mono text-sm min-h-[300px]"
                                                rows={12}
                                            />
                                        </TabsContent>

                                        <TabsContent value="templates" className="mt-0">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <Card className="cursor-pointer hover:border-primary" onClick={() => insertTemplate("# Lesson Overview\n\n## Learning Objectives\n- Objective 1\n- Objective 2\n- Objective 3\n\n## Prerequisites\n- Prerequisite 1\n- Prerequisite 2")}>
                                                    <CardHeader className="py-3">
                                                        <CardTitle className="text-sm">Lesson Overview</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="py-2 text-xs text-gray-500">
                                                        Insert lesson objectives and prerequisites structure
                                                    </CardContent>
                                                </Card>

                                                <Card className="cursor-pointer hover:border-primary" onClick={() => insertTemplate("## Key Concept: [Name]\n\n### Definition\nProvide definition here\n\n### Examples\n1. First example\n2. Second example\n\n### Practice Exercise\nDescribe a practice activity here")}>
                                                    <CardHeader className="py-3">
                                                        <CardTitle className="text-sm">Key Concept</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="py-2 text-xs text-gray-500">
                                                        Insert a key concept with examples and practice
                                                    </CardContent>
                                                </Card>

                                                <Card className="cursor-pointer hover:border-primary" onClick={() => insertTemplate("## Discussion Questions\n\n1. Question 1?\n   * Hint or guidance\n   * Possible answer\n\n2. Question 2?\n   * Hint or guidance\n   * Possible answer")}>
                                                    <CardHeader className="py-3">
                                                        <CardTitle className="text-sm">Discussion Questions</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="py-2 text-xs text-gray-500">
                                                        Insert discussion questions with hints
                                                    </CardContent>
                                                </Card>

                                                <Card className="cursor-pointer hover:border-primary" onClick={() => insertTemplate("## Assignment\n\n### Instructions\nProvide detailed instructions here\n\n### Requirements\n- Requirement 1\n- Requirement 2\n\n### Submission Guidelines\nExplain how to submit the assignment")}>
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
                                                    <div>
                                                        <p className="font-medium mb-1">Headers</p>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">{markdownPlaceholders.header}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium mb-1">Text Formatting</p>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">{markdownPlaceholders.text}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium mb-1">Lists</p>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">{markdownPlaceholders.lists}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium mb-1">Code</p>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">{markdownPlaceholders.code}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium mb-1">Links & Images</p>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">{markdownPlaceholders.links}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium mb-1">Quotes</p>
                                                        <pre className="bg-gray-50 p-2 rounded text-xs">{markdownPlaceholders.quotes}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </>
                            )}
                        </div>

                        <Separator />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    <Link className="h-4 w-4 inline mr-1" /> Materials (comma-separated URLs)
                                </label>
                                <Input
                                    name="materials"
                                    value={lessonData.materials}
                                    onChange={handleChange}
                                    placeholder="https://example.com/doc1.pdf, https://example.com/doc2.pdf"
                                />
                                <p className="text-xs text-gray-500 mt-1">Add links to supplementary materials, separating each URL with a comma</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    <Video className="h-4 w-4 inline mr-1" /> Video URL
                                </label>
                                <Input
                                    name="videoUrl"
                                    value={lessonData.videoUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/lesson-video.mp4"
                                />
                                <p className="text-xs text-gray-500 mt-1">Add a YouTube, Vimeo, or other video platform URL</p>
                            </div>
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
        </div>
    );
}

export default CreateLesson;