import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/public/ProjectCard";
import { TestimonialCarousel } from "@/components/public/TestimonialCarousel";
import { ClientLogos } from "@/components/public/ClientLogos";
import { ParticleDonut } from "@/components/public/ParticleDonut";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, featured, services, testimonials, clientLogos] =
    await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.project.findMany({
        where: { featured: true, published: true },
        orderBy: { order: "asc" },
        take: 3,
      }),
      prisma.service.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        take: 4,
      }),
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      prisma.clientLogo.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
    ]);

  const heroHeading = settings?.heroHeading ?? "FRAME YOUR STORY.";
  const heroSubtitle = settings?.heroSubtitle ?? "Cinematographer - Videographer - Editor";
  const heroCta = settings?.heroCtaLabel ?? "View My Work";
  const heroCtaLink = settings?.heroCtaLink ?? "/work";
  const heroSecondary = settings?.heroSecondaryCta ?? "Contact Me";
  const heroSecondaryLink = settings?.heroSecondaryLink ?? "/contact";

  return (
    <>
      {/* HERO */}
      <section className="relative w-full max-w-full overflow-hidden">
        {/* Gradient bg */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[var(--bg)]" />
        </div>

        {/* Desktop-only donut positioned right */}
        <div
          className="hidden md:flex absolute inset-0 pointer-events-none items-center justify-end pr-8 lg:pr-16"
          aria-hidden="true"
        >
          <div
            className="relative"
            style={{
              width: "min(46vw, 620px)",
              height: "min(46vw, 620px)",
            }}
          >
            <ParticleDonut />
          </div>
        </div>

        {/* Content stack */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-24 md:min-h-[90vh] flex flex-col justify-center">
          {/* Hero text */}
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-6">
            {heroSubtitle}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-base max-w-4xl">
            {heroHeading.split(" ").map((word, i) => (
              <span key={i} className={i === 1 ? "text-primary" : ""}>
                {word}{" "}
              </span>
            ))}
          </h1>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={heroCtaLink}
              prefetch={true}
              className="bg-primary text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:shadow-[0_0_20px_rgba(232,122,45,0.4)]"
            >
              {heroCta}
            </Link>
            <Link
              href={heroSecondaryLink}
              prefetch={true}
              className="border-2 border-base text-base font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:border-[var(--color-primary)] hover:text-primary hover:bg-[rgba(232,122,45,0.08)] focus:outline-none focus:border-[var(--color-primary)] focus:text-primary focus:bg-[rgba(232,122,45,0.08)] focus:shadow-[0_0_0_4px_rgba(232,122,45,0.20)] active:scale-95"
            >
              {heroSecondary}
            </Link>
          </div>

          {/* Mobile-only donut BELOW the text */}
          <div
            className="flex md:hidden items-center justify-center mt-12 md:mt-0 pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="relative w-full"
              style={{
                maxWidth: "min(85vw, 420px)",
                aspectRatio: "1 / 1",
              }}
            >
              <ParticleDonut />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORK */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Featured Work
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-base">
              Selected Projects
            </h2>
          </div>
          <Link
            href="/work"
            prefetch={true}
            className="hidden md:inline text-sm text-muted hover:text-primary transition-colors"
          >
            View all
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-muted">No featured projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      {/* SERVICES PREVIEW */}
      <section className="bg-surface border-y border-base">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <p className="text-xs uppercase tracking-widest text-primary mb-3">
            What I Do
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-base mb-12 max-w-2xl">
            Services built for stories that need to be seen.
          </h2>

          {services.length === 0 ? (
            <p className="text-muted">No services yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-base border border-base rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="w-8 h-0.5 bg-primary mb-4" />
                  <h3 className="text-lg font-semibold text-base">{s.title}</h3>
                  <p className="text-sm text-muted mt-3 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/services"
            prefetch={true}
            className="inline-block mt-10 text-sm text-primary hover:underline"
          >
            Explore all services
          </Link>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              About
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-base mb-6">
              {settings?.aboutHeadline ?? "Creative Director & Cinematographer"}
            </h2>
            <p className="text-muted leading-relaxed mb-8">
              {settings?.aboutBio ||
                "I am a creative professional specializing in cinematography, videography and video editing."}
            </p>
            <Link
              href="/about"
              prefetch={true}
              className="inline-block border-2 border-base text-base font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:border-[var(--color-primary)] hover:text-primary hover:bg-[rgba(232,122,45,0.08)] focus:outline-none focus:border-[var(--color-primary)] focus:text-primary focus:bg-[rgba(232,122,45,0.08)] focus:shadow-[0_0_0_4px_rgba(232,122,45,0.20)] active:scale-95"
            >
              More About Me
            </Link>
          </div>
          <div className="relative aspect-square bg-surface border border-base rounded-3xl overflow-hidden flex items-center justify-center">
            {settings?.aboutImage ? (
              <img
                src={settings.aboutImage}
                alt={settings.aboutName ?? "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-muted text-sm">Profile Image</p>
            )}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <TestimonialCarousel testimonials={testimonials} />
      )}

      {clientLogos.length > 0 && <ClientLogos clients={clientLogos} />}

      <section className="bg-surface border-t border-base">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-base mb-6">
            Got a project in mind?
          </h2>
          <p className="text-muted mb-10">
            Let&apos;s bring your vision to life.
          </p>
          <Link
            href="/contact"
            prefetch={true}
            className="inline-block bg-primary text-white font-semibold px-8 py-4 rounded-full transition-all hover:shadow-[0_0_20px_rgba(232,122,45,0.4)]"
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </>
  );
}