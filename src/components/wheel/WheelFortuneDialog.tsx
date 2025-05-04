import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WheelOfFortune } from "./WheelOfFortune"; // The component we created earlier

export function WheelFortuneDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <img
                        src="/wheel-icon.png" // Add your wheel icon
                        alt="Wheel"
                        className="w-5 h-5"
                    />
                    Daily Spin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <WheelOfFortune />
            </DialogContent>
        </Dialog>
    );
}
