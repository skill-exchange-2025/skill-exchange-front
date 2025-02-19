import { motion } from 'framer-motion';

export function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12"
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: March 15, 2024
          </p>
        </div>

        <section>
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you:
          </p>
          <ul>
            <li>Create an account</li>
            <li>Use our services</li>
            <li>Contact us for support</li>
            <li>Subscribe to our newsletter</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Send you technical notices and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Understand how you use our services</li>
          </ul>
        </section>

        <section>
          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul>
            <li>With your consent</li>
            <li>To comply with laws</li>
            <li>To protect our rights and property</li>
          </ul>
        </section>

        <section>
          <h2>Security</h2>
          <p>
            We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@example.com<br />
            Address: 123 Privacy Street, Security City, SC 12345
          </p>
        </section>
      </div>
    </motion.div>
  );
}