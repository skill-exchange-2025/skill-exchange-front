import  {
    useState
} from 'react';
import { Wheel } from 'react-custom-roulette';
import { useSpinWheelMutation, useGetLastSpinTimeQuery } from '@/redux/features/wheel/wheelSpinApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const data = [
    { option: '50 Credits' },
    { option: '10 Credits' },
    { option: '20 Credits' },
    { option: '5 Credits' },
    { option: '30 Credits' },
    { option: '15 Credits' },
    { option: '25 Credits' },
    { option: '40 Credits' },
];

export const WheelOfFortune = () => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [spinWheel] = useSpinWheelMutation();
    const { data: lastSpinData } = useGetLastSpinTimeQuery();

    const canSpin = () => {
        if (!lastSpinData?.lastSpinTime) return true;
        const lastSpin = new Date(lastSpinData.lastSpinTime);
        const now = new Date();
        const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastSpin >= 24;
    };

    const handleSpinClick = async () => {
        if (!canSpin()) {
            toast.error('You can only spin once every 24 hours!');
            return;
        }

        try {
            setMustSpin(true);
            const result = await spinWheel().unwrap();
            // Map the prize to a number on the wheel
            const prizeIndex = data.findIndex(item => item.option.includes(result.credits.toString()));
            setPrizeNumber(prizeIndex);
        } catch (error) {
            toast.error('Failed to spin the wheel. Please try again later.');
        }
    };

    const handleSpinStop = () => {
        setMustSpin(false);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h2 className="text-2xl font-bold">Daily Wheel of Fortune</h2>
            <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={data}
                onStopSpinning={handleSpinStop}
                backgroundColors={['#ff8f43', '#70bbe0', '#0b3351', '#f9dd50']}
                textColors={['#ffffff']}
            />
            <Button
                onClick={handleSpinClick}
                disabled={mustSpin || !canSpin()}
                className="mt-4"
            >
                SPIN
            </Button>
            {!canSpin() && (
                <p className="text-sm text-muted-foreground">
                    Come back tomorrow for another spin!
                </p>
            )}
        </div>
    );
};