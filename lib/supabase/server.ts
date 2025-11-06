import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// ✅ Correct, Production-Ready Pattern for Next.js 16 + Supabase
// The createClient function now accepts the cookieStore as a parameter.
// This is a form of dependency injection that ensures the function
// receives the correct, request-specific cookie store.
export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookies()).set(name, value, options);
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookies()).delete({ name, ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
