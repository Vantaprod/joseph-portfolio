import { revalidatePath } from "next/cache";

/**
 * Invalidate the ENTIRE site cache so any public page
 * immediately reflects new admin content on next visit.
 * Call after any successful admin mutation.
 */
export function revalidatePublic() {
  try {
    // Revalidate everything under the root layout
    revalidatePath("/", "layout");
  } catch (err) {
    console.warn("revalidatePath failed:", err);
  }
}