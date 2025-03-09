import { useEffect, useState, useRef } from 'react';
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
import { ArrowLeft, Save, X, Upload, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import cryptoIcon from '@/assets/icons/crypto.png';

export function CreateEditMarketplaceItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

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
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setUploadedImages((prev) => [...prev, ...newFiles]);

    // Create preview URLs for the images
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Authentication Error', {
        description:
          'You must be logged in to create or edit marketplace items.',
      });
      return;
    }

    try {
      // Handle image uploads first if there are any
      const currentImages = formData.imagesUrl || [];
      let imageUrls = [...currentImages];

      if (uploadedImages.length > 0) {
        // In a real implementation, you would upload the files to a server/cloud storage
        // and get back URLs. For now, we'll simulate this with local URLs
        toast.info('Uploading images...', {
          description:
            'This is a simulation. In a real app, images would be uploaded to a server.',
        });

        // In a real implementation, this would be replaced with actual API calls to upload the images
        // For now, we'll just use the preview URLs
        imageUrls = [...imageUrls, ...imagePreviewUrls];
      }

      const updatedFormData = {
        ...formData,
        imagesUrl: imageUrls,
      };

      if (isEditMode && id) {
        await updateItem({
          id,
          data: updatedFormData,
        }).unwrap();
        toast.success('Item Updated', {
          description: 'Your marketplace item has been updated successfully.',
        });
      } else {
        await createItem(updatedFormData).unwrap();
        toast.success('Item Created', {
          description: 'Your marketplace item has been created successfully.',
        });
      }
      navigate('/marketplace');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error', {
        description:
          'There was a problem saving your marketplace item. Please try again.',
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
              <label
                htmlFor="price"
                className="block text-sm font-medium mb-1 flex items-center gap-2"
              >
                Price <img src={cryptoIcon} alt="Credits" className="h-4 w-4" />
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
                htmlFor="images"
                className="block text-sm font-medium mb-1"
              >
                Images
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Images
                  </Button>
                </div>

                {/* Image previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing image URLs */}
                {formData.imagesUrl && formData.imagesUrl.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Existing Images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {formData.imagesUrl.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Image ${index}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                imagesUrl: prev.imagesUrl
                                  ? prev.imagesUrl.filter((_, i) => i !== index)
                                  : [],
                              }));
                            }}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Upload images of your item. You can upload multiple images.
                </p>
              </div>
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
