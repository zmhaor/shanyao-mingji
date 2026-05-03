import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Menu, X, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { href: "#hero", label: "概览" },
  { href: "#features", label: "核心设计" },
  { href: "#showcase", label: "工具矩阵" },
  { href: "#special-features", label: "特色功能" },
  { href: "/download", label: "下载", isRoute: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (!isHomePage) return;

      // Track active section
      const sections = ['#hero', '#features', '#showcase', '#special-features'];
      for (const section of [...sections].reverse()) {
        const el = document.querySelector(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (isHomePage) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/' + href);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-2.5 glass-strong shadow-lg shadow-black/[0.04]'
            : 'py-4 bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-white shadow-lg shadow-olive/20 group-hover:shadow-olive/40 transition-shadow duration-300"
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Leaf size={20} strokeWidth={2} />
            </motion.div>
            <div>
              <span className="serif text-lg font-bold tracking-wide text-warm-ink">山药铭记</span>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-olive to-warm-accent transition-all duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/40 backdrop-blur-xl rounded-2xl px-2 py-1.5 border border-white/60 shadow-sm">
            {navLinks.map((link) => (
              'isRoute' in link && link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 text-warm-muted hover:text-warm-ink hover:bg-white/50"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    activeSection === link.href
                      ? 'text-olive bg-white shadow-sm'
                      : 'text-warm-muted hover:text-warm-ink hover:bg-white/50'
                  }`}
                >
                  {link.label}
                  {activeSection === link.href && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-olive"
                      layoutId="navIndicator"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </a>
              )
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <motion.a
              href="/download"
              onClick={(e) => { e.preventDefault(); navigate('/download'); }}
              className="btn-primary px-6 py-2.5 rounded-full glass-dark text-sm font-medium shadow-lg shadow-olive/20 inline-flex items-center gap-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>体验小程序</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-warm-ink"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <motion.div
              className="absolute top-20 left-4 right-4 glass-strong rounded-2xl p-4 shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link, idx) => (
                  'isRoute' in link && link.isRoute ? (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-between text-warm-ink hover:bg-olive/5 block"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`px-4 py-3.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-between ${
                        activeSection === link.href
                          ? 'text-olive bg-olive/10'
                          : 'text-warm-ink hover:bg-olive/5'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {link.label}
                      {activeSection === link.href && (
                        <div className="w-1.5 h-1.5 rounded-full bg-olive"></div>
                      )}
                    </motion.a>
                  )
                ))}
                <div className="h-px bg-warm-border my-2"></div>
                <motion.a
                  href="/download"
                  onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/download'); }}
                  className="px-4 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-olive to-olive-light rounded-xl text-center shadow-lg shadow-olive/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  体验小程序
                </motion.a>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
