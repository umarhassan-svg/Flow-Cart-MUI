// src/components/products/BannerSlider.tsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export type Banner = {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  overlayColor?: string;
};

type Props = {
  banners: Banner[];
  autoPlay?: boolean;
  intervalMs?: number;
  height?: number | string;
};

const BannerSlider = ({
  banners,
  autoPlay = true,
  intervalMs = 5000,
  height = 220,
}: Props) => {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoPlay) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % Math.max(1, banners.length));
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoPlay, intervalMs, banners.length]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + banners.length) % banners.length);

  // simple swipe handlers
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => (startX = e.touches[0].clientX);
    const onTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) go(1);
      else if (endX - startX > 50) go(-1);
    };
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <Box
      sx={{ position: "relative", overflow: "hidden", borderRadius: 2 }}
      ref={ref}
    >
      <Box
        sx={{
          display: "flex",
          transition: "transform 420ms cubic-bezier(.2,.9,.2,1)",
          transform: `translateX(-${index * 100}%)`,
          width: `${banners.length * 100}%`,
        }}
      >
        {banners.map((b) => (
          <Box
            key={b.id}
            sx={{
              minWidth: "100%",
              height,
              position: "relative",
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0.02)), url(${b.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              px: { xs: 2, md: 6 },
            }}
          >
            <Box sx={{ maxWidth: 720, color: "#fff" }}>
              {b.title && (
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                    textShadow: "0 6px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  {b.title}
                </Typography>
              )}
              {b.subtitle && (
                <Typography
                  variant="body2"
                  sx={{ mb: 1, textShadow: "0 4px 12px rgba(0,0,0,0.45)" }}
                >
                  {b.subtitle}
                </Typography>
              )}
              {b.ctaText && (
                <Button
                  variant="contained"
                  color="primary"
                  href={b.ctaUrl}
                  sx={{ mt: 1 }}
                >
                  {b.ctaText}
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* arrows */}
      <IconButton
        onClick={() => go(-1)}
        sx={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "background.paper" },
        }}
        aria-label="Previous banner"
      >
        <ChevronLeftIcon />
      </IconButton>

      <IconButton
        onClick={() => go(1)}
        sx={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "background.paper" },
        }}
        aria-label="Next banner"
      >
        <ChevronRightIcon />
      </IconButton>

      {/* indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {banners.map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: i === index ? "primary.main" : "background.paper",
              opacity: i === index ? 0.95 : 0.6,
              cursor: "pointer",
              boxShadow: 2,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BannerSlider;
