import React from "react";
import { cn } from "../../lib/utils";

export const Footer = ({
  brandName = "YourBrand",
  brandDescription = "Your description here",
  socialLinks = [],
  navLinks = [],
  creatorName,
  creatorUrl,
  brandIcon,
  className,
}) => {
  return (
    <section className={cn("relative w-full mt-0 overflow-hidden", className)}>
      <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--outline-subtle)', marginTop: '80px', position: 'relative' }}>
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[25rem] sm:min-h-[28rem] md:min-h-[32rem] relative p-4 py-8">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--on-surface)', fontSize: '1.875rem', fontWeight: 700 }}>
                    {brandName}
                  </span>
                </div>
                <p style={{ color: 'var(--on-surface-variant)', fontWeight: 600, textAlign: 'center', maxWidth: '24rem', padding: '0 1rem' }}>
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-3 gap-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      style={{ color: 'var(--on-surface-variant)', transition: 'color 0.3s ease' }}
                      className="p-2 rounded-xl border border-transparent hover:border-[var(--outline-subtle)] group"
                      onMouseOver={e => e.currentTarget.style.color = 'var(--on-surface)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-6 h-6 group-hover:scale-110 group-hover:-translate-y-1 duration-300">
                        {link.icon}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium max-w-full px-4"
                  style={{ color: 'var(--on-surface-variant)' }}>
                  {navLinks.map((link, index) => (
                    <a
                      key={index}
                      className="cursor-pointer duration-300 hover:font-semibold"
                      href={link.href}
                      style={{ color: 'inherit', transition: 'color 0.3s' }}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--on-surface)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 md:mt-20 flex flex-col gap-6 w-full relative z-20">
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              {creatorName && creatorUrl ? (
                <nav className="flex gap-4 mx-auto md:mx-0">
                  <a
                    href={creatorUrl}
                    target="_blank"
                    style={{ color: 'var(--on-surface-variant)', transition: 'color 0.3s' }}
                    className="text-sm md:text-base hover:font-medium"
                    onMouseOver={e => e.currentTarget.style.color = 'var(--on-surface)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
                  >
                    Crafted by {creatorName}
                  </a>
                </nav>
              ) : <div />}
            </div>
            
            {/* Separator */}
            <div style={{ width: '100%', height: '1px', background: 'var(--outline-subtle)' }}></div>
            
            {/* Copyright */}
            <div className="flex items-center justify-center w-full pb-4">
              <p className="text-sm md:text-base text-center" style={{ color: 'var(--on-surface-variant)' }}>
                © {new Date().getFullYear()} {brandName}. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Large background text */}
        <div 
          className="leading-none absolute left-1/2 -translate-x-1/2 bottom-32 md:bottom-28 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4 z-0"
          style={{
            fontSize: 'clamp(3rem, 12vw, 10rem)',
            maxWidth: '95vw',
            color: 'var(--outline-subtle)',
            opacity: 0.3,
          }}
        >
          {brandName.toUpperCase()}
        </div>
      </footer>
    </section>
  );
};
