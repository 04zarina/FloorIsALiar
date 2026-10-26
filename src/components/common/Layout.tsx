import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-disco-bg text-disco-cream overflow-x-hidden">
      {/* Subtle 1970s dance-floor checkerboard background pattern */}
      <div className="fixed inset-0 dancefloor-checkerboard opacity-20 pointer-events-none z-0" />

      {/* Main UI */}
      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};
