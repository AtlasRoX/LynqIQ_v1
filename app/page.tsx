import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// The root page is now an async component to handle awaiting cookies.
export default async function Home() {
  // ✅ 1. Await the cookies() Promise to get the actual store.
  const cookieStore = cookies();

  // ✅ 2. Pass the resolved store to the synchronous createClient function.
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/auth/login");
}
