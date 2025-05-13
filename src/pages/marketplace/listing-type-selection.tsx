import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card';
import {ArrowLeft, BookOpen, GraduationCap, Plus, Search} from 'lucide-react';
import {ListingType} from '@/redux/features/marketplace/marketplaceApi';

export function ListingTypeSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedAction, setSelectedAction] = useState<'view' | 'create'>(
    'view'
  );
  const [selectedType, setSelectedType] = useState<ListingType | string>('');

  // Check for action parameter in URL
  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam === 'create') {
      setSelectedAction('create');
    }
  }, [searchParams]);

  const handleBack = () => {
    navigate('/');
  };

  const handleContinue = () => {
    if (selectedAction === 'create') {
      if (selectedType) {
        navigate(`/marketplace/create?type=${selectedType}`);
      }
    } else {
      // For viewing, navigate to the appropriate path based on the selected type
      if (selectedType === ListingType.COURSE) {
        navigate('/marketplace/courses');
      } else if (selectedType === ListingType.ONLINE_COURSE) {
        navigate('/marketplace/online-courses');
      } else {
        navigate('/marketplace/all');
      }
    }
  };

  // Listing types for browsing
  const browsingListingTypes = [
    {
      type: '',
      title: 'All Listings',
      description: 'Browse all types of listings in the marketplace.',
      icon: Search,
      color: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      path: '/marketplace/all',
    },
    {
      type: ListingType.COURSE,
      title: 'Static Courses',
      description:
        'Self-paced courses with static content like PDFs, videos, etc.',
      icon: BookOpen,
      color: 'bg-amber-100 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      path: '/marketplace/courses',
    },
    {
      type: ListingType.ONLINE_COURSE,
      title: 'Interactive Courses',
      description:
        'Live sessions with scheduled dates, student limits, and interactive content.',
      icon: GraduationCap,
      color: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      path: '/marketplace/online-courses',
    },
  ];

  // Listing types for creation
  const creationListingTypes = [
    {
      type: ListingType.COURSE,
      title: 'Static Course',
      description:
        'Create a self-paced course with static content like PDFs, videos, etc.',
      icon: BookOpen,
      color: 'bg-amber-100 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      type: ListingType.ONLINE_COURSE,
      title: 'Interactive Course',
      description:
        'Create a course with live sessions, scheduled dates, and student limits.',
      icon: GraduationCap,
      color: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
  ];

  // Select the appropriate listing types based on the selected action
  const listingTypes =
    selectedAction === 'create' ? creationListingTypes : browsingListingTypes;

  const handleCardClick = (type: string, path?: string) => {
    setSelectedType(type);

    // For browsing, navigate directly when a card is clicked
    if (selectedAction === 'view' && path) {
      // Make sure we're passing the correct type parameter in the URL
      if (path === '/marketplace/courses') {
        console.log('Navigating to courses with type:', ListingType.COURSE);
        navigate(`/marketplace/courses?type=${ListingType.COURSE}`);
      } else if (path === '/marketplace/online-courses') {
        console.log(
          'Navigating to online courses with type:',
          ListingType.ONLINE_COURSE
        );
        navigate(
          `/marketplace/online-courses?type=${ListingType.ONLINE_COURSE}`
        );
      } else {
        // For "All Listings", don't pass a type parameter
        console.log('Navigating to all listings');
        navigate(path);
      }
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <Button variant="outline" onClick={handleBack} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Skilly Marketplace</h1>
          <p className="text-muted-foreground mb-6">
            Discover and share knowledge through our marketplace
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={selectedAction === 'view' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedAction('view');
                setSelectedType('');
              }}
              className="px-6"
            >
              <Search className="mr-2 h-4 w-4" /> Browse Listings
            </Button>
            <Button
              variant={selectedAction === 'create' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedAction('create');
                setSelectedType('');
              }}
              className="px-6"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Listing
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-center">
          {selectedAction === 'create'
            ? 'What type of course would you like to create?'
            : 'What type of listings would you like to browse?'}
        </h2>

        <div
          className={`grid grid-cols-1 ${
            selectedAction === 'create' ? 'md:grid-cols-2' : 'md:grid-cols-3'
          } gap-6`}
        >
          {listingTypes.map((type) => (
            <motion.div
              key={type.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`h-full cursor-pointer border-2 ${
                  selectedType === type.type
                    ? 'border-primary'
                    : type.borderColor
                }`}
                onClick={() =>
                  handleCardClick(
                    type.type,
                    'path' in type ? type.path : undefined
                  )
                }
              >
                <CardHeader className={`${type.color} rounded-t-lg`}>
                  <div className="flex justify-center">
                    <type.icon className="h-12 w-12" />
                  </div>
                  <CardTitle className="text-center mt-2">
                    {type.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="text-center">
                    {type.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedAction === 'create' && (
          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={selectedAction === 'create' && !selectedType}
              className="px-8"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
