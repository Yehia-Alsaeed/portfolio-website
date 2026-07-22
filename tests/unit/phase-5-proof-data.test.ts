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

  it("has unique node and edge ids per proof", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      expect(new Set(proof.nodes.map((node) => node.id)).size).toBe(proof.nodes.length);
      expect(new Set(proof.edges.map((edge) => edge.id)).size).toBe(proof.edges.length);
    }
  });

  it("only references existing nodes from edges", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      const ids = new Set(proof.nodes.map((node) => node.id));
      for (const edge of proof.edges) {
        expect(ids.has(edge.source), `${proof.slug}: ${edge.id} source`).toBe(true);
        expect(ids.has(edge.target), `${proof.slug}: ${edge.id} target`).toBe(true);
      }
    }
  });

  it("has a reading order containing every node exactly once", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      const nodeIds = [...proof.nodes.map((node) => node.id)].sort();
      const orderIds = [...proof.readingOrder].sort();
      expect(orderIds, proof.slug).toEqual(nodeIds);
    }
  });

  it("has non-empty text for every node field and every proof title", () => {
    for (const proof of ARCHITECTURE_PROOFS) {
      expect(proof.title.length, proof.slug).toBeGreaterThan(0);
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
