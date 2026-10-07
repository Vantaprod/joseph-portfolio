import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function requireAdmin() {
  // Try NextAuth session first (works in server components and route handlers on some setups)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) return session;
  } catch (err) {
    console.warn("getServerSession failed, falling back to JWT decode:", err);
  }

  // Fallback: decode the JWT cookie directly
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("NEXTAUTH_SECRET is not set");
      return null;
    }

    const cookieStore = await cookies();
    const raw =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    if (!raw) {
      console.warn("No session cookie found");
      return null;
    }

    const decoded = await decode({ token: raw, secret });
    if (!decoded) {
      console.warn("JWT decode returned null — cookie signed with different secret?");
      return null;
    }

    return { user: decoded } as { user: { id?: string; email?: string; name?: string } };
  } catch (err) {
    console.error("requireAdmin error:", err);
    return null;
  }
}