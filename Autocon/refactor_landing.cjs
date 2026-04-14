const fs = require('fs');
const path = require('path');

const srcCode = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');

function extract(startStr, endStr) {
  const start = srcCode.indexOf(startStr);
  let end = srcCode.indexOf(endStr, start);
  if (end === -1) end = srcCode.length;
  return srcCode.substring(start, end).trim();
}

function writeComp(name, imports, code) {
  const finalCode = `import React from 'react';\n${imports}\n\n${code}\n\nexport default ${name};\n`;
  fs.writeFileSync(path.join('src/components/landingpage', `${name}.jsx`), finalCode);
}
function writeShared(code) {
  const imports = `import React, { useRef } from 'react';\nimport { motion, useInView } from 'framer-motion';\n`;
  // Add export to all consts
  let finalCode = code.replace(/const Reveal/g, 'export const Reveal')
                      .replace(/const PillBadge/g, 'export const PillBadge')
                      .replace(/const SectionHeading/g, 'export const SectionHeading');
  fs.writeFileSync(path.join('src/components/landingpage', `Shared.jsx`), `${imports}\n${finalCode}`);
}

const sharedCode = extract('/* ─── Reusable scroll-reveal wrapper ─── */', '/* ══════════════════════════════════════════════════════\n   NAVBAR');
writeShared(sharedCode);

const navBarCode = extract('/* ══════════════════════════════════════════════════════\n   NAVBAR', '/* ══════════════════════════════════════════════════════\n   HERO SECTION');
writeComp('NavBar', `import { useState } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { Menu, X } from 'lucide-react';`, navBarCode);

const heroCode = extract('/* ══════════════════════════════════════════════════════\n   HERO SECTION', '/* ══════════════════════════════════════════════════════\n   STATS BAR');
writeComp('HeroSection', `import { motion } from 'framer-motion';\nimport { ArrowRight } from 'lucide-react';\nimport { PillBadge } from './Shared';`, heroCode);

const statsCode = extract('/* ══════════════════════════════════════════════════════\n   STATS BAR', '/* ══════════════════════════════════════════════════════\n   SUB-HEADING BRIDGE');
writeComp('StatsSection', `import { Reveal } from './Shared';`, statsCode);

const simpCode = extract('/* ══════════════════════════════════════════════════════\n   SUB-HEADING BRIDGE', '/* ══════════════════════════════════════════════════════\n   ALTERNATING FEATURES');
writeComp('SimplifyingSection', `import { Reveal, SectionHeading } from './Shared';`, simpCode);

const altCode = extract('/* ══════════════════════════════════════════════════════\n   ALTERNATING FEATURES', '/* ══════════════════════════════════════════════════════\n   BENTO GRID');
writeComp('AlternatingFeatures', `import { motion } from 'framer-motion';\nimport { ChevronRight } from 'lucide-react';\nimport { Reveal } from './Shared';`, altCode);

const bentoCode = extract('/* ══════════════════════════════════════════════════════\n   BENTO GRID', '/* ══════════════════════════════════════════════════════\n   ICON GRID');
writeComp('BentoGrid', `import { motion } from 'framer-motion';\nimport { Reveal, PillBadge, SectionHeading } from './Shared';`, bentoCode);

const iconCode = extract('/* ══════════════════════════════════════════════════════\n   ICON GRID', '/* ══════════════════════════════════════════════════════\n   SECURITY SECTION');
writeComp('IconGrid', `import { motion } from 'framer-motion';\nimport { Wallet, Code2, BarChart3, Shield, Cpu, Globe } from 'lucide-react';\nimport { Reveal, PillBadge, SectionHeading } from './Shared';`, iconCode);

const secCode = extract('/* ══════════════════════════════════════════════════════\n   SECURITY SECTION', '/* ══════════════════════════════════════════════════════\n   FAQ ACCORDION');
writeComp('SecuritySection', `import { motion } from 'framer-motion';\nimport { Shield, Check } from 'lucide-react';\nimport { Reveal, PillBadge, SectionHeading } from './Shared';`, secCode);

const faqCode = extract('/* ══════════════════════════════════════════════════════\n   FAQ ACCORDION', '/* ══════════════════════════════════════════════════════\n   TESTIMONIALS');
writeComp('FAQ', `import { useState } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { ChevronDown } from 'lucide-react';\nimport { Reveal, SectionHeading } from './Shared';`, faqCode);

const testCode = extract('/* ══════════════════════════════════════════════════════\n   TESTIMONIALS', '/* ══════════════════════════════════════════════════════\n   FINAL CTA BANNER');
writeComp('Testimonials', `import { motion } from 'framer-motion';\nimport { Star } from 'lucide-react';\nimport { Reveal, SectionHeading } from './Shared';`, testCode);

const finalCTACode = extract('/* ══════════════════════════════════════════════════════\n   FINAL CTA BANNER', '/* ══════════════════════════════════════════════════════\n   ROOT EXPORT');
writeComp('FinalCTA', `import { motion } from 'framer-motion';\nimport { Reveal } from './Shared';`, finalCTACode);

// Now generate the new LandingPage.jsx keeping the rest
const newLandingPage = `import React from 'react';
import { Twitter, Linkedin, Github, MessageSquare } from 'lucide-react';
import { Footer as AnimatedFooter } from '../components/ui/modem-animated-footer';

import NavBar from '../components/landingpage/NavBar';
import HeroSection from '../components/landingpage/HeroSection';
import StatsSection from '../components/landingpage/StatsSection';
import SimplifyingSection from '../components/landingpage/SimplifyingSection';
import AlternatingFeatures from '../components/landingpage/AlternatingFeatures';
import BentoGrid from '../components/landingpage/BentoGrid';
import IconGrid from '../components/landingpage/IconGrid';
import SecuritySection from '../components/landingpage/SecuritySection';
import FAQ from '../components/landingpage/FAQ';
import Testimonials from '../components/landingpage/Testimonials';
import FinalCTA from '../components/landingpage/FinalCTA';

` + extract('/* ══════════════════════════════════════════════════════\n   ROOT EXPORT', 'EOF');

fs.writeFileSync('src/pages/LandingPage.jsx', newLandingPage);
console.log('done splitting components!');
