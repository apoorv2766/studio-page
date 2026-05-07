"use server";

import { Page, PageSchema } from "@/lib/schema";
import { determineSemVerBump, bumpVersion } from "@/lib/semver";
import { supabase } from "@/lib/supabase";

export async function publishDraft(draft: Page, role: string) {
  // 1. RBAC Check
  if (role !== "publisher") {
    return {
      success: false,
      error: "Unauthorized: Only publishers can publish releases.",
    };
  }

  // 2. Schema Validation
  const validatedPage = PageSchema.parse(draft);

  let latestVersion = "1.0.0";
  let bumpType: "patch" | "minor" | "major" | "none" = "major";
  let changelogSummary = "Initial release";
  let isFirstPublish = true;

  // 3. Fetch latest release from Supabase
  const { data: releases, error } = await supabase
    .from("releases")
    .select("*")
    .eq("slug", validatedPage.slug)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (releases && releases.length > 0) {
    isFirstPublish = false;

    const latestRelease = releases[0];

    latestVersion = latestRelease.version;

    const oldData = latestRelease.data as Page;

    const diffResult = determineSemVerBump(oldData, validatedPage);

    bumpType = diffResult.bump;
    changelogSummary = diffResult.summary;
  }

  if (bumpType === "none") {
    return {
      success: false,
      error: "No changes detected. Idempotent publish.",
    };
  }

  const newVersion = isFirstPublish
    ? "1.0.0"
    : bumpVersion(latestVersion, bumpType);

  // 4. Save release in Supabase
  const { error: insertError } = await supabase.from("releases").insert([
    {
      slug: validatedPage.slug,
      version: newVersion,
      data: validatedPage,
    },
  ]);

  if (insertError) {
    return {
      success: false,
      error: insertError.message,
    };
  }

  return {
    success: true,
    version: newVersion,
    bumpType,
    summary: changelogSummary,
  };
}
