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
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[25rem] sm:min-h-[28rem] md:min-h-[32rem] relative p-4 py-8">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-3xl font-bold">
                    {brandName}
                  </span>
                </div>
                <p className="text-muted-foreground font-semibold text-center w-full max-w-sm sm:w-96 px-4 sm:px-0">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-3 gap-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
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
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground max-w-full px-4">
                  {navLinks.map((link, index) => (
                    <a
                      key={index}
                      className="cursor-pointer hover:text-foreground duration-300 hover:font-semibold"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 md:mt-20 flex flex-col gap-6 w-full relative z-20">
            {/* Top portion of the bottom block */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              {creatorName && creatorUrl ? (
                <nav className="flex gap-4 mx-auto md:mx-0">
                  <a
                    href={creatorUrl}
                    target="_blank"
                    className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors duration-300 hover:font-medium"
                  >
                    Crafted by {creatorName}
                  </a>
                </nav>
              ) : <div />}
            </div>
            
            {/* The separator line */}
            <div className="w-full h-px bg-border/50"></div>
            
            {/* Copyright Section */}
            <div className="flex items-center justify-center w-full pb-4">
              <p className="text-sm md:text-base text-muted-foreground text-center">
                © {new Date().getFullYear()} {brandName}. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Large background text - FIXED */}
        <div 
          className="bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-32 md:bottom-28 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4 z-0"
          style={{
            fontSize: 'clamp(3rem, 12vw, 10rem)',
            maxWidth: '95vw'
          }}
        >
          {brandName.toUpperCase()}
        </div>



        {/* Bottom line */}
        <div className="absolute bottom-[8rem] sm:bottom-[7.5rem] backdrop-blur-sm h-1 bg-gradient-to-r from-transparent via-border to-transparent w-full left-1/2 -translate-x-1/2 z-0"></div>

        {/* Bottom shadow */}
        <div className="bg-gradient-to-t from-background via-background/80 blur-[1em] to-background/40 absolute bottom-24 w-full h-24 z-0"></div>
      </footer>
    </section>
  );
};
