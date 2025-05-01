import {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {
    CreateCourseRequest,
    CreateOnlineCourseRequest,
    ListingType,
    useCreateCourseMutation,
    useCreateOnlineCourseMutation,
    useGetMarketplaceItemByIdQuery,
    useUpdateMarketplaceItemMutation,
} from '@/redux/features/marketplace/marketplaceApi';
import {ArrowLeft, Save, Upload, X} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {useSelector} from 'react-redux';
import {toast} from 'sonner';
import cryptoIcon from '@/assets/icons/crypto.png';
import {useImageUpload} from '@/hooks/useImageUpload';

// Add image compression utility function
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        const maxSize = 1200; // Maximum dimension
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create blob'));
              return;
            }

            // Create a new file with the compressed blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          0.7 // Quality parameter (0.7 = 70% quality)
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function CreateEditMarketplaceItem() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Get auth state
  const authState = useSelector((state: any) => state.auth);
  const isAuthenticated = !!authState.token && !!authState.user;

  // Extended form data to include all possible fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    skillName: '',
    proficiencyLevel: '',
    tags: [] as string[],
    imagesUrl: [] as string[],
    type: '' as ListingType | '',

    // Course specific fields
    contentDescription: '',
    contentUrls: [] as string[],

    // Online course specific fields
    location: '',
    maxStudents: 0,
    startDate: '',
    endDate: '',
    videoUrl: '',
    materials: [] as string[],
    durationHours: 0,
  });

  const [tagInput, setTagInput] = useState('');
  const [contentUrlInput, setContentUrlInput] = useState('');
  const [materialUrlInput, setMaterialUrlInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingItem } = useGetMarketplaceItemByIdQuery(id || '', {
    skip: !isEditMode,
  });

  const [createCourse, { isLoading: isCreatingCourse }] =
    useCreateCourseMutation();
  const [createOnlineCourse, { isLoading: isCreatingOnlineCourse }] =
    useCreateOnlineCourseMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateMarketplaceItemMutation();
  const { uploadImages, isUploading } = useImageUpload();

  // Check if type parameter exists and redirect if not (for new listings)
  useEffect(() => {
    if (!isEditMode) {
      const typeParam = searchParams.get('type');
      if (!typeParam) {
        // Redirect to the listing type selection page with create action
        navigate('/marketplace?action=create');
        return;
      }
    }
  }, [isEditMode, searchParams, navigate]);

  // Set the type from URL parameter if it exists
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && !isEditMode) {
      // Make sure the type is valid
      if (
        typeParam === ListingType.COURSE ||
        typeParam === ListingType.ONLINE_COURSE
      ) {
        setFormData((prev) => ({
          ...prev,
          type: typeParam as ListingType,
        }));
      } else {
        // If invalid type, navigate back to selection
        toast.error('Invalid listing type', {
          description: 'Please select a valid listing type.',
        });
        navigate('/marketplace?action=create');
      }
    }
  }, [searchParams, isEditMode, navigate]);

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
        type: existingItem.type || '',

        // Course specific fields
        contentDescription: existingItem.contentDescription || '',
        contentUrls: existingItem.contentUrls || [],

        // Online course specific fields
        location: existingItem.location || '',
        maxStudents: existingItem.maxStudents || 0,
        startDate: existingItem.startDate
          ? existingItem.startDate.substring(0, 10)
          : '',
        endDate: existingItem.endDate
          ? existingItem.endDate.substring(0, 10)
          : '',
        videoUrl: existingItem.videoUrl || '',
        materials: existingItem.materials || [],
        durationHours: existingItem.durationHours || 0,
      });
    }
  }, [isEditMode, existingItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
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

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddContentUrl = () => {
    if (
      contentUrlInput.trim() &&
      !formData.contentUrls.includes(contentUrlInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        contentUrls: [...prev.contentUrls, contentUrlInput.trim()],
      }));
      setContentUrlInput('');
    }
  };

  const handleRemoveContentUrl = (urlToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      contentUrls: prev.contentUrls.filter((url) => url !== urlToRemove),
    }));
  };

  const handleAddMaterialUrl = () => {
    if (
      materialUrlInput.trim() &&
      !formData.materials.includes(materialUrlInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, materialUrlInput.trim()],
      }));
      setMaterialUrlInput('');
    }
  };

  const handleRemoveMaterialUrl = (urlToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((url) => url !== urlToRemove),
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const newFiles = Array.from(e.target.files);

        // Compress each image before adding to state
        const compressedFiles = await Promise.all(
          newFiles.map((file) => compressImage(file))
        );

        setUploadedImages((prev) => [...prev, ...compressedFiles]);

        // Create preview URLs
        const newPreviewUrls = compressedFiles.map((file) =>
          URL.createObjectURL(file)
        );
        setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
      } catch (error) {
        console.error('Error compressing images:', error);
        toast.error('Error processing images', {
          description:
            'There was a problem processing your images. Please try again.',
        });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    // Remove from preview
    setImagePreviewUrls((prev) => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]); // Clean up URL object
      newUrls.splice(index, 1);
      return newUrls;
    });

    // Remove from files
    setUploadedImages((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleRemoveExistingImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imagesUrl: prev.imagesUrl.filter((imgUrl) => imgUrl !== url),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Authentication Required', {
        description:
          'You must be logged in to create or edit marketplace items.',
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title Required', {
        description: 'Please enter a title for your listing.',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description Required', {
        description: 'Please enter a description for your listing.',
      });
      return;
    }

    if (!formData.category || formData.category === 'select-category') {
      toast.error('Category Required', {
        description: 'Please select a category for your listing.',
      });
      return;
    }

    if (!formData.skillName || formData.skillName === 'select-skill') {
      toast.error('Skill Name Required', {
        description: 'Please select a skill name for your listing.',
      });
      return;
    }

    if (
      !formData.proficiencyLevel ||
      formData.proficiencyLevel === 'select-level'
    ) {
      toast.error('Proficiency Level Required', {
        description: 'Please select a proficiency level for your listing.',
      });
      return;
    }

    if (!formData.type || formData.type === ('select' as any)) {
      toast.error('Listing Type Required', {
        description: 'Please select a listing type.',
      });
      return;
    }

    try {
      // Handle image uploads first if there are any
      let updatedImagesUrl = [...formData.imagesUrl];
      if (uploadedImages.length > 0) {
        const uploadedUrls = await uploadImages(uploadedImages);
        updatedImagesUrl = [...updatedImagesUrl, ...uploadedUrls];
      }

      // Prepare the base form data
      const updatedFormData = {
        ...formData,
        imagesUrl: updatedImagesUrl,
        type: formData.type as ListingType,
      };

      if (isEditMode && id) {
        // For editing, use the updateItem mutation with the appropriate data structure
        const updateData = {
          ...updatedFormData,
          // Include course-specific fields if it's a course
          ...(formData.type === ListingType.COURSE && {
            contentDescription: formData.contentDescription,
            contentUrls: formData.contentUrls,
          }),
          // Include online course-specific fields if it's an online course
          ...(formData.type === ListingType.ONLINE_COURSE && {
            location: formData.location,
            maxStudents: formData.maxStudents,
            startDate: formData.startDate,
            endDate: formData.endDate,
            videoUrl: formData.videoUrl,
            materials: formData.materials,
            durationHours: formData.durationHours,
          }),
        };

        await updateItem({
          id,
          data: updateData,
        }).unwrap();
        toast.success('Item Updated', {
          description: 'Your marketplace item has been updated successfully.',
        });

        // Navigate back to the item detail page
        navigate(`/marketplace/item/${id}`);
      } else {
        // For creating, use the appropriate mutation based on type
        if (formData.type === ListingType.COURSE) {
          const courseData: CreateCourseRequest = {
            ...updatedFormData,
            type: ListingType.COURSE,
            contentDescription: formData.contentDescription,
            contentUrls: formData.contentUrls,
          };
          await createCourse(courseData).unwrap();
          toast.success('Course Created', {
            description: 'Your course has been created successfully.',
          });

          // Navigate to the courses page
          navigate('/marketplace/courses');
        } else if (formData.type === ListingType.ONLINE_COURSE) {
          const onlineCourseData: CreateOnlineCourseRequest = {
            ...updatedFormData,
            type: ListingType.ONLINE_COURSE,
            location: formData.location,
            maxStudents: formData.maxStudents,
            startDate: formData.startDate,
            endDate: formData.endDate,
            videoUrl: formData.videoUrl,
            materials: formData.materials,
            durationHours: formData.durationHours,
          };
          await createOnlineCourse(onlineCourseData).unwrap();
          toast.success('Interactive Course Created', {
            description:
              'Your interactive course has been created successfully.',
          });

          // Navigate to the online courses page
          navigate('/marketplace/online-courses');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error', {
        description:
          'There was a problem saving your marketplace item. Please try again.',
      });
    }
  };

  const handleBack = () => {
    if (isEditMode && id) {
      navigate(`/marketplace/item/${id}`);
    } else {
      navigate('/marketplace');
    }
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

  const listingTypeOptions = [
    { value: 'select', label: 'Select a type' },
    { value: ListingType.COURSE, label: 'Static Course' },
    { value: ListingType.ONLINE_COURSE, label: 'Interactive Course' },
  ];

  const isSubmitting =
    isCreatingCourse || isCreatingOnlineCourse || isUpdating || isUploading;

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
                  value={formData.category || 'select-category'}
                  onValueChange={(value) =>
                    handleSelectChange(
                      'category',
                      value === 'select-category' ? '' : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select-category">
                      Select a category
                    </SelectItem>
                    {categoryOptions.map((category) => (
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
                  value={formData.skillName || 'select-skill'}
                  onValueChange={(value) =>
                    handleSelectChange(
                      'skillName',
                      value === 'select-skill' ? '' : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select-skill">Select a skill</SelectItem>
                    {skillOptions.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="proficiencyLevel"
                  className="block text-sm font-medium mb-1"
                >
                  Proficiency Level
                </label>
                <Select
                  value={formData.proficiencyLevel || 'select-level'}
                  onValueChange={(value) =>
                    handleSelectChange(
                      'proficiencyLevel',
                      value === 'select-level' ? '' : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select-level">Select a level</SelectItem>
                    {proficiencyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium mb-1"
                >
                  Price (Credits)
                </label>
                <div className="relative">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleNumberChange}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <img src={cryptoIcon} alt="Credits" className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Listing Type
              </label>
              <Select
                value={formData.type || 'select'}
                onValueChange={(value) =>
                  handleSelectChange('type', value === 'select' ? '' : value)
                }
                disabled={!!searchParams.get('type') || isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a listing type" />
                </SelectTrigger>
                <SelectContent>
                  {listingTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course specific fields */}
            {formData.type === ListingType.COURSE && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium text-lg">Course Details</h3>

                <div>
                  <label
                    htmlFor="contentDescription"
                    className="block text-sm font-medium mb-1"
                  >
                    Course Content Description
                  </label>
                  <Textarea
                    id="contentDescription"
                    name="contentDescription"
                    value={formData.contentDescription}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content URLs
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={contentUrlInput}
                      onChange={(e) => setContentUrlInput(e.target.value)}
                      placeholder="Enter content URL"
                    />
                    <Button
                      type="button"
                      onClick={handleAddContentUrl}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.contentUrls.map((url, index) => (
                      <Badge key={index} variant="secondary">
                        {url.length > 30 ? url.substring(0, 30) + '...' : url}
                        <button
                          type="button"
                          onClick={() => handleRemoveContentUrl(url)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Online Course specific fields */}
            {formData.type === ListingType.ONLINE_COURSE && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium text-lg">
                  Interactive Course Details
                </h3>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium mb-1"
                  >
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Online or physical location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium mb-1"
                    >
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium mb-1"
                    >
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="maxStudents"
                      className="block text-sm font-medium mb-1"
                    >
                      Maximum Students
                    </label>
                    <Input
                      id="maxStudents"
                      name="maxStudents"
                      type="number"
                      min="0"
                      value={formData.maxStudents}
                      onChange={handleNumberChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="durationHours"
                      className="block text-sm font-medium mb-1"
                    >
                      Duration (Hours)
                    </label>
                    <Input
                      id="durationHours"
                      name="durationHours"
                      type="number"
                      min="0"
                      value={formData.durationHours}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="videoUrl"
                    className="block text-sm font-medium mb-1"
                  >
                    Video URL
                  </label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="Link to course preview video"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Course Materials
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={materialUrlInput}
                      onChange={(e) => setMaterialUrlInput(e.target.value)}
                      placeholder="Enter material URL"
                    />
                    <Button
                      type="button"
                      onClick={handleAddMaterialUrl}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.materials.map((url, index) => (
                      <Badge key={index} variant="secondary">
                        {url.length > 30 ? url.substring(0, 30) + '...' : url}
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterialUrl(url)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter a tag"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Images</label>
              <div className="flex flex-wrap gap-4 mb-4">
                {formData.imagesUrl.map((url, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative w-24 h-24 border rounded-md overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Existing ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviewUrls.map((url, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative w-24 h-24 border rounded-md overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`New ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div
                  className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
