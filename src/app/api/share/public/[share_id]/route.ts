import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: { share_id: string } }) {
  try {
    const { share_id } = params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return NextResponse.json({
        primary_type: "거부-회피형 (Dismissive-Avoidant)",
        secondary_type: "안정형 (Secure)",
        attachment_fitness: {
          secure: 40, preoccupied: 10, dismissing: 85, fearful: 20
        },
        attachment_dimensions: {
          anxiety: 10, avoidance: 90
        }
      });
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("primary_type, secondary_type, secure_fit, preoccupied_fit, dismissive_fit, fearful_fit, anxiety_score, avoidance_score")
      .eq("share_id", share_id)
      .eq("share_enabled", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Shared analysis not found or not public" }, { status: 404 });
    }

    // Public Projection (Only Safe Data)
    const publicData = {
      primary_type: data.primary_type,
      secondary_type: data.secondary_type,
      attachment_fitness: {
        secure: data.secure_fit,
        preoccupied: data.preoccupied_fit,
        dismissing: data.dismissive_fit,
        fearful: data.fearful_fit
      },
      attachment_dimensions: {
        anxiety: data.anxiety_score,
        avoidance: data.avoidance_score
      }
    };

    return NextResponse.json(publicData);

  } catch (error) {
    console.error("Public Share GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
