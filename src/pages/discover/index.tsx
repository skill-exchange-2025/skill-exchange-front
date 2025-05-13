import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  MessageSquare,
  Users,
  GraduationCap,
  ArrowRight,
  Star,
  Zap,
  Shield,
  ShoppingBag,
  Brain,
  UserPlus,
  BookMarked,
  Cpu,
} from 'lucide-react';
import { Sparkles as SparklesComponent } from '@/components/ui/sparkles';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for AI recommendations
const recommendedCourses = [
  {
    id: 1,
    title: 'Advanced Web Development',
    instructor: 'Sarah Johnson',
    rating: 4.8,
    students: 1234,
    matchScore: 95,
    image: 'https://picsum.photos/200/300',
    tags: ['Web Development', 'JavaScript', 'React'],
  },
  {
    id: 2,
    title: 'Data Science Fundamentals',
    instructor: 'Michael Chen',
    rating: 4.9,
    students: 2345,
    matchScore: 92,
    image: 'https://picsum.photos/200/301',
    tags: ['Data Science', 'Python', 'Machine Learning'],
  },
  {
    id: 3,
    title: 'UI/UX Design Masterclass',
    instructor: 'Emma Wilson',
    rating: 4.7,
    students: 1890,
    matchScore: 88,
    image: 'https://picsum.photos/200/302',
    tags: ['Design', 'UI/UX', 'Figma'],
  },
];

const recommendedPartners = [
  {
    id: 1,
    name: 'Alex Thompson',
    skills: ['React', 'Node.js', 'TypeScript'],
    matchScore: 94,
    avatar: 'https://picsum.photos/200/303',
    expertise: 'Full Stack Development',
  },
  {
    id: 2,
    name: 'Lisa Chen',
    skills: ['Python', 'Data Analysis', 'Machine Learning'],
    matchScore: 91,
    avatar: 'https://picsum.photos/200/304',
    expertise: 'Data Science',
  },
  {
    id: 3,
    name: 'David Kim',
    skills: ['UI Design', 'Figma', 'User Research'],
    matchScore: 89,
    avatar: 'https://picsum.photos/200/305',
    expertise: 'UX Design',
  },
];

export function DiscoverPage() {
  const features = [
    {
      title: 'Skill Exchange',
      description:
        'Connect with others to exchange your skills and learn new ones.',
      icon: Users,
      path: '/marketplace',
    },
    {
      title: 'Interactive Courses',
      description: 'Join live courses and learn from experts in real-time.',
      icon: GraduationCap,
      path: '/marketplace?type=online-course',
    },
    {
      title: 'Static Courses',
      description: 'Access pre-recorded courses at your own pace.',
      icon: BookOpen,
      path: '/marketplace?type=course',
    },
    {
      title: 'Community Chat',
      description: 'Connect with other learners and share knowledge.',
      icon: MessageSquare,
      path: '/messaging',
    },
  ];

  const benefits = [
    {
      title: 'Earn While You Learn',
      description: 'Get paid for sharing your expertise with others.',
      icon: ShoppingBag,
    },
    {
      title: 'Flexible Learning',
      description: 'Learn at your own pace with our diverse course offerings.',
      icon: Zap,
    },
    {
      title: 'Verified Experts',
      description: 'Learn from verified professionals in their fields.',
      icon: Shield,
    },
    {
      title: 'Community Support',
      description: 'Get help and support from a vibrant community.',
      icon: Star,
    },
  ];

  return (
    <div className="flex flex-col relative overflow-hidden min-h-screen">
      <SparklesComponent
        className="opacity-90"
        count={300}
        colors={[
          'text-[#00EC96]',
          'text-[#2ECC71]',
          'text-[#50C878]',
          'text-[#00A86B]',
          'text-[#4CBB17]',
        ]}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          {/* AI Logo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-32 h-32 mx-auto mb-8"
          >
            {/* Outer Ring */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="absolute inset-0 rounded-full border-2 border-[#00EC96]"
            />

            {/* Middle Ring */}
            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: {
                  duration: 6,
                  repeat: Infinity,
                  ease: 'linear',
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="absolute inset-4 rounded-full border-2 border-[#2ECC71]"
            />

            {/* Inner Circle with Brain Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-8 rounded-full bg-gradient-to-br from-[#00EC96] to-[#00A86B] flex items-center justify-center"
            >
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Cpu className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>

            {/* Glowing Effect */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full bg-[#00EC96] blur-xl opacity-30"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Discover Your Learning Journey with AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Explore our platform's features and find the perfect way to learn
            and share your skills.
          </motion.p>
        </div>
      </section>

      {/* AI-Powered Recommendations Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-center mb-12">
            <Brain className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl font-bold text-center">
              AI-Powered Recommendations
            </h2>
          </div>

          {/* Recommended Courses */}
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <BookMarked className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-2xl font-semibold">Recommended Courses</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm"
                        >
                          {course.matchScore}% Match
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-lg mb-2">
                        {course.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        by {course.instructor}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{course.rating}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({course.students} students)
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Course
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommended Partners */}
          <div>
            <div className="flex items-center mb-8">
              <UserPlus className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-2xl font-semibold">Recommended Partners</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPartners.map((partner) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={partner.avatar} />
                          <AvatarFallback>{partner.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{partner.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {partner.expertise}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {partner.matchScore}% Match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {partner.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full">Connect</Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-background p-6 rounded-xl shadow-sm border border-border"
              >
                <div className="mb-4 rounded-lg bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <Link to={feature.path}>
                  <Button variant="ghost" className="p-0 h-auto">
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 rounded-lg bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-4"
          >
            Ready to Start Your Learning Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Join our community of learners and experts today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
