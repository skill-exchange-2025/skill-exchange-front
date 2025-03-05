import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  ShoppingBag,
  Zap,
  Users,
  GraduationCap,
  Star,
  MessageSquare,
  Handshake,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
            <Link to="/explore">
              <Button size="lg" variant="outline">
                Explore Skills
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="container py-24 sm:py-32 bg-muted/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
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
                <Handshake className="h-8 w-8 text-primary" />
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
      <section className="container py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
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
                animate={{ scale: [1, 1.1, 1] }}
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
  const controls = useAnimation();

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
