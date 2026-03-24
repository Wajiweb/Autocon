import React from 'react';
import GradientButton from './GradientButton';
import HeroCanvas from './3d/HeroCanvas';

export default function HeroSection() {
    return (
        <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden font-inter py-20 px-6">
            <HeroCanvas />

            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                {/* Massive bold h1 using Space Grotesk */}
                <h1 className="font-space font-bold tracking-[-0.04em] text-[clamp(2.5rem,5vw,5rem)] leading-tight text-white drop-shadow-sm">
                    The Modern Standard for <span className="text-transparent bg-clip-text bg-[image:var(--image-primary-gradient)]">Smart Contracts</span>
                </h1>
                
                {/* Muted subtext paragraph */}
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                    Deploy secure ERC-20 tokens, NFT collections, and Auction contracts instantly using our powerful no-code infrastructure.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                    <GradientButton className="w-full sm:w-auto text-lg px-8 py-4">
                        Start Deploying
                    </GradientButton>
                    <button className="w-full sm:w-auto px-8 py-4 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors duration-200">
                        View Documentation
                    </button>
                </div>
            </div>
        </section>
    );
}
