import {motion} from 'framer-motion';
import {Button} from '@/components/ui/button';
import {Link} from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    MessageSquare,
    Shield,
    ShoppingBag,
    Star,
    Users,
    Zap,
} from 'lucide-react';
import {useEffect, useState} from 'react';

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container py-24 md:py-32 bg-gradient-to-b from-background to-background/80">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-6">
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-primary">Skilly</span>
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-1 bg-[#00EC96] mt-2 mx-auto rounded-full shadow-[0_0_10px_#00EC96,0_0_20px_#00EC96] animate-pulse"
              style={{
                boxShadow:
                  '0 0 10px #00EC96, 0 0 20px #00EC96, 0 0 30px #00EC96',
              }}
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Exchange Skills, <span className="text-primary">Grow Together</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-prose">
            Connect with talented individuals, exchange skills, and build your
            portfolio on Skilly - the intuitive skill exchange platform.
          </p>
          <div className="mt-10 flex gap-4">
            <Link to="/signup">
              <Button size="lg">
                Join Skilly <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Explore Skills
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="container py-24 sm:py-32 bg-muted/50 relative overflow-hidden">
        {/* Background Shape */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute -top-24 -right-24 w-96 h-96 text-[#00EC96]/20 opacity-80 animate-pulse"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter:
                'drop-shadow(0 0 10px #00EC96) drop-shadow(0 0 20px #00EC96)',
            }}
          >
            <path
              fill="currentColor"
              d="M42.8,-73.1C56.9,-66.2,70.7,-57.7,79.3,-45.1C87.9,-32.6,91.2,-16.3,89.8,-0.8C88.4,14.7,82.3,29.3,73.6,42.2C64.9,55.1,53.5,66.2,40.3,74.1C27,82,13.5,86.7,-0.4,87.4C-14.3,88.1,-28.6,84.9,-41.9,78.3C-55.2,71.7,-67.5,61.7,-76.3,48.9C-85.1,36,-90.4,18,-90.2,0.1C-90,-17.8,-84.3,-35.6,-74.8,-50.2C-65.3,-64.7,-51.9,-76,-37.6,-82.5C-23.3,-89,-11.7,-90.7,1.2,-92.8C14,-94.9,28.7,-80,42.8,-73.1Z"
              transform="translate(100 100)"
            />
          </svg>
          <svg
            className="absolute -bottom-24 -left-24 w-96 h-96 text-[#00EC96]/20 opacity-80 animate-pulse"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter:
                'drop-shadow(0 0 10px #00EC96) drop-shadow(0 0 20px #00EC96)',
            }}
          >
            <path
              fill="currentColor"
              d="M39.9,-68.1C52.9,-62.1,65.8,-54.1,74.2,-42.2C82.6,-30.3,86.5,-15.1,85.8,-0.4C85.1,14.4,79.9,28.8,71.5,41.2C63.2,53.6,51.7,64.1,38.7,70.7C25.7,77.3,11.3,80,-2.4,83.7C-16.2,87.4,-32.4,92.1,-45.9,87.8C-59.4,83.5,-70.2,70.2,-77.9,55.5C-85.6,40.8,-90.2,24.7,-91.3,8.3C-92.4,-8.1,-90,-24.8,-82.2,-38.2C-74.4,-51.6,-61.2,-61.7,-47,-67.8C-32.8,-73.9,-17.6,-76,-1.9,-72.9C13.8,-69.8,27.6,-74.1,39.9,-68.1Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            How Skilly Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy to connect, learn, and grow through skill
            exchanges
          </p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className="mb-6 rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center"
              whileHover={{
                backgroundColor: 'rgba(var(--primary), 0.2)',
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              >
                <Users className="h-8 w-8 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Create Your Profile</h3>
            <p className="mt-2 text-muted-foreground">
              Showcase your skills, experience, and what you're looking to learn
              from others.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className="mb-6 rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center"
              whileHover={{
                backgroundColor: 'rgba(var(--primary), 0.2)',
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                animate={{
                  x: [0, 5, 0, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
              >
                <MessageSquare className="h-8 w-8 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Connect & Exchange</h3>
            <p className="mt-2 text-muted-foreground">
              Find matches based on complementary skills and arrange mutually
              beneficial exchanges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className="mb-6 rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center"
              whileHover={{
                backgroundColor: 'rgba(var(--primary), 0.2)',
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
              >
                <GraduationCap className="h-8 w-8 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Learn & Grow</h3>
            <p className="mt-2 text-muted-foreground">
              Develop new skills, build your portfolio, and receive feedback
              from peers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 sm:py-32 relative overflow-hidden">
        {/* Background Shape */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute top-0 right-0 w-96 h-96 text-[#00EC96]/20 opacity-80 animate-pulse"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter:
                'drop-shadow(0 0 10px #00EC96) drop-shadow(0 0 20px #00EC96)',
            }}
          >
            <path
              fill="currentColor"
              d="M47.7,-80.4C62.9,-72.2,77,-61.5,83.9,-47.1C90.8,-32.7,90.5,-14.4,88.1,3C85.7,20.4,81.2,37,72.6,51.1C64,65.2,51.3,76.8,36.8,83.1C22.3,89.4,6,90.3,-10.9,89.1C-27.8,87.9,-45.3,84.6,-58.5,75.3C-71.7,66,-80.7,50.7,-85.2,34.8C-89.7,18.9,-89.8,2.3,-86.7,-13.3C-83.6,-28.9,-77.3,-43.5,-67.1,-54.6C-56.9,-65.7,-42.8,-73.3,-28.4,-81.5C-14,-89.7,0.7,-98.5,15.8,-96.9C30.9,-95.3,46.5,-83.3,47.7,-80.4Z"
              transform="translate(100 100)"
            />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-96 h-96 text-[#00EC96]/20 opacity-80 animate-pulse"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter:
                'drop-shadow(0 0 10px #00EC96) drop-shadow(0 0 20px #00EC96)',
            }}
          >
            <path
              fill="currentColor"
              d="M42.7,-76.2C53.9,-69.3,61.1,-54.9,68.1,-41.3C75.1,-27.7,82,-14.8,83.1,-1.1C84.3,12.7,79.6,25.4,72.5,36.9C65.3,48.3,55.6,58.5,43.9,65.3C32.2,72.1,18.5,75.5,3.7,70.5C-11.1,65.5,-27.4,52.1,-39.2,39.8C-51,27.5,-58.3,16.2,-63.3,2.9C-68.3,-10.5,-71,-23.9,-67.7,-36.3C-64.4,-48.7,-55.1,-60.1,-43.1,-66.8C-31.1,-73.6,-16.5,-75.7,-0.5,-74.9C15.5,-74.1,31.5,-83.1,42.7,-76.2Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Skilly Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to exchange skills and grow your network
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{
              scale: 1.03,
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center p-6 rounded-xl border border-transparent hover:border-primary/20"
          >
            <motion.div
              className="mb-4 rounded-lg bg-primary/10 p-3"
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 },
              }}
            >
              <Shield className="h-6 w-6 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold">Secure Exchanges</h3>
            <p className="mt-2 text-muted-foreground">
              Built-in verification, reviews, and dispute resolution to ensure
              safe and fair exchanges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{
              scale: 1.03,
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center p-6 rounded-xl border border-transparent hover:border-primary/20"
          >
            <motion.div
              className="mb-4 rounded-lg bg-primary/10 p-3"
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 },
              }}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
              >
                <ShoppingBag className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Skill Marketplace</h3>
            <p className="mt-2 text-muted-foreground">
              Browse, offer, and request skills in our comprehensive marketplace
              with advanced filtering.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{
              scale: 1.03,
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center p-6 rounded-xl border border-transparent hover:border-primary/20"
          >
            <motion.div
              className="mb-4 rounded-lg bg-primary/10 p-3"
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 },
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
              >
                <Star className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Reputation System</h3>
            <p className="mt-2 text-muted-foreground">
              Build your reputation through successful exchanges and quality
              feedback from peers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            whileHover={{
              scale: 1.03,
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center p-6 rounded-xl border border-transparent hover:border-primary/20"
          >
            <motion.div
              className="mb-4 rounded-lg bg-primary/10 p-3"
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 },
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              >
                <MessageSquare className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Integrated Messaging</h3>
            <p className="mt-2 text-muted-foreground">
              Seamless communication with potential exchange partners through
              our secure messaging system.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{
              scale: 1.03,
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center p-6 rounded-xl border border-transparent hover:border-primary/20"
          >
            <motion.div
              className="mb-4 rounded-lg bg-primary/10 p-3"
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 },
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
              >
                <Zap className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Smart Matching</h3>
            <p className="mt-2 text-muted-foreground">
              AI-powered matching algorithm to find the perfect skill exchange
              partners based on your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            whileHover={{
              scale: 1.03,
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center p-6 rounded-xl border border-transparent hover:border-primary/20"
          >
            <motion.div
              className="mb-4 rounded-lg bg-primary/10 p-3"
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 },
              }}
            >
              <motion.div
                animate={{ scale: [1, 0.9, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              >
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold">Skill Verification</h3>
            <p className="mt-2 text-muted-foreground">
              Optional skill verification through portfolio reviews,
              certifications, and peer endorsements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-24 sm:py-32 bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
            Skilly Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center">
            See how our platform has helped people learn new skills and grow
            their networks
          </p>
        </motion.div>

        <TestimonialCarousel testimonials={testimonials} />
      </section>

      {/* CTA Section */}
      <section className="container py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-primary/10 p-8 md:p-12 lg:p-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to Start Your Skilly Journey?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our growing community of skill exchangers and start learning,
            teaching, and growing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

const testimonials = [
  {
    content:
      'I taught web development to a graphic designer who helped me redesign my portfolio. Skilly made the exchange incredibly valuable for both of us!',
    name: 'Sarah Chen',
    title: 'Full Stack Developer',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
  },
  {
    content:
      'As a self-taught photographer, I exchanged photography lessons for SEO optimization on Skilly. My website now ranks on the first page for local photography searches!',
    name: 'Michael Torres',
    title: 'Professional Photographer',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
  {
    content:
      'I needed help with UX design for my app, and in exchange, I offered my copywriting skills. Skilly made it easy to find the perfect match for my needs.',
    name: 'Emily Johnson',
    title: 'Content Creator',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
  },
];

interface Testimonial {
  content: string;
  name: string;
  title: string;
  avatar: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel = ({ testimonials }: TestimonialCarouselProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Create an extended list of testimonials for infinite scrolling effect
  const extendedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPaused, testimonials.length]);

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background/80 shadow-md hover:bg-background"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background/80 shadow-md hover:bg-background"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex"
          animate={{ x: `-${(activeIndex * 100) / testimonials.length}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {extendedTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="min-w-[100%] sm:min-w-[50%] lg:min-w-[33.333%] px-4"
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="rounded-lg border bg-card p-6 shadow-sm h-full">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <Star className="h-5 w-5 text-yellow-500" />
                  <Star className="h-5 w-5 text-yellow-500" />
                  <Star className="h-5 w-5 text-yellow-500" />
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-muted-foreground mb-6">
                  {testimonial.content}
                </p>
                <div className="flex items-center mt-auto">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="flex justify-center mt-8 gap-2">
        {testimonials.map((_, index: number) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all ${
              activeIndex === index ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
