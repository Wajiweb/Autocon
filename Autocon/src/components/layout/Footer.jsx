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
    { label: 'Features', href: '#features' },
    { label: 'Chain Support', href: '#chain' },
    { label: 'Templates', href: '#trading' },
    { label: 'AI Audit', href: '#features' },
    { label: 'Pricing', href: '#faq' },
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
    />
  );
}
