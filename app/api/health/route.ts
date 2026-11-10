export const dynamic = "force-dynamic";

// Liveness probe for load balancers / uptime monitors. Deliberately does not
// touch Supabase so a database outage never takes the app out of rotation.
export function GET() {
  return Response.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
