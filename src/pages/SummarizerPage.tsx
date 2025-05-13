// src/pages/SummarizerPage.tsx
import React from 'react';
import Summarizer from '../components/Summarizer';

const SummarizerPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">AI Text Summarizer</h1>
            <Summarizer />
            <footer className="mt-10 text-center text-gray-500 text-sm">
                <p>Powered by Hugging Face's facebook/bart-large-cnn model</p>
            </footer>
        </div>
    );
};

export default SummarizerPage;