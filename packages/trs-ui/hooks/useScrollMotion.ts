'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animations, staggers, scrollDefaults } from '../animations/gsap.config';

// Register plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Animation Type
 */
export type AnimationType = keyof typeof animations;
export type StaggerType = keyof typeof staggers;
export type ScrollType = keyof typeof scrollDefaults;

/**
 * Scroll Motion Hook Options
 */
export interface UseScrollMotionOptions {
  /** Animation preset to use */
  animation?: AnimationType;
  /** Stagger configuration for multiple elements */
  stagger?: StaggerType;
  /** Scroll trigger configuration */
  scroll?: ScrollType;
  /** Delay before animation starts (in seconds) */
  delay?: number;
  /** Custom trigger element (defaults to animated element) */
  trigger?: string | Element;
  /** Whether to cleanup on unmount (default: true) */
  cleanup?: boolean;
  /** Callback when animation starts */
  onStart?: () => void;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * useScrollMotion Hook
 *
 * Automatically animates an element when it scrolls into view.
 * Uses GSAP + ScrollTrigger for smooth, performant animations.
 *
 * @example
 * ```tsx
 * function Card() {
 *   const ref = useScrollMotion({ animation: 'fadeUp' });
 *
 *   return <div ref={ref}>Content</div>;
 * }
 * ```
 *
 * @example With stagger
 * ```tsx
 * function CardGrid() {
 *   const ref = useScrollMotion({
 *     animation: 'fadeUp',
 *     stagger: 'base'
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       <div className="card">1</div>
 *       <div className="card">2</div>
 *       <div className="card">3</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollMotion<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollMotionOptions = {}
): RefObject<T> {
  const elementRef = useRef<T>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      animation = 'fadeUp',
      stagger: staggerKey,
      scroll = 'base',
      delay = 0,
      trigger,
      cleanup = true,
      onStart,
      onComplete,
    } = options;

    // Get animation preset
    const preset = animations[animation];
    if (!preset) {
      console.warn(`Animation preset "${animation}" not found`);
      return;
    }

    // Get scroll configuration
    const scrollConfig = scrollDefaults[scroll];

    // Get stagger configuration
    const staggerConfig = staggerKey ? staggers[staggerKey] : undefined;

    // Determine target elements
    const targets = staggerConfig ? element.children : element;

    // Create animation
    animationRef.current = gsap.fromTo(
      targets,
      preset.from,
      {
        ...preset.to,
        delay,
        stagger: staggerConfig,
        scrollTrigger: {
          trigger: trigger || element,
          ...scrollConfig,
          onEnter: onStart,
          onComplete,
        },
      }
    );

    // Cleanup
    return () => {
      if (cleanup && animationRef.current) {
        animationRef.current.kill();
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === element) {
            st.kill();
          }
        });
      }
    };
  }, [options]);

  return elementRef;
}

/**
 * useStaggerChildren Hook
 *
 * Animates child elements with a stagger effect.
 * Perfect for lists, grids, and card layouts.
 *
 * @example
 * ```tsx
 * function MetricGrid() {
 *   const ref = useStaggerChildren();
 *
 *   return (
 *     <div ref={ref}>
 *       {metrics.map(m => <MetricCard key={m.id} {...m} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStaggerChildren<T extends HTMLElement = HTMLDivElement>(
  animation: AnimationType = 'fadeUp',
  stagger: StaggerType = 'base'
): RefObject<T> {
  return useScrollMotion<T>({
    animation,
    stagger,
    scroll: 'once',
  });
}

/**
 * useFadeIn Hook
 *
 * Simple fade-in animation on scroll.
 *
 * @example
 * ```tsx
 * function Section() {
 *   const ref = useFadeIn();
 *   return <section ref={ref}>Content</section>;
 * }
 * ```
 */
export function useFadeIn<T extends HTMLElement = HTMLDivElement>(
  delay = 0
): RefObject<T> {
  return useScrollMotion<T>({
    animation: 'fadeIn',
    scroll: 'once',
    delay,
  });
}

/**
 * useSlideIn Hook
 *
 * Slide-in animation from left or right.
 *
 * @example
 * ```tsx
 * function Sidebar() {
 *   const ref = useSlideIn('left');
 *   return <aside ref={ref}>Nav</aside>;
 * }
 * ```
 */
export function useSlideIn<T extends HTMLElement = HTMLDivElement>(
  direction: 'left' | 'right' = 'left',
  delay = 0
): RefObject<T> {
  return useScrollMotion<T>({
    animation: direction === 'left' ? 'slideInLeft' : 'slideInRight',
    scroll: 'once',
    delay,
  });
}

/**
 * useCountUp Hook
 *
 * Animates a number from 0 to target value.
 *
 * @example
 * ```tsx
 * function MetricValue() {
 *   const [count, ref] = useCountUp(40024);
 *   return <div ref={ref}>${count.toLocaleString()}</div>;
 * }
 * ```
 */
export function useCountUp(
  targetValue: number,
  duration = 1
): [number, RefObject<HTMLDivElement>] {
  const elementRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const obj = { value: 0 };
    const tween = gsap.to(obj, {
      value: targetValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setCount(Math.round(obj.value));
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
    };
  }, [targetValue, duration]);

  return [count, elementRef];
}

export default useScrollMotion;
