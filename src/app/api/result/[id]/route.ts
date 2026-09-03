import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AnalysisRepository } from "@/lib/repository/analysisRepository";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // 1. Extract cookie
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("avoidance_owner_token")?.value;

    if (!ownerToken) {
      return NextResponse.json({ error: "Unauthorized. No owner token found." }, { status: 401 });
    }

    // 2. Fetch using Repository
    // The repository handles the owner validation, hash checking, 
    // and stripping out the premium report if it's locked.
    const result = await AnalysisRepository.getAnalysisForOwner(id, ownerToken);

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

