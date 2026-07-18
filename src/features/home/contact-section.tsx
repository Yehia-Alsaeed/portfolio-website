import { PROFILE } from "@/content/profile";
import { ContactForm } from "@/features/contact/contact-form";

export function ContactSection() {
  return (
    <section aria-labelledby="contact-title" className="pt-14 pb-4 md:pt-16" id="contact">
      <div className="flex items-baseline justify-between gap-4 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
        <h2 id="contact-title">Contact</h2>
        <p className="text-dim">Job - Freelance - Collaboration</p>
      </div>
      <a
        className="hover:text-accent-text my-8 block text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.9] font-black tracking-normal [overflow-wrap:anywhere] font-stretch-[120%] no-underline transition-colors"
        href={`mailto:${PROFILE.email}`}
      >
        yehias3eed11<span className="text-accent-text">@</span>
        <br />
        gmail.com
      </a>
      <ContactForm />
    </section>
  );
}
