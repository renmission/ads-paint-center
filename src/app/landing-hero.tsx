"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  ChevronRight,
  Phone,
  Star,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { RequestAppointmentDialog } from "@/features/appointments/components/request-appointment-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Clock } from "lucide-react";

type Service = { id: string; name: string; price: string; duration: number };

interface LandingHeroProps {
  services: Service[];
}

function fmt(n: string) {
  return parseFloat(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

const SLIDE_BG_CLASSES = [
  "bg-[url(/images/pexels-n-voitkevich-5641411.webp)]",
  "bg-[url(/images/pexels-ivan-s-5799058.webp)]",
  "bg-[url(/images/pexels-shvetsa-11124948.webp)]",
  "bg-[url(/images/pexels-polina-tankilevitch-5583124.webp)]",
] as const;

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
];

const SLIDES = [
  {
    badge: "Professional Paint Services",
    headline: "Color Your World",
    accent: "with Confidence",
    description:
      "Premium paints, expert advice, and everything you need for your next project. Quality products delivered fast — right to your door.",
    image: "/images/pexels-n-voitkevich-5641411.webp",
    imageAlt: "Professional paint supplies and tools",
  },
  {
    badge: "Trusted Since 2009",
    headline: "Your Trusted Partner",
    accent: "for Premium Paint",
    description:
      "Over 15 years of experience serving homeowners, contractors, and businesses with the best paint products and expert guidance.",
    image: "/images/pexels-ivan-s-5799058.webp",
    imageAlt: "Premium paint products on display",
  },
  {
    badge: "Fast & Reliable",
    headline: "Nationwide",
    accent: "Delivery",
    description:
      "Order from anywhere in the country and receive your paint and supplies quickly. Free delivery on orders over ₱2,000.",
    image: "/images/pexels-shvetsa-11124948.webp",
    imageAlt: "Paint delivery and supplies",
  },
  {
    badge: "Customer Satisfaction",
    headline: "We Paint,",
    accent: "You Smile",
    description:
      "From first brush stroke to final coat, we're here to make every project a success. Your satisfaction is our guarantee.",
    image: "/images/pexels-polina-tankilevitch-5583124.webp",
    imageAlt: "Happy customer with paint project",
  },
];

export function LandingHero({ services }: LandingHeroProps) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setActive(index);
        setAnimating(false);
      }, 300);
    },
    [animating],
  );

  const next = useCallback(() => {
    goTo((active + 1) % SLIDES.length);
  }, [active, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + SLIDES.length) % SLIDES.length);
  }, [active, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const slide = SLIDES[active];

  return (
    <div
      className="h-screen overflow-hidden bg-[#FFF8F3] relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Floating Navbar */}
      <header className="absolute top-5 left-5 right-5 z-50">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 px-5 py-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="font-bold text-slate-900 text-sm whitespace-nowrap">
              ADS Paint Center
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setServicesOpen(true)}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Services
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+1234567890"
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">(+63) 905-728-3389</span>
            </a>

            <Link
              href="/shop"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              aria-label="Go to shop"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </Link>

            <Button
              size="sm"
              className="rounded-xl text-xs px-4"
              onClick={() => setQuoteOpen(true)}
            >
              Get a Quote
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — full viewport split */}
      <div className="flex h-full">
        {/* Left panel */}
        <div className="flex flex-col justify-center w-full lg:w-[55%] px-8 md:px-14 lg:px-20 pt-24 pb-8">
          {/* Slide content with fade transition */}
          <div
            className={cn(
              "transition-all duration-300 motion-reduce:transition-none",
              animating
                ? "opacity-0 translate-y-3"
                : "opacity-100 translate-y-0",
            )}
          >
            <Badge
              variant="secondary"
              className="mb-5 w-fit text-xs uppercase tracking-widest bg-primary/10 text-primary border-0"
            >
              {slide.badge}
            </Badge>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5">
              {slide.headline}{" "}
              <span className="text-primary relative inline-block">
                {slide.accent}
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 300 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6C60 2 120 1 180 3C220 4.5 260 5.5 298 4"
                    stroke="#F97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-md mb-8">
              {slide.description}
            </p>
          </div>

          {/* CTA buttons — static */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Button asChild size="lg" className="rounded-xl gap-2 px-6">
              <Link href="/shop">
                Shop Now <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-6 border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
            >
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>

          {/* Stats bar + dot indicators */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900">
                  500+
                </span>
                <span className="text-xs text-slate-500">
                  Projects completed
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900">
                  4.9
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900">
                  13+
                </span>
                <span className="text-xs text-slate-500">Years experience</span>
              </div>
            </div>

            {/* Carousel dots + arrows */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      "rounded-full transition-all duration-300 cursor-pointer motion-reduce:transition-none",
                      i === active
                        ? "h-2.5 w-8 bg-primary"
                        : "h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400",
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right panel — image */}
        <div className="hidden lg:block lg:w-[45%] relative overflow-hidden">
          {/* Image crossfade via CSS background-image */}
          {SLIDES.map((s, i) => (
            <div
              key={s.image}
              role="img"
              aria-label={s.imageAlt}
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-opacity duration-700 motion-reduce:transition-none",
                SLIDE_BG_CLASSES[i],
                i === active ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Subtle left-edge blend with page bg */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#FFF8F3] to-transparent" />
            </div>
          ))}

          {/* Slide counter badge */}
          <div className="absolute bottom-8 right-8 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-white">
            <span className="text-sm font-bold text-slate-900">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="text-slate-300 text-sm">/</span>
            <span className="text-sm text-slate-400">
              {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Get Quote dialog */}
      <RequestAppointmentDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        services={services}
      />

      {/* Services list dialog */}
      <Dialog open={servicesOpen} onOpenChange={setServicesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Our Services</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Choose a service and get a quote from us.
            </p>
          </DialogHeader>

          {services.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No services available at the moment.
            </p>
          ) : (
            <div className="grid gap-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
              {services.map((s) => (
                <Card key={s.id} className="border-slate-100 shadow-none">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {s.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{s.duration} min</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-semibold text-primary">
                        ₱{fmt(s.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setServicesOpen(false);
                          setQuoteOpen(true);
                        }}
                        className="mt-1 block text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        Book →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
