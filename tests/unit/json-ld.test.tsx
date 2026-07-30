import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLd } from "@/lib/seo/json-ld";

describe("JsonLd", () => {
  it("renders a script tag with the correct type", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
  });

  it("serializes the given data as valid JSON", () => {
    const data = { "@type": "Thing", name: "Example" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(JSON.parse(script?.innerHTML ?? "")).toEqual(data);
  });

  it("escapes '<' so an embedded closing script tag cannot break out", () => {
    const data = { evil: "</script><script>alert(1)</script>" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script?.innerHTML).not.toContain("<");
    expect(JSON.parse(script?.innerHTML ?? "")).toEqual(data);
  });
});
