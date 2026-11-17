import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AnalysisRepository } from "@/lib/repository/analysisRepository";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. Extract cookies (owner token OR PIN-verified session)
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("avoidance_owner_token")?.value;
    const pinVerifiedHash = cookieStore.get(`avoidance_pin_verified_${id}`)?.value;

    if (!ownerToken && !pinVerifiedHash) {
      return NextResponse.json({ error: "Unauthorized. No owner token found." }, { status: 401 });
    }

    // 2. Fetch using Repository
    const result = await AnalysisRepository.getAnalysisForOwner(id, ownerToken, pinVerifiedHash);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Result GET Error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized. You are not the owner of this analysis." }, { status: 403 });
    }
    if (error.message === "Analysis not found") {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
