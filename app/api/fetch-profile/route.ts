import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: "LinkedIn URL is required" }), {
      status: 400,
    });
  }

  const queryParams = new URLSearchParams({
    url,
    fallback_to_cache: "on-error",
    use_cache: "if-present",
    skills: "include",
    personal_email: "include",
    personal_contact_number: "include",
    twitter_profile_id: "include",
    facebook_profile_id: "include",
    github_profile_id: "include",
    extra: "include",
  });

  const response = await fetch(
    `https://nubela.co/proxycurl/api/v2/linkedin?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PROXYCURL_API_KEY || ""}`,
      },
    }
  );

  const data = await response.json();
  console.log("✅ Cleaned Proxycurl API response:", data);

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
