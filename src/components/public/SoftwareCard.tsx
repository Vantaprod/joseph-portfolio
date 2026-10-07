type Item = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  techStack: string | null;
  url: string | null;
  repoUrl: string | null;
  thumbnail: string | null;
};

export function SoftwareCard({ item }: { item: Item }) {
  const tech = item.techStack
    ? item.techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="group bg-surface border border-base rounded-2xl overflow-hidden hover:border-[var(--color-primary)] transition-colors flex flex-col">
      <div className="relative aspect-video bg-black overflow-hidden">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
            No screenshot
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-widest text-primary mb-2">
          {item.type}
        </p>
        <h3 className="text-lg font-semibold text-base mb-2">{item.title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3 flex-1">
          {item.description}
        </p>

        {tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tech.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-base border border-base text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 text-xs pt-3 border-t border-base">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:underline font-semibold"
            >
              Visit Site ↗
            </a>
          )}
          {item.repoUrl && (
            <a
              href={item.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted hover:text-primary"
            >
              Source Code ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}