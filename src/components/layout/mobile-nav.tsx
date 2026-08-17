"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { archivoWide } from "@/app/fonts";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { PROFILE } from "@/content/profile";
import { TrackedAnchor } from "@/features/analytics/tracked-anchor";
import { CommandPalette } from "@/features/command-palette/command-palette";
import { ModeSwitcher } from "@/features/display-mode/mode-switcher";

const MOBILE_BREAKPOINT = "(min-width: 768px)";

// The icon finishes its morph before the panel starts drifting away, so the
// bars are fully redrawn and readable while the panel is still solid. Both are
// kept in sync with the mobile-nav-panel-out keyframes in globals.css.
const ICON_MORPH_MS = 260;
const PANEL_EXIT_MS = 420;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// `href` is taken from Link rather than typed as `string` so these links stay
// checked against typedRoutes, the same as the ones in the desktop header.
type MobileNavLink = {
  href: React.ComponentProps<typeof Link>["href"];
  label: string;
};

// PageTransition listens for clicks on `document` in the capture phase and, for
// any cross-route link, calls preventDefault + stopPropagation so it can run
// its own wipe and push the route 420ms later. The event never reaches React,
// so the `onClick` handlers below never fire for those links and the panel
// would sit open over the new page. Keying on the pathname closes it by
// remount instead, which does not care who handled the click.
//
// The onClick handlers still earn their place: same-path and hash links (the
// Contact link, or Home while already home) are let through by PageTransition
// untouched and never change the pathname, so remounting alone would miss them.
export function MobileNav({ links }: { links: readonly MobileNavLink[] }) {
  const pathname = usePathname();
  return <MobileNavMenu key={pathname} links={links} />;
}

function MobileNavMenu({ links }: { links: readonly MobileNavLink[] }) {
  const [open, setOpen] = React.useState(false);
  const [morphed, setMorphed] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const closingRef = React.useRef(false);
  const exitTimer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(exitTimer.current), []);

  // The trigger sits in the header and the panel paints over it, so the bars
  // the user watches morphing are the panel's copy. Mounting it as bars and
  // flipping a frame later gives it a state to transition *from* - rendering it
  // already-open would snap straight to the X. setState runs inside the frame
  // callback rather than synchronously in the effect body.
  React.useEffect(() => {
    if (!open) {
      return;
    }
    const frame = requestAnimationFrame(() => setMorphed(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const setOpenState = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setMorphed(false);
      setClosing(false);
      closingRef.current = false;
      window.clearTimeout(exitTimer.current);
    }
  }, []);

  // Closing used to snap: the panel unmounted on the first click, so the X
  // never animated back. Reversing the icon and letting the panel drift out
  // before unmounting makes closing mirror opening. Reduced motion skips
  // straight to the unmount rather than sitting through a delay it cannot see.
  const closeWithExit = React.useCallback(() => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;
    setClosing(true);
    setMorphed(false);
    exitTimer.current = window.setTimeout(
      () => setOpenState(false),
      prefersReducedMotion() ? 0 : PANEL_EXIT_MS,
    );
  }, [setOpenState]);

  // The trigger is `md:hidden`, so the panel can only ever be opened below
  // 768px - but a rotate or a resize while it is open would otherwise strand
  // it on top of the desktop nav.
  React.useEffect(() => {
    // Optional call because jsdom does not implement matchMedia, matching how
    // client-work-media.tsx guards it.
    const query = window.matchMedia?.(MOBILE_BREAKPOINT);
    if (!query) {
      return;
    }
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpenState(false);
      }
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [setOpenState]);

  return (
    <DialogPrimitive.Root onOpenChange={setOpenState} open={open}>
      <DialogPrimitive.Trigger
        aria-label="Open menu"
        className="border-line text-ink inline-flex size-11 cursor-pointer items-center justify-center border md:hidden"
      >
        <MenuToggleIcon
          aria-hidden="true"
          className="size-5"
          duration={ICON_MORPH_MS}
          open={false}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* Kept transparent and present purely for its scroll lock: Radix
            mounts that on the Overlay rather than the Content, so dropping it
            leaves the page behind free to scroll under the open menu. Being
            transparent is what lets the page show through as the panel above
            fades out. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50" />
        <DialogPrimitive.Content
          className="mobile-nav-panel bg-paper text-ink fixed inset-0 z-50 flex flex-col overflow-y-auto"
          data-closing={closing ? "true" : "false"}
          onEscapeKeyDown={(event) => {
            // Take Escape over from Radix so it plays the same exit as the
            // close button instead of tearing the panel down instantly.
            event.preventDefault();
            closeWithExit();
          }}
        >
          <DialogPrimitive.Title className="sr-only">Site menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Primary navigation links.
          </DialogPrimitive.Description>

          {/* Mirrors the site header's geometry exactly - same frame, padding
              and rule, and the same command-palette-then-toggle pairing - so
              the close button lands on the trigger it replaces and the
              hamburger appears to morph in place. */}
          <div className="site-frame border-line flex items-center justify-between gap-x-4 border-b-2 py-2.5">
            <Link
              aria-label="Yehia Alsaeed home"
              className={`${archivoWide.className} inline-flex min-h-11 items-center text-[1.625rem] font-black tracking-normal font-stretch-[125%] no-underline`}
              href="/"
              onClick={() => setOpenState(false)}
            >
              YA<span className="text-accent-text">.</span>
            </Link>
            <div className="flex items-center gap-x-4">
              {/* Its own instance, because the header's is sealed off behind
                  the modal. The Ctrl+K listener is left to the header's copy so
                  the two cannot both open on one keypress. */}
              <CommandPalette withShortcut={false} />
              <button
                aria-label="Close menu"
                className="border-line text-ink inline-flex size-11 cursor-pointer items-center justify-center border"
                onClick={closeWithExit}
                type="button"
              >
                <MenuToggleIcon
                  aria-hidden="true"
                  className="size-5"
                  duration={ICON_MORPH_MS}
                  open={morphed}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </button>
            </div>
          </div>

          <nav aria-label="Primary" className="site-frame flex-1 py-6">
            <ul className="m-0 flex list-none flex-col p-0">
              {links.map((link, index) => (
                <li
                  className="mobile-nav-item border-line border-b"
                  key={link.label}
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <Link
                    className={`${archivoWide.className} text-ink block py-4 text-[clamp(2.25rem,11vw,3.25rem)] leading-[1.05] font-black tracking-normal uppercase font-stretch-[125%] no-underline`}
                    href={link.href}
                    onClick={() => setOpenState(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Outside the nav landmark on purpose: the display control and the
              profile links are not primary navigation, and folding them in
              would muddy that landmark for screen readers. */}
          <div className="site-frame border-line border-t-2 pt-4 pb-8 text-center font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
            {/* Below 768px this is the only display switcher on the site - the
                hero's copy is hidden at this width (monogram-hero.tsx), so the
                two never render at once. It deliberately does not close the
                panel: the point is to see the mode change. */}
            <p className="text-dim mb-1">Display</p>
            <div className="flex justify-center">
              <ModeSwitcher />
            </div>
            <ul className="mt-3 flex list-none flex-wrap items-center justify-center gap-x-5 p-0">
              <li>
                <TrackedAnchor
                  className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
                  href={PROFILE.githubUrl}
                  onClick={() => setOpenState(false)}
                  rel="noopener noreferrer"
                  target="_blank"
                  tracking={{ type: "outbound_click", destination: "github-profile" }}
                >
                  GitHub
                </TrackedAnchor>
              </li>
              <li>
                <TrackedAnchor
                  className="text-dim hover:text-ink inline-flex min-h-11 items-center no-underline transition-colors"
                  href={PROFILE.linkedinUrl}
                  onClick={() => setOpenState(false)}
                  rel="noopener noreferrer"
                  target="_blank"
                  tracking={{ type: "outbound_click", destination: "linkedin" }}
                >
                  LinkedIn
                </TrackedAnchor>
              </li>
            </ul>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
