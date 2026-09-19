import { RuledSection } from "@/components/ui/ruled-section";
import type { ServiceFaqItem } from "@/content/services";

export type FaqSectionProps = { items: readonly ServiceFaqItem[] };

/**
 * Every answer stays open on purpose: no accordion, no <details>. Clients skim
 * for the one question they came with, and hidden answers are harder to find
 * for both them and search engines.
 */
export function FaqSection({ items }: FaqSectionProps) {
  return (
    <RuledSection title="Questions">
      <ul className="list-none p-0">
        {items.map((item) => (
          <li className="border-line border-t py-6" key={item.question}>
            <h3 className="text-lg font-bold">{item.question}</h3>
            <p className="text-dim mt-2 max-w-[60ch] text-sm leading-relaxed">{item.answer}</p>
          </li>
        ))}
      </ul>
    </RuledSection>
  );
}
