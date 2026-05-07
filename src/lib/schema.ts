import { z } from "zod";

export const SectionSchema = z.object({
  id: z.string(),
  type: z.enum(["hero", "featureGrid", "testimonial", "cta"]),
  props: z.record(z.string(), z.unknown()),
});

export const PageSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(SectionSchema),
});

export type Section = z.infer<typeof SectionSchema>;
export type Page = z.infer<typeof PageSchema>;
