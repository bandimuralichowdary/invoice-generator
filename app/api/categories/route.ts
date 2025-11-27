import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin ops
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, name } = body;

    if (!action) return NextResponse.json({ error: "No action specified" }, { status: 400 });

    if (action === "add") {
      if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      const { data, error } = await supabase.from("categories").insert([{ name }]);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    if (action === "edit") {
      if (!id || !name) return NextResponse.json({ error: "ID and Name required" }, { status: 400 });
      const { data, error } = await supabase.from("categories").update({ name }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
      const { data, error } = await supabase.from("categories").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
