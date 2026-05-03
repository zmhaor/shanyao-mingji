import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen text-warm-ink font-sans relative">
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1"></div>
        <div className="mesh-blob mesh-blob-2"></div>
        <div className="mesh-blob mesh-blob-3"></div>
      </div>
      <div className="fixed inset-0 pointer-events-none noise-texture z-0"></div>
      <Navbar />
      <main className="relative z-10 pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
