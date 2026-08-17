'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuditForm } from '@/context/AuditFormContext';

export function Navigation() {
  const { open: openAuditForm } = useAuditForm();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Start', href: '#start' },
    { label: 'Systems', href: '#systems' },
    { label: 'Industries', href: '#industries' },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(51, 65, 85, 0.5)' }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="text-2xl font-bold text-white"
          whileHover={{ scale: 1.05 }}
        >
          DSF<span style={{ color: '#0ea5e9' }}>.</span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors text-sm font-medium"
              style={{ color: '#b0b0b0' }}
              whileHover={{ color: '#ffffff' }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/book')}>
            Book Demo
          </Button>
          <Button size="sm" onClick={() => openAuditForm()}>Start Building</Button>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="w-6 h-0.5 bg-white rounded-full"
            animate={{
              rotate: isOpen ? 45 : 0,
              y: isOpen ? 8 : 0,
            }}
          />
          <motion.span
            className="w-6 h-0.5 bg-white rounded-full"
            animate={{ opacity: isOpen ? 0 : 1 }}
          />
          <motion.span
            className="w-6 h-0.5 bg-white rounded-full"
            animate={{
              rotate: isOpen ? -45 : 0,
              y: isOpen ? -8 : 0,
            }}
          />
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden overflow-hidden backdrop-blur-md"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
        initial={{ height: 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-4 space-y-4 border-t" style={{ borderColor: 'rgba(51, 65, 85, 0.5)' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block hover:text-white transition-colors text-sm font-medium"
              style={{ color: '#b0b0b0' }}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 space-y-2 border-t" style={{ borderColor: 'rgba(51, 65, 85, 0.5)' }}>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                router.push('/book');
              }}
            >
              Book Demo
            </Button>
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                openAuditForm();
              }}
            >
              Start Building
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
