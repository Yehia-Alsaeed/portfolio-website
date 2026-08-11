import { describe, expect, it } from "vitest";

import { CASE_STUDIES } from "@/content/projects/case-studies";
import {
  ARCHITECTURE_PROOFS,
  getArchitectureProof,
  validateArchitectureProof,
} from "@/content/projects/proof";

describe("Phase 5 architecture proof data", () => {
  it("has exactly five proofs matching the five case-study slugs", () => {
    expect(ARCHITECTURE_PROOFS).toHaveLength(5);
    const proofSlugs = new Set(ARCHITECTURE_PROOFS.map((proof) => proof.slug));
    const caseStudySlugs = new Set(CASE_STUDIES.map((study) => study.slug));
    expect(proofSlugs).toEqual(caseStudySlugs);
  });

  it("passes structural validation for every proof", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      expect(validateArchitectureProof(proof)).toEqual([]);
    }
  });

  it("has unique node ids per proof", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      expect(new Set(proof.nodes.map((node) => node.id)).size).toBe(proof.nodes.length);
    }
  });

  it("has a reading order containing every node exactly once", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      const nodeIds = [...proof.nodes.map((node) => node.id)].sort();
      const orderIds = [...proof.readingOrder].sort();
      expect(orderIds, proof.slug).toEqual(nodeIds);
    }
  });

  it("has a concise, project-specific system flow for every proof", () => {
    const serializedFlows = new Set<string>();

    for (const proof of ARCHITECTURE_PROOFS) {
      const flow = (proof as { flow?: readonly string[] }).flow;
      expect(flow, `${proof.slug} flow`).toBeDefined();
      expect(flow?.length, `${proof.slug} flow stage count`).toBeGreaterThanOrEqual(4);
      expect(flow?.length, `${proof.slug} flow stage count`).toBeLessThanOrEqual(5);
      expect(
        flow?.every((stage) => stage.trim().length > 0),
        `${proof.slug} flow text`,
      ).toBe(true);
      serializedFlows.add(flow?.join(" -> ") ?? "");
    }

    expect(serializedFlows.size).toBe(ARCHITECTURE_PROOFS.length);
  });

  it("has non-empty text for every node field", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      for (const node of proof.nodes) {
        for (const field of ["label", "technology", "responsibility", "input", "output"] as const) {
          expect(node[field].length, `${proof.slug}.${node.id}.${field}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("looks up a proof by slug and returns undefined for an unknown slug", () => {
    expect(getArchitectureProof("skillbridge-ai-interviewer")?.slug).toBe(
      "skillbridge-ai-interviewer",
    );
    expect(getArchitectureProof("does-not-exist")).toBeUndefined();
  });

  it("covers the approved node count and technology facts for each flagship", () => {
    const bySlug = new Map<string, (typeof ARCHITECTURE_PROOFS)[number]>(
      ARCHITECTURE_PROOFS.map((proof) => [proof.slug, proof]),
    );
    const technologiesFor = (slug: string) =>
      bySlug
        .get(slug)
        ?.nodes.map((node) => node.technology)
        .join(" | ") ?? "";

    const skillbridge = bySlug.get("skillbridge-ai-interviewer");
    expect(skillbridge?.nodes).toHaveLength(6);
    expect(technologiesFor("skillbridge-ai-interviewer")).toMatch(/React/);
    expect(technologiesFor("skillbridge-ai-interviewer")).toMatch(/FastAPI/);
    expect(technologiesFor("skillbridge-ai-interviewer")).toMatch(/Whisper/);

    const llama = bySlug.get("llama-qlora-education-qa");
    expect(llama?.nodes).toHaveLength(5);
    expect(technologiesFor("llama-qlora-education-qa")).toMatch(/QLoRA/);

    const studyPlanner = bySlug.get("ai-study-planner-agents");
    expect(studyPlanner?.nodes).toHaveLength(5);
    expect(studyPlanner?.nodes.map((node) => node.label).join(" | ")).toMatch(/Profiler/);
    expect(studyPlanner?.nodes.map((node) => node.label).join(" | ")).toMatch(/Critic/);
    expect(studyPlanner?.nodes.map((node) => node.label).join(" | ")).toMatch(/Optimizer/);

    const oxford = bySlug.get("oxford-pet-binary-segmentation");
    expect(oxford?.nodes).toHaveLength(6);
    expect(oxford?.nodes.map((node) => node.label).join(" | ")).toMatch(/FCN/);
    expect(oxford?.nodes.map((node) => node.label).join(" | ")).toMatch(/SegNet/);
    expect(oxford?.nodes.map((node) => node.label).join(" | ")).toMatch(/HRNet/);

    const prestige = bySlug.get("prestige-motors-showroom");
    expect(prestige?.nodes).toHaveLength(6);
    expect(technologiesFor("prestige-motors-showroom")).toMatch(/MongoDB/);
    expect(technologiesFor("prestige-motors-showroom")).toMatch(/Cloudinary/);
    expect(technologiesFor("prestige-motors-showroom")).toMatch(/Vercel/);
  });

  it("never claims metrics or timing beyond the approved case-study results", () => {
    const serialized = JSON.stringify(ARCHITECTURE_PROOFS);
    expect(serialized).not.toMatch(/\d+ms\b/);
    expect(serialized).not.toMatch(/response time/i);
  });
});
