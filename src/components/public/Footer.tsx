import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function Footer() {
  const [settings, socials] = await Promise.all([
    prisma.siteSettings.findFirst(),
    prisma.socialLink.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-base bg-surface mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="text-lg font-bold tracking-widest text-base">
              JOSEPH<span className="text-primary">.</span>
            </p>
            <p className="text-muted text-sm mt-3 max-w-xs">
              {settings?.aboutHeadline ?? "Cinematographer & Creative Director"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-4">
              Navigate
            </p>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/work", label: "Work" },
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/software", label: "Software" },
                { href: "/contact", label: "Contact" },
                { href: "/media-kit", label: "Media Kit" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-4">
              Connect
            </p>
            <ul className="space-y-2 text-sm">
              {socials.length === 0 && (
                <li className="text-muted">No links yet</li>
              )}
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-muted hover:text-primary transition-colors capitalize"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-base flex flex-col sm:flex-row justify-between text-xs text-muted gap-3">
          <p>© {year} Joseph Chimaobi Egbuonu. All rights reserved.</p>
          <Link href="/login" className="hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}