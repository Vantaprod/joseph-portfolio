"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/software", label: "Software" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base/80 backdrop-blur-md border-b border-base"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        <Link
          href="/"
          prefetch={true}
          className="text-lg font-bold tracking-widest text-base hover:text-primary transition-colors"
        >
          JOSEPH<span className="text-primary">.</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={true}
                  className={`text-sm tracking-wide uppercase transition-colors ${
                    active ? "text-primary" : "text-muted hover:text-base"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/contact"
          prefetch={true}
          className="hidden md:inline-flex bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-[0_0_20px_rgba(232,122,45,0.35)]"
        >
          Let&apos;s Talk
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-base transition-transform ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-base transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-base transition-transform ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-base bg-base">
          <ul className="px-6 py-4 space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={true}
                  className="block py-2 text-base hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                prefetch={true}
                className="inline-block mt-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full"
              >
                Let&apos;s Talk
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}