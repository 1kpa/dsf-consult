'use client';

import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Careers', href: '#' },
    ],
    Systems: [
      { label: 'Lead Capture', href: '#' },
      { label: 'CRM', href: '#' },
      { label: 'Automation', href: '#' },
      { label: 'AI Reception', href: '#' },
    ],
    Resources: [
      { label: 'Documentation', href: '#' },
      { label: 'Support', href: '#' },
      { label: 'Schedule Demo', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
    Legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  };

  return (
    <footer className="relative bg-dark-900/50 border-t border-dark-800/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-display text-2xl font-bold text-white mb-4">
              DSF<span className="text-accent-500">.</span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              Building automated client acquisition systems for local service businesses.
            </p>
          </motion.div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links], sectionIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (sectionIndex + 1) * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="text-dark-400 text-sm hover:text-white transition-colors"
                      whileHover={{ x: 3 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-dark-700/50 to-transparent mb-8 md:mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-dark-400">
            <p>© {currentYear} DSF Consult. All rights reserved.</p>
            <div className="flex gap-6">
              <motion.a href="#" whileHover={{ color: '#ffffff' }} className="hover:text-white">
                Twitter
              </motion.a>
              <motion.a href="#" whileHover={{ color: '#ffffff' }} className="hover:text-white">
                LinkedIn
              </motion.a>
              <motion.a href="#" whileHover={{ color: '#ffffff' }} className="hover:text-white">
                Instagram
              </motion.a>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            className="flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-dark-400">All systems operational</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
