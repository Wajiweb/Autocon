import React from 'react';
import { Twitter, Github, MessageSquare, Linkedin, Zap } from 'lucide-react';
import { Footer as AnimatedFooter } from '../ui/modem-animated-footer';

export default function Footer() {
  const socialLinks = [
    {
      icon: <Twitter className="w-5 h-5" />,
      href: 'https://twitter.com/AutoCon',
      label: 'Twitter',
    },
    {
      icon: <Github className="w-5 h-5" />,
      href: 'https://github.com/Wajiweb/Autocon',
      label: 'GitHub',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      href: 'https://discord.gg/autocon',
      label: 'Discord',
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: 'https://linkedin.com/company/autocon',
      label: 'LinkedIn',
    },
  ];

  const navLinks = [
    { label: 'Features', href: '#' },
    { label: 'Chain Support', href: '#' },
    { label: 'Templates', href: '#' },
    { label: 'AI Audit', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ];

  return (
    <AnimatedFooter
      brandName="AutoCon"
      brandDescription="No-code Web3 smart contract platform. Deploy and audit contracts on any EVM chain."
      socialLinks={socialLinks}
      navLinks={navLinks}
      creatorName="Wajiweb"
      creatorUrl="https://github.com/Wajiweb"
      brandIcon={<Zap className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-background drop-shadow-lg fill-current" />}
    />
  );
}
