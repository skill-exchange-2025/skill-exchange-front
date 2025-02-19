import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container py-24 space-y-8 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Build Better Apps<br />Faster Than Ever
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            The modern platform for building exceptional applications. Start your journey today.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container py-16 space-y-16">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Powerful Features
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Zap className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-bold">Lightning Fast</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Built with performance in mind, ensuring your application runs smoothly.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-bold">Secure by Default</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Enterprise-grade security features to protect your data and users.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-bold">Easy to Use</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Intuitive interface and comprehensive documentation for quick adoption.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-16 space-y-16">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          What Our Users Say
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card rounded-lg shadow-sm"
            >
              <p className="text-gray-500 dark:text-gray-400 mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-lg bg-primary p-8 text-center text-primary-foreground"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          <p className="mx-auto max-w-[600px] mb-8 text-primary-foreground/90">
            Join thousands of developers building better applications with our platform.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary">
              Start Building Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

const testimonials = [
  {
    content: "This platform has transformed how we build applications. The development speed is incredible.",
    name: "Sarah Chen",
    role: "Lead Developer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    content: "The security features and performance optimizations are exactly what we needed. Highly recommended.",
    name: "Michael Rodriguez",
    role: "CTO",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    content: "Documentation is top-notch, and the community support is amazing. Best development decision we've made.",
    name: "Emily Taylor",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
];