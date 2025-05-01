// src/components/Redirector.tsx
import {useAuthRedirect} from '@/utils/auth';

const Redirector = () => {
    useAuthRedirect();
    return null; // Or a loading spinner/indicator
};

export default Redirector;