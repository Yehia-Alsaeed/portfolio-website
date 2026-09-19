import { RuledSection } from "@/components/ui/ruled-section";

export type ProjectIncludesProps = { items: readonly string[] };

export function ProjectIncludes({ items }: ProjectIncludesProps) {
  return (
    <RuledSection title="Every project includes">
      <ul className="border-line grid grid-cols-1 border-t border-l min-[560px]:grid-cols-2 min-[1024px]:grid-cols-3">
        {items.map((item, position) => (
          <li className="border-line border-r border-b p-6" key={item}>
            <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.14em] uppercase">
              {String(position + 1).padStart(2, "0")}
            </p>
            <p className="text-dim mt-2 text-sm leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </RuledSection>
  );
}
