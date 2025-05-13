import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WheelOfFortune } from "./WheelOfFortune";
import wheelIcon from '@/assets/icons/wheel-icon.png';

export function WheelFortuneDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="daily-spin-button flex items-center gap-2 " >
                    <img
                        src={wheelIcon}
                        alt="Daily Spin"
                        className="w-6 h-6 object-contain"
                    />
                    Daily Spin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <WheelOfFortune/>
            </DialogContent>
        </Dialog>
    );
}