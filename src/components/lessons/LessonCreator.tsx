// src/components/lessons/LessonCreator.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface LessonCreatorProps {
    listingId: string
    onCreated?: () => void
}

export const LessonCreator: React.FC<LessonCreatorProps> = ({ listingId, onCreated }) => {
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // API call will be implemented later
            setFormData({ title: '', description: '', content: '' })
            setIsCreating(false)
            toast.success('Lesson created successfully')
            onCreated?.()
        } catch (error) {
            toast.error('Failed to create lesson')
        }
    }

    if (!isCreating) {
        return (
            <Button onClick={() => setIsCreating(true)}>
                Add New Lesson
            </Button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                placeholder="Lesson Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
            />
            <Textarea
                placeholder="Short Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
            />
            <Textarea
                placeholder="Lesson Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                className="min-h-[200px]"
            />
            <div className="flex gap-2">
                <Button type="submit">
                    Create Lesson
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}