import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Calendar } from "@/components/ui/calendar";
  import { useState } from "react";
  import { format } from "date-fns";
  import { Loader2 } from "lucide-react";
  
  interface BookingDialogProps {
    sellerName: string;
    courseTitle: string;
    transactionId: string;
    onBook: (date: Date) => Promise<void>;
    isBooking?: boolean;
  }
  
  export function BookingDialog({ sellerName, courseTitle, transactionId, onBook, isBooking }: BookingDialogProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Book a Meeting
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Course: {courseTitle}</p>
              <p className="text-sm font-medium">Instructor: {sellerName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Select a Date</p>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => {if (date) {
                const now = new Date();
                const meetingStartTime = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  now.getHours(),
                  now.getMinutes(),
                  now.getSeconds(),
                  now.getMilliseconds()
                );
            
                onBook(meetingStartTime); 
              }}}
              disabled={!date || isBooking}
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }