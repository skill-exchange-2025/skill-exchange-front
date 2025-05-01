import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '../ui/dialog';
import {Button} from '../ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '../ui/form';
import {Input} from '../ui/input';
import {Textarea} from '../ui/textarea';

interface NewChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<{
    name: string;
    topic?: string;
  }>;
  onSubmit: (values: { name: string; topic?: string }) => void;
  isLoading: boolean;
}

const NewChannelModal: React.FC<NewChannelModalProps> = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="project-discussion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose of this channel"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Channel'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewChannelModal;
