import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface CheckEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function CheckEmailDialog({ isOpen, onClose, email }: CheckEmailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Check your email
          </DialogTitle>
          <DialogDescription>
            We've sent a verification link to <strong>{email}</strong>. Please
            check your email and click the link to verify your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            If you don't see the email in your inbox, please check your spam
            folder.
          </p>
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 