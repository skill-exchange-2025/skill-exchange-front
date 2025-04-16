import React from 'react';

interface LoaderProps {
    size?: 'small' | 'medium' | 'large'; // Optional prop to control size of the loader
    color?: string; // Optional prop for custom color
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', color = 'blue' }) => {
    let loaderSize;

    switch (size) {
        case 'small':
            loaderSize = 'w-6 h-6'; // Small size (1.5rem)
            break;
        case 'large':
            loaderSize = 'w-12 h-12'; // Large size (3rem)
            break;
        default:
            loaderSize = 'w-8 h-8'; // Default size (2rem)
            break;
    }

    return (
        <div
            className={`animate-spin rounded-full border-4 border-t-4 border-${color}-500 ${loaderSize}`}
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export { Loader };
