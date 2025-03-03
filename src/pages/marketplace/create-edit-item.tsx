import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetMarketplaceItemByIdQuery,
  useCreateMarketplaceItemMutation,
  useUpdateMarketplaceItemMutation,
  CreateMarketplaceItemRequest,
} from '@/redux/features/marketplace/marketplaceApi';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';

export function CreateEditMarketplaceItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { toast } = useToast();

  // Get auth state
  const authState = useSelector((state: any) => state.auth);
  const isAuthenticated = !!authState.token && !!authState.user;

  const [formData, setFormData] = useState<CreateMarketplaceItemRequest>({
    title: '',
    description: '',
    price: 0,
    category: '',
    skillName: '',
    proficiencyLevel: '',
    tags: [],
    imagesUrl: [],
  });

  const [tagInput, setTagInput] = useState('');

  const { data: existingItem } = useGetMarketplaceItemByIdQuery(id || '', {
    skip: !isEditMode,
  });

  const [createItem, { isLoading: isCreating }] =
    useCreateMarketplaceItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateMarketplaceItemMutation();

  useEffect(() => {
    if (isEditMode && existingItem) {
      setFormData({
        title: existingItem.title,
        description: existingItem.description,
        price: existingItem.price,
        category: existingItem.category,
        skillName: existingItem.skillName,
        proficiencyLevel: existingItem.proficiencyLevel,
        tags: existingItem.tags || [],
        imagesUrl: existingItem.imagesUrl || [],
      });
    }
  }, [isEditMode, existingItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSkillNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      skillName: value,
    }));
  };

  const handleProficiencyLevelChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      proficiencyLevel: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Error',
        description:
          'You must be logged in to create or edit marketplace items.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      if (isEditMode) {
        await updateItem({ id: id || '', data: formData }).unwrap();
        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });
      } else {
        await createItem(formData).unwrap();
        toast({
          title: 'Success',
          description: 'Item created successfully',
        });
      }
      navigate('/marketplace');
    } catch (err: any) {
      console.error('Failed to save item:', err);
      toast({
        title: 'Error',
        description:
          err.data?.message || 'Failed to save item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/marketplace/${id}` : '/marketplace');
  };

  const skillOptions = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'Design',
    'Marketing',
    'Business',
    'Education',
    'Health',
    'Other',
  ];

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  const categoryOptions = [
    'Technology',
    'Design',
    'Marketing',
    'Business',
    'Education',
    'Health',
    'Other',
  ];

  return (
    <div className="container py-8">
      <Button variant="outline" onClick={handleBack} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Edit' : 'Create'} Marketplace Item
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="skillName"
                  className="block text-sm font-medium mb-1"
                >
                  Skill Name
                </label>
                <Select
                  value={formData.skillName}
                  onValueChange={handleSkillNameChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillOptions.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="proficiencyLevel"
                  className="block text-sm font-medium mb-1"
                >
                  Proficiency Level
                </label>
                <Select
                  value={formData.proficiencyLevel}
                  onValueChange={handleProficiencyLevelChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select proficiency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {proficiencyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price ($)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="imagesUrl"
                className="block text-sm font-medium mb-1"
              >
                Image URL (optional)
              </label>
              <Input
                id="imagesUrl"
                name="imagesUrl"
                value={formData.imagesUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update' : 'Create'} Item
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
