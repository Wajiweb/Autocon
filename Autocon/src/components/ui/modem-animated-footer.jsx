import React from "react";
import { NotepadTextDashed } from "lucide-react";
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
      <footer className="border-t bg-background mt-20 relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[30rem] sm:min-h-[35rem] md:min-h-[40rem] relative p-4 py-10">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1 relative w-full">
                {/* Brand highlight backlight glow (orange lights) */}
                <div style={{
                  position: 'absolute',
                  width: '320px',
                  height: '140px',
                  background: 'radial-gradient(circle, hsla(25, 100%, 50%, 0.16) 0%, transparent 70%)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  filter: 'blur(35px)',
                  zIndex: 0,
                }} />

                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-foreground text-3xl font-bold">
                    {brandName}
                  </span>
                </div>
                <p className="text-muted-foreground font-semibold text-center w-full max-w-sm sm:w-96 px-4 sm:px-0 relative z-10">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-5 gap-5 relative z-10">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-[hsl(25,100%,50%)] transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-6 h-6 hover:scale-110 duration-300">
                        {link.icon}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground max-w-full px-4 relative z-10">
                  {navLinks.map((link, index) => {
                    const isAnchor = link.href.startsWith('#');
                    const handleClick = (e) => {
                      if (isAnchor && link.href !== '#') {
                        e.preventDefault();
                        const id = link.href.substring(1);
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    };
                    return (
                      <a
                        key={index}
                        className="hover:text-[hsl(25,100%,50%)] duration-300 hover:font-semibold"
                        href={link.href}
                        onClick={handleClick}
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-20 md:mt-24 flex flex-col gap-2 md:gap-1 items-center justify-center md:flex-row md:items-center md:justify-between px-4 md:px-0">
            <p className="text-base text-muted-foreground text-center md:text-left">
              ©{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <a
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-muted-foreground hover:text-foreground transition-colors duration-300 hover:font-medium"
                >
                  Crafted by {creatorName}
                </a>
              </nav>
            )}
          </div>
        </div>

        {/* Large background text - FIXED */}
        <div 
          className="bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-40 md:bottom-32 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4"
          style={{
            fontSize: 'clamp(3rem, 12vw, 10rem)',
            maxWidth: '95vw',
            backgroundImage: 'linear-gradient(to bottom, var(--primary), transparent)',
            opacity: 0.6,
            filter: 'drop-shadow(0 0 15px hsla(25, 100%, 50%, 0.35)) drop-shadow(0 0 30px hsla(25, 100%, 50%, 0.15))'
          }}
        >
          {brandName.toUpperCase()}
        </div>


        {/* Bottom line */}
        <div className="absolute bottom-32 sm:bottom-34 backdrop-blur-sm h-1 bg-gradient-to-r from-transparent via-border to-transparent w-full left-1/2 -translate-x-1/2"></div>

        {/* Bottom shadow */}
        <div className="bg-gradient-to-t from-background via-background/80 blur-[1em] to-background/40 absolute bottom-28 w-full h-24"></div>
      </footer>
    </section>
  );
};

export default Footer;
