import { RuledSection } from "@/components/ui/ruled-section";
import type { Testimonial } from "@/content/services";

export type TestimonialsProps = { items: readonly Testimonial[] };

export function Testimonials({ items }: TestimonialsProps) {
  if (items.length === 0) return null;

  return (
    <RuledSection title="What clients say">
      <ul className="grid grid-cols-1 gap-6 p-0 min-[700px]:grid-cols-2">
        {items.map((item) => (
          <li className="list-none" key={item.attribution}>
            <blockquote className="text-dim text-base leading-relaxed">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <p className="mt-3 font-mono text-xs tracking-[0.1em] uppercase">{item.attribution}</p>
          </li>
        ))}
      </ul>
    </RuledSection>
  );
}
