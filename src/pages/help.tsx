import {motion} from 'framer-motion';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from '@/components/ui/accordion';

export function Help() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions and learn how to use our platform.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I get started?</AccordionTrigger>
                <AccordionContent>
                  Sign up for an account and follow our quick start guide to begin building your first project.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What are the system requirements?</AccordionTrigger>
                <AccordionContent>
                  Our platform works on any modern web browser. For development, we recommend using Node.js 16 or higher.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                <AccordionContent>
                  Click the "Forgot Password" link on the sign-in page and follow the instructions sent to your email.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is there a free plan available?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer a generous free tier that includes all essential features to get you started.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Need More Help?</h2>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore our comprehensive documentation for detailed guides and examples.
                </p>
                <a href="/docs" className="text-primary hover:underline">
                  View Documentation →
                </a>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get in touch with our support team for personalized assistance.
                </p>
                <a href="/contact" className="text-primary hover:underline">
                  Contact Us →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}