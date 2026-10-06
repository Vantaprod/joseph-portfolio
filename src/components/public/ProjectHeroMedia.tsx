"use client";

import { useEffect, useRef, useState } from "react";

export function ProjectHeroMedia({
  videoUrl,
  thumbnail,
  title,
}: {
  videoUrl: string | null;
  thumbnail: string | null;
  title: string;
}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    const img = imgRef.current;

    function apply(w: number, h: number) {
      if (w > 0 && h > 0) setRatio(w / h);
    }

    if (v) {
      if (v.videoWidth > 0) {
        apply(v.videoWidth, v.videoHeight);
      } else {
        const onMeta = () => apply(v.videoWidth, v.videoHeight);
        v.addEventListener("loadedmetadata", onMeta);
        return () => v.removeEventListener("loadedmetadata", onMeta);
      }
    }

    if (img) {
      if (img.naturalWidth > 0) {
        apply(img.naturalWidth, img.naturalHeight);
      } else {
        const onLoad = () => apply(img.naturalWidth, img.naturalHeight);
        img.addEventListener("load", onLoad);
        return () => img.removeEventListener("load", onLoad);
      }
    }
  }, [videoUrl, thumbnail]);

  const containerStyle: React.CSSProperties = {
    maxWidth: ratio ? "min(100%, calc(80vh * " + ratio + "))" : "100%",
    transition: "max-width 200ms ease-out",
  };

  if (videoUrl) {
    return (
      <div
        className="relative bg-black rounded-2xl overflow-hidden mb-8 md:mb-12 mx-auto"
        style={containerStyle}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          className="block w-full h-auto max-h-[80vh]"
        />
      </div>
    );
  }

  if (thumbnail) {
    return (
      <div
        className="relative bg-black rounded-2xl overflow-hidden mb-8 md:mb-12 mx-auto"
        style={containerStyle}
      >
        <img
          ref={imgRef}
          src={thumbnail}
          alt={title}
          className="block w-full h-auto max-h-[80vh]"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-surface border border-base rounded-2xl flex items-center justify-center mb-8 md:mb-12">
      <span className="text-muted">No media available</span>
    </div>
  );
}