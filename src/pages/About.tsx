import { motion } from 'framer-motion';

export function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
          <p className="text-lg text-muted-foreground">
            We're on a mission to make web development easier and more accessible.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground">
              To provide developers with the tools and resources they need to build
              exceptional web applications quickly and efficiently.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Vision</h2>
            <p className="text-muted-foreground">
              A world where creating high-quality web applications is accessible to
              developers of all skill levels.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Innovation</h3>
              <p className="text-muted-foreground">
                Constantly pushing boundaries and exploring new technologies.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Quality</h3>
              <p className="text-muted-foreground">
                Maintaining high standards in everything we create.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Community</h3>
              <p className="text-muted-foreground">
                Building and supporting a strong developer community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}