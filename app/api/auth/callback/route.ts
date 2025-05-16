import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type") || "";
  
  // Create a supabase client that works in route handlers
  const supabase = createRouteHandlerClient<Database>({ cookies });

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect differently based on the authentication flow type
    switch (type) {
      case "signup":
        // Redirect new users to a welcome page or dashboard
        return NextResponse.redirect(`${requestUrl.origin}?success=account_created`);
      
      case "recovery":
        // Redirect password recovery users to reset their password
        return NextResponse.redirect(`${requestUrl.origin}/reset-password?success=email_verified`);
      
      default:
        // Check if user has a role and redirect accordingly
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role || "patient";
        
        // Redirect to the appropriate dashboard based on role
        switch (role) {
          case "admin":
            return NextResponse.redirect(`${requestUrl.origin}/admin`);
          case "doctor":
            return NextResponse.redirect(`${requestUrl.origin}/doctor`);
          case "patient":
          default:
            return NextResponse.redirect(`${requestUrl.origin}/patient`);
        }
    }
  }

  // If something goes wrong, redirect to login with an error
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=${encodeURIComponent("Something went wrong with authentication.")}`
  );
}