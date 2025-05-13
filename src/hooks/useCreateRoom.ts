import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoomMutation } from '@/redux/features/codingRoom/codingRoomsApi';
import { CreateRoomDto } from '@/redux/features/codingRoom/codingRoomsApi';

export const useCreateRoom = () => {
  const navigate = useNavigate();
  const [createRoom] = useCreateRoomMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRoomDto>({
    name: '',
    description: '',
    language: 'javascript',
    theme: 'vs-dark',
    isPrivate: false,
    tags: [],
    currentCode: '// Write your code here\n',
  });
  const [tag, setTag] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isPrivate: checked,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addTag = () => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tag] });
      setTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tagToRemove) || []
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (values: CreateRoomDto) => {
    setIsSubmitting(true);
    
    try {
      const newRoom = await createRoom(values).unwrap();
      navigate(`/coding-rooms/${newRoom._id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    tag,
    isSubmitting,
    handleInputChange,
    handleSwitchChange,
    handleSelectChange,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleSubmit,
    setTag,
  };
};
