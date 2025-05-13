import React, {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {RootState} from '@/redux/store.ts';
import {useFetchProfileQuery, useGetProfileCompletionStatusQuery,} from '@/redux/features/profile/profileApi.ts';
import {setProfile} from '@/redux/features/profile/profileSlice.ts';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Separator} from '@/components/ui/separator';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from '@/components/ui/tooltip';
import {
    AlertCircle,
    Book,
    Edit,
    Facebook,
    Github,
    Globe,
    GraduationCap,
    Heart,
    Instagram,
    Link,
    Linkedin,
    MapPin,
    Twitter,
    User,
} from 'lucide-react';
// Import necessary components at the top of ProfileView.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import axios from 'axios';
import { ChartPie, BookOpen, Users, Brain } from 'lucide-react';
import { useState } from 'react';

interface EngagementResponse {
  engagement_level: string;
  engagement_probabilities: {
    High: number;
    Low: number;
    Medium: number;
  };
  feature_values: {
    days_since_joining: number;
    num_joined_courses: number;
    num_skills: number;
    num_desired_skills: number;
    skills_courses_overlap: number;
    desired_courses_overlap: number;
    skills_desired_overlap: number;
    course_effectiveness: number;
    skills_acquisition_rate: number;
    learning_gap: number;
    isVerified: number;
  };
  error: string | null;
}

interface PredictionResponse {
  cluster: number;
  confidence: number;
  cluster_description: string;
  recommended_skills: string[];
  skill_scores: Record<string, number>;
  similar_users: {
    user_id: string;
    match_score: number;
    skills: string[];
  }[];
  error: string | null;
}

export const ProfileView: React.FC = () => {
  const [engagementData, setEngagementData] = useState<EngagementResponse | null>(null);
  const [courseRecommendations, setCourseRecommendations] = useState<string[] | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [isLoadingEngagement, setIsLoadingEngagement] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [engagementError, setEngagementError] = useState<string | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

// Add these three functions inside the ProfileView component
  const fetchEngagementPrediction = async () => {
    setIsLoadingEngagement(true);
    setEngagementError(null);

    try {
      const response = await axios.post('http://127.0.0.1:9100/predict-engagement', {
        "desired_skills": "Machine Learning, AI, Blockchain",
        "isVerified": true,
        "joinedCourses": "Python, Data Science, Machine Learning",
        "joinedDate": "2023-10-15",
        "skills": "HTML, CSS, JavaScript, Python"
      });

      setEngagementData(response.data);
    } catch (error) {
      console.error('Error fetching engagement prediction:', error);
      setEngagementError('Failed to fetch engagement prediction. Please try again.');
    } finally {
      setIsLoadingEngagement(false);
    }
  };

  const fetchCourseRecommendations = async () => {
    setIsLoadingCourses(true);
    setCourseError(null);

    try {
      // Format skills
      const skillsString = profile?.user.skills?.map(s => s.name).join(',') || '';

      const response = await axios.post('http://127.0.0.1:9100/recommend-courses', {
        skills: skillsString,
        top_n: 5
      });

      setCourseRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching course recommendations:', error);
      setCourseError('Failed to fetch course recommendations. Please try again.');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchPrediction = async () => {
    setIsLoadingPrediction(true);
    setPredictionError(null);

    try {
      // Format skills and desired skills
      const skillsString = profile?.user.skills?.map(s => s.name).join(', ') || '';
      const desiredSkillsString = profile?.user.desiredSkills?.map(s => s.name).join(', ') || '';

      // Use a placeholder for joined date if not available
      const joinedDate = profile?.user.createdAt || new Date().toISOString().split('T')[0];

      const response = await axios.post('http://127.0.0.1:9100/predict', {
        joinedDate: joinedDate.substring(0, 10), // Format as YYYY-MM-DD
        joinedCourses: "", // Placeholder since we don't have this data
        skills: skillsString,
        desired_skills: desiredSkillsString,
        isVerified: true // Assuming the user is verified
      });

      setPredictionData(response.data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setPredictionError('Failed to fetch prediction. Please try again.');
    } finally {
      setIsLoadingPrediction(false);
    }
  };
  const dispatch = useAppDispatch();
  const { profile, status, error } = useAppSelector(
      (state: RootState) => state.profile
  );
  const { data: fetchedProfile } = useFetchProfileQuery(undefined, {
    skip: !!profile,
  });
  const { data: completionStatus } = useGetProfileCompletionStatusQuery();
  // Get current user from auth state
  const currentUser = useAppSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (fetchedProfile) {
      dispatch(setProfile(fetchedProfile));
    }
  }, [fetchedProfile, dispatch]);

  const getSocialIcon = (url: string) => {
    if (url.includes('github')) return <Github size={18} />;
    if (url.includes('twitter')) return <Twitter size={18} />;
    if (url.includes('linkedin')) return <Linkedin size={18} />;
    if (url.includes('facebook')) return <Facebook size={18} />;
    if (url.includes('instagram')) return <Instagram size={18} />;
    return <Globe size={18} />;
  };

  const getInitials = (name: string = 'User Profile') => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
  };

  const getCompletionStatusEmoji = (percentage: number) => {
    if (percentage === 100) return '🎉';
    if (percentage > 75) return '😃';
    if (percentage > 50) return '😊';
    if (percentage > 25) return '🙂';
    return '😟';
  };

  // Get color for skill based on proficiency
  const getSkillColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'blue';
      case 'Intermediate':
        return 'indigo';
      case 'Advanced':
        return 'purple';
      case 'Expert':
        return 'violet';
      default:
        return 'blue';
    }
  };

  if (status === 'loading') {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"
                        ></div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  if (status === 'failed') {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'Failed to load profile. Please try again later.'}
            </AlertDescription>
            <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Alert>
        </div>
    );
  }

  if (!profile) {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
          <Alert className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Profile Found</AlertTitle>
            <AlertDescription>
              No profile data is available. Create your profile to get started.
            </AlertDescription>
            <Button variant="outline" size="sm" className="mt-2">
              Create Profile
            </Button>
          </Alert>
        </div>
    );
  }

  const completionPercentage = completionStatus?.percentage || 0;

  return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in-50">
        {/* Profile Header Card */}
        <Card className="overflow-hidden border-none shadow-lg">
          {/* Profile Cover */}
          <div className="h-32 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50 relative">
            <div className="absolute bottom-0 right-0 p-4">
              <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/50 backdrop-blur-sm hover:bg-background/70 rounded-full"
              >
                <Edit size={18} />
              </Button>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-6 relative p-6">
              <Avatar className="h-24 w-24 border-4 border-background -mt-12 md:-mt-14 shadow-md">
                {profile.avatarUrl ? (
                    <AvatarImage
                        src={`http://localhost:5000${profile.avatarUrl}`}
                        alt={currentUser?.name || 'User'}
                        className="object-cover"
                        onError={(e) => {
                          // Handle image load error by showing fallback
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                    />
                ) : (
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {getInitials(currentUser?.name)}
                    </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="p-4 bg-background border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">Profile Completion</h3>
                      <span className="text-lg">
                      {getCompletionStatusEmoji(completionPercentage)}
                    </span>
                    </div>
                    <Badge
                        variant={
                          completionPercentage === 100 ? 'default' : 'outline'
                        }
                        className="font-semibold"
                    >
                      {completionPercentage}%
                    </Badge>
                  </div>
                  <Progress value={completionPercentage} className="h-2 mb-3" />

                  {completionStatus?.missingFields &&
                      completionStatus.missingFields.length > 0 && (
                          <div className="bg-muted p-3 rounded-lg mt-2 text-sm">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                              <AlertCircle size={14} />
                              <span className="font-medium">
                          Complete your profile:
                        </span>
                            </div>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                              {completionStatus.missingFields.map((field, index) => (
                                  <li
                                      key={index}
                                      className="text-sm flex items-center gap-1.5"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                                    {field}
                                  </li>
                              ))}
                            </ul>
                          </div>
                      )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Contact & Social */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                )}
                {currentUser?.email && (
                    <div className="flex items-center gap-2">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>{currentUser.email}</span>
                    </div>
                )}
              </CardContent>

              <Separator className="my-1" />

              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link size={18} className="text-primary" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.socialLinks && profile.socialLinks.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {profile.socialLinks.map((link, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start gap-2 overflow-hidden"
                                    asChild
                                >
                                  <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                  >
                                    {getSocialIcon(link)}
                                    <span className="truncate text-xs">
                                {link.replace(/^https?:\/\/(www\.)?/, '')}
                              </span>
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{link}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-3">
                      <p className="text-muted-foreground text-sm">
                        No social links added
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Link size={14} className="mr-1" /> Add links
                      </Button>
                    </div>
                )}
              </CardContent>
            </Card>

            {/* Interests */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart size={18} className="text-primary" />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                          <Badge
                              key={index}
                              variant="secondary"
                              className="rounded-full px-3 py-1 font-normal flex items-center gap-1.5"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                            {interest}
                          </Badge>
                      ))
                  ) : (
                      <div className="text-center w-full py-3">
                        <p className="text-muted-foreground text-sm">
                          No interests added
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Heart size={14} className="mr-1" /> Add interests
                        </Button>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Column: Bio, Description & Skills Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="about" className="w-full">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle>Profile Details</CardTitle>
                  <TabsList>
                    <TabsTrigger value="about" className="rounded-md">
                      About
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="rounded-md">
                      Skills
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-2">
                  <TabsContent value="about" className="mt-0 space-y-6">
                    {/* Bio Section */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium flex items-center gap-2">
                        <User size={16} className="text-primary" /> Bio
                      </h3>
                      <div className="bg-muted/40 rounded-lg p-4 border">
                        {profile.bio ? (
                            <p className="leading-relaxed">{profile.bio}</p>
                        ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground mb-2">
                                No bio provided
                              </p>
                              <Button variant="outline" size="sm">
                                <Edit size={14} className="mr-2" /> Add bio
                              </Button>
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium flex items-center gap-2">
                        <Book size={16} className="text-primary" /> Description
                      </h3>
                      <div className="bg-muted/40 rounded-lg p-4 border">
                        {profile.description ? (
                            <p className="leading-relaxed">{profile.description}</p>
                        ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground mb-2">
                                No description provided
                              </p>
                              <Button variant="outline" size="sm">
                                <Edit size={14} className="mr-2" /> Add description
                              </Button>
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Career & Education Background
                                     <div className="space-y-3">
                                        <h3 className="text-base font-medium flex items-center gap-2">
                                            <Briefcase size={16} className="text-primary" /> Career
                                        </h3>
                                        <div className="bg-muted/40 rounded-lg p-4 border">
                                            {profile.profession ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{profile.profession}</h4>
                                                        <p className="text-sm text-muted-foreground">{profile.company || 'No company information'}</p>
                                                    </div>
                                                    <Badge variant="outline">{profile.yearsOfExperience || 'N/A'} years</Badge>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-muted-foreground mb-2">No career information</p>
                                                    <Button variant="outline" size="sm">
                                                        <Briefcase size={14} className="mr-2" /> Add career info
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                     */}
                  </TabsContent>

                  <TabsContent value="skills" className="mt-0 space-y-6">
                    {/* Current Skills Section */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium flex items-center gap-2">
                        <GraduationCap size={16} className="text-primary" />{' '}
                        Current Skills
                      </h3>

                      <ScrollArea className="h-52 rounded-lg border">
                        {profile?.user.skills &&
                        profile.user.skills.length > 0 ? (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {profile.user.skills.map((skill, index) => {
                                const color = getSkillColor(skill.proficiencyLevel);

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-lg border bg-${color}-50/20 hover:bg-${color}-50/40 transition-colors`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full bg-${color}-500`}
                                        ></div>
                                        <span>{skill.name}</span>
                                      </div>
                                      <Badge
                                          variant="outline"
                                          className={`ml-2 text-xs font-normal text-${color}-700 bg-${color}-50/30`}
                                      >
                                        {skill.proficiencyLevel}
                                      </Badge>
                                    </div>
                                );
                              })}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-4">
                              <div className="text-center">
                                <p className="text-muted-foreground mb-2">
                                  No skills added
                                </p>
                                <Button variant="outline" size="sm">
                                  <GraduationCap size={14} className="mr-2" /> Add
                                  skills
                                </Button>
                              </div>
                            </div>
                        )}
                      </ScrollArea>
                    </div>

                    {/* Desired Skills Section */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium flex items-center gap-2">
                        <Book size={16} className="text-primary" /> Skills I Want
                        to Learn
                      </h3>

                      <ScrollArea className="h-52 rounded-lg border">
                        {profile?.user.desiredSkills &&
                        profile.user.desiredSkills.length > 0 ? (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {profile.user.desiredSkills.map((skill, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-green-50/20 hover:bg-green-50/40 dark:bg-green-950/10 dark:hover:bg-green-950/20 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>{skill.name}</span>
                                      </div>
                                      <Badge
                                          variant="outline"
                                          className="ml-2 text-xs font-normal bg-green-50/30 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                      >
                                        {skill.desiredProficiencyLevel}
                                      </Badge>
                                    </div>
                                );
                              })}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-4">
                              <div className="text-center">
                                <p className="text-muted-foreground mb-2">
                                  No desired skills added
                                </p>
                                <Button variant="outline" size="sm">
                                  <Book size={14} className="mr-2" /> Add desired
                                  skills
                                </Button>
                              </div>
                            </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                  <Button>
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
            </Tabs>
          </div>
        </div>
        {/* AI Analysis Modals */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={fetchEngagementPrediction}
              >
                <ChartPie className="h-4 w-4 text-purple-500" />
                Engagement Analysis
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Engagement Analysis</DialogTitle>
                <DialogDescription>
                  AI-powered prediction of your engagement level based on your profile data.
                </DialogDescription>
              </DialogHeader>

              {isLoadingEngagement && (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
              )}

              {engagementError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{engagementError}</AlertDescription>
                  </Alert>
              )}

              {!isLoadingEngagement && !engagementError && engagementData && (
                  <div className="space-y-4 py-4">
                    <div className="flex justify-center mb-4">
                      <Badge
                          className={`px-4 py-2 text-base font-medium ${
                              engagementData.engagement_level === 'High'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : engagementData.engagement_level === 'Medium'
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }`}
                      >
                        {engagementData.engagement_level} Engagement
                      </Badge>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Engagement Probabilities</h4>
                      <div className="space-y-2">
                        {Object.entries(engagementData.engagement_probabilities).map(([level, prob]) => (
                            <div key={level} className="flex items-center gap-2">
                              <div className="w-24 text-sm">{level}:</div>
                              <div className="flex-1 bg-background rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full ${
                                        level === 'High' ? 'bg-green-500' : level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${prob * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-sm">{Math.round(prob * 100)}%</div>
                            </div>
                        ))}
                      </div>
                    </div>

                    <h4 className="text-sm font-medium">Key Factors</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-background p-3 rounded-md">
                        <div className="text-muted-foreground">Days since joining</div>
                        <div className="font-medium">{engagementData.feature_values.days_since_joining}</div>
                      </div>
                      <div className="bg-background p-3 rounded-md">
                        <div className="text-muted-foreground">Skills count</div>
                        <div className="font-medium">{engagementData.feature_values.num_skills}</div>
                      </div>
                      <div className="bg-background p-3 rounded-md">
                        <div className="text-muted-foreground">Desired skills</div>
                        <div className="font-medium">{engagementData.feature_values.num_desired_skills}</div>
                      </div>
                      <div className="bg-background p-3 rounded-md">
                        <div className="text-muted-foreground">Learning gap</div>
                        <div className="font-medium">{engagementData.feature_values.learning_gap}</div>
                      </div>
                    </div>
                  </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={fetchEngagementPrediction}>
                  Refresh Analysis
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={fetchCourseRecommendations}
              >
                <BookOpen className="h-4 w-4 text-blue-500" />
                Course Recommendations
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Recommended Courses</DialogTitle>
                <DialogDescription>
                  AI-powered course recommendations based on your skills and interests.
                </DialogDescription>
              </DialogHeader>

              {isLoadingCourses && (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
              )}

              {courseError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{courseError}</AlertDescription>
                  </Alert>
              )}

              {!isLoadingCourses && !courseError && courseRecommendations && (
                  <div className="space-y-4 py-4">
                    {Array.isArray(courseRecommendations) && courseRecommendations.length > 0 ? (
                        <div className="space-y-3">
                          {courseRecommendations.map((course, index) => (
                              <div
                                  key={index}
                                  className="bg-muted p-4 rounded-md flex items-center gap-3 hover:bg-muted/80 transition-colors"
                              >
                                <div className="bg-primary/10 p-2 rounded-full text-primary">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Skill :{course}</h4>
                                  <h4 className="font-medium">Confidence :{course}</h4>
                                  <p className="text-sm text-muted-foreground">Recommended based on your skills</p>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No course recommendations available.</p>
                          <p className="text-sm mt-2">Try adding more skills to your profile.</p>
                        </div>
                    )}
                  </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={fetchCourseRecommendations}>
                  Refresh Recommendations
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={fetchPrediction}
              >
                <Brain className="h-4 w-4 text-green-500" />
                Learning Profile Analysis
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Learning Profile Analysis</DialogTitle>
                <DialogDescription>
                  AI-powered analysis of your learning style and similar users.
                </DialogDescription>
              </DialogHeader>

              {isLoadingPrediction && (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
              )}

              {predictionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{predictionError}</AlertDescription>
                  </Alert>
              )}

              {!isLoadingPrediction && !predictionError && predictionData && (
                  <div className="space-y-5 py-4">
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Learning Cluster</h4>
                        <Badge variant="outline">Cluster {predictionData.cluster}</Badge>
                      </div>
                      <p className="text-sm">{predictionData.cluster_description}</p>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Confidence score: {Math.round(predictionData.confidence * 100)}%
                      </div>
                    </div>

                    {/* Replace the current skill assessment section with this */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Skill Assessment</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(predictionData.skill_scores).map(([skill, score]) => (
                            score > 0 && (
                                <div key={skill} className="bg-background p-3 rounded-md">
                                  <div className="flex justify-between items-center">
                                    <div className="font-medium text-sm">{skill}</div>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(score * 100)}%
                                    </Badge>
                                  </div>
                                  <div className="mt-2 bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-full"
                                        style={{ width: `${score * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                            )
                        ))}
                      </div>
                    </div>

                    {/* Add a section for recommended skills if needed */}
                    {predictionData.recommended_skills && predictionData.recommended_skills.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Recommended Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {predictionData.recommended_skills.map((skill: any, index) => (
                                <Badge key={index} variant="outline" className="text-sm">
                                  {skill.skill}
                                </Badge>
                            ))}
                          </div>
                        </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" /> Similar Users
                      </h4>
                      {predictionData.similar_users.map((user, index) => (
                          <div key={index} className="bg-muted p-3 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium text-sm">{user.user_id}</div>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(user.match_score * 100)}% match
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.skills.map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                              ))}
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={fetchPrediction}>
                  Refresh Analysis
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
  );
};
