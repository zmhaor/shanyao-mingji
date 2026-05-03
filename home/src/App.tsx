import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Showcase } from './components/Showcase';
import { SpecialFeatures } from './components/SpecialFeatures';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { PageLayout } from './components/PageLayout';
import { Download } from './pages/Download';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Feedback } from './pages/Feedback';

function ScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [hash]);
  return null;
}

function HomePage() {
  return (
    <div className="min-h-screen text-warm-ink font-sans relative">
      {/* Background */}
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1"></div>
        <div className="mesh-blob mesh-blob-2"></div>
        <div className="mesh-blob mesh-blob-3"></div>
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none noise-texture z-0"></div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <Features />
        <Showcase />
        <SpecialFeatures />
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/download" element={<PageLayout><Download /></PageLayout>} />
        <Route path="/about" element={<PageLayout><About /></PageLayout>} />
        <Route path="/privacy" element={<PageLayout><Privacy /></PageLayout>} />
        <Route path="/terms" element={<PageLayout><Terms /></PageLayout>} />
        <Route path="/feedback" element={<PageLayout><Feedback /></PageLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
