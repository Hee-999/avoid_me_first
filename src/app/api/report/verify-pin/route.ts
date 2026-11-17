import { NextResponse } from "next/server";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";
import { isValidKoreanPhone, normalizePhoneNumber } from "@/lib/solapi/notify";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const phone = typeof body?.phone === "string" ? normalizePhoneNumber(body.phone) : "";
    const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "숫자 4자리 열람 PIN 번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const pinHash = hashToken(pin);
    let matchedRow: { id: string; status: any } | null = null;

    if (token) {
      const tokenHash = hashToken(token);
      const { data, error } = await supabaseAdmin
        .from("analyses")
        .select("id, status, expires_at")
        .eq("report_access_token_hash", tokenHash)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "리포트를 찾을 수 없습니다." }, { status: 404 });
      }
      if (data.expires_at && new Date() > new Date(data.expires_at)) {
        return NextResponse.json({ error: "열람 기간이 만료된 리포트입니다." }, { status: 410 });
      }
      if (data.status?.access?.pin_hash !== pinHash) {
        return NextResponse.json({ error: "PIN 번호가 일치하지 않습니다. 문자 메시지를 다시 확인해주세요." }, { status: 401 });
      }
      matchedRow = data;
    } else if (phone) {
      if (!isValidKoreanPhone(phone)) {
        return NextResponse.json({ error: "올바른 휴대폰 번호를 입력해주세요." }, { status: 400 });
      }

      const { data: rows, error } = await supabaseAdmin
        .from("analyses")
        .select("id, status, expires_at")
        .eq("premium_unlocked", true)
        .eq("status->access->>buyer_tel", phone)
        .order("purchased_at", { ascending: false })
        .limit(10);

      if (error || !rows || rows.length === 0) {
        return NextResponse.json(
          { error: "해당 휴대폰 번호로 결제된 리포트를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      const found = rows.find((r) => r.status?.access?.pin_hash === pinHash);
      if (!found) {
        return NextResponse.json(
          { error: "PIN 번호가 일치하지 않습니다. 문자에 안내된 4자리 번호를 확인해주세요." },
          { status: 401 }
        );
      }
      if (found.expires_at && new Date() > new Date(found.expires_at)) {
        return NextResponse.json({ error: "열람 기간이 만료된 리포트입니다." }, { status: 410 });
      }
      matchedRow = found;
    } else {
      return NextResponse.json(
        { error: "조회할 휴대폰 번호 또는 리포트 토큰이 필요합니다." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      verified: true,
      analysisId: matchedRow.id,
    });

    response.cookies.set(`avoidance_pin_verified_${matchedRow.id}`, pinHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify PIN POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
