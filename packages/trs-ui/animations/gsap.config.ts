/**
 * TRS UI - GSAP Animation Configuration
 *
 * Centralized GSAP settings and animation presets.
 * Provides consistent timing, easing, and effects across all components.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Animation Durations (in seconds)
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

/**
 * Easing Functions
 * Custom easing for TRS brand feel
 */
export const easings = {
  // Standard easing
  easeIn: 'power2.in',
  easeOut: 'power2.out',
  easeInOut: 'power2.inOut',

  // Smooth, professional
  smooth: 'power1.out',
  gentle: 'power1.inOut',

  // Bouncy, playful (use sparingly)
  bounce: 'back.out(1.4)',
  elastic: 'elastic.out(1, 0.5)',

  // Precise, mechanical
  linear: 'none',
} as const;

/**
 * Animation Presets
 * Pre-configured animations for common use cases
 */
export const animations = {
  /**
   * Fade Up
   * Element fades in while moving up
   */
  fadeUp: {
    from: {
      opacity: 0,
      y: 30,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: durations.base,
      ease: easings.smooth,
    },
  },

  /**
   * Fade In
   * Simple opacity transition
   */
  fadeIn: {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },

  /**
   * Slide In (from left)
   */
  slideInLeft: {
    from: {
      opacity: 0,
      x: -50,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: durations.base,
      ease: easings.smooth,
    },
  },

  /**
   * Slide In (from right)
   */
  slideInRight: {
    from: {
      opacity: 0,
      x: 50,
    },
    to: {
      opacity: 1,
      x: 0,
      duration: durations.base,
      ease: easings.smooth,
    },
  },

  /**
   * Scale In
   * Element scales up from 0
   */
  scaleIn: {
    from: {
      opacity: 0,
      scale: 0.8,
    },
    to: {
      opacity: 1,
      scale: 1,
      duration: durations.base,
      ease: easings.bounce,
    },
  },

  /**
   * Card Hover
   * Subtle lift and shadow on hover
   */
  cardHover: {
    to: {
      y: -4,
      boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.2)',
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },

  /**
   * Metric Count Up
   * Animated number counter
   */
  countUp: {
    to: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
} as const;

/**
 * Stagger Configurations
 * For animating lists and grids
 */
export const staggers = {
  // Fast sequential reveal
  fast: {
    amount: 0.1,
    from: 'start',
  },
  // Standard sequential reveal
  base: {
    amount: 0.3,
    from: 'start',
  },
  // Slow, dramatic reveal
  slow: {
    amount: 0.6,
    from: 'start',
  },
  // Center outward
  center: {
    amount: 0.3,
    from: 'center',
  },
  // Edges inward
  edges: {
    amount: 0.3,
    from: 'edges',
  },
} as const;

/**
 * ScrollTrigger Defaults
 */
export const scrollDefaults = {
  // Standard scroll trigger
  base: {
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
  },
  // Once (don't reverse)
  once: {
    start: 'top 80%',
    toggleActions: 'play none none none',
  },
  // Scrub (sync with scroll)
  scrub: {
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 1,
  },
  // Pin (sticky)
  pin: {
    start: 'top top',
    end: 'bottom bottom',
    pin: true,
    scrub: true,
  },
} as const;

/**
 * Initialize GSAP with TRS defaults
 */
export function initGSAP() {
  if (typeof window === 'undefined') return;

  // Set global defaults
  gsap.defaults({
    ease: easings.smooth,
    duration: durations.base,
  });

  // ScrollTrigger defaults
  ScrollTrigger.defaults({
    toggleActions: 'play none none reverse',
    markers: process.env.NODE_ENV === 'development' ? false : false,
  });
}

/**
 * Cleanup GSAP instances
 * Call on unmount or route change
 */
export function cleanupGSAP() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.killTweensOf('*');
}

/**
 * Create a scroll-triggered animation
 */
export function createScrollAnimation(
  element: string | Element,
  animation: keyof typeof animations,
  options?: {
    trigger?: string | Element;
    stagger?: keyof typeof staggers;
    scroll?: keyof typeof scrollDefaults;
  }
) {
  const preset = animations[animation] as any;
  const scrollConfig = options?.scroll ? scrollDefaults[options.scroll] : scrollDefaults.base;
  const staggerConfig = options?.stagger ? staggers[options.stagger] : undefined;

  // Check if preset has 'from' property (for fromTo animations)
  if (preset.from) {
    return gsap.fromTo(
      element,
      preset.from,
      {
        ...preset.to,
        stagger: staggerConfig,
        scrollTrigger: {
          trigger: options?.trigger || element,
          ...scrollConfig,
        },
      }
    );
  } else {
    // For animations without 'from' (like hover effects), use .to()
    return gsap.to(element, {
      ...preset.to,
      stagger: staggerConfig,
      scrollTrigger: {
        trigger: options?.trigger || element,
        ...scrollConfig,
      },
    });
  }
}

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initGSAP();
}

export { gsap, ScrollTrigger };
export default gsap;
