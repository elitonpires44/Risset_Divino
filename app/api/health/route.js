import { configured } from "../../../lib/supabase";
export function GET() {
  return Response.json({
    application: "RISSET DIVINO",
    status: "ok",
    supabaseConfigured: configured(),
  });
}
