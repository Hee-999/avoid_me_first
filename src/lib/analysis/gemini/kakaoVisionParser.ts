import { callGeminiVision, GeminiInlineData } from "./geminiClient";
import { PreprocessedConversation, ProcessedMessage, ConversationParticipant, ConversationStats } from "../interfaces";

export interface VisionParseResult {
  targetSpeakerName: string;
  userSpeakerName: string;
  messages: Array<{
    speaker: "target" | "user";
    text: string;
    time?: string;
    date?: string;
  }>;
}

const KAKAO_VISION_PROMPT = `
당신은 카카오톡 대화 캡처 이미지를 정밀 분석하는 전문 비전 AI입니다.
제공된 카카오톡 대화 캡처 이미지들을 순서대로 확인하고, 두 사람의 대화 내용을 시간순으로 정확하게 추출하여 지정된 JSON 형식으로만 반환하세요.

[카카오톡 UI 판독 규칙]
0. ★ 최우선 순서 규칙 (상단->하단 Y축 수직 스크롤 순서):
   - 카카오톡은 시간 표기가 분(Minute) 단위까지만 표기되므로, 같은 시간(예: 오전 7:41)에 오간 여러 개의 말풍선은 반드시 화면 위(Top)에서 아래(Bottom)로 내려오는 물리적인 수직 위치 순서대로 엄격히 배치하세요.
   - 왼쪽(상대방)이든 오른쪽(나)이든 관계없이, 화면 위쪽에 위치한 말풍선이 먼저입니다.
   - 특정 화자의 말풍선끼리 임의로 묶거나 순서를 바꾸지 말고, 화면을 위에서 아래로 스크롤하며 읽듯이 두 사람의 핑퐁 대화 순서를 100% 있는 그대로 유지하세요.
1. 화자 구분 (수평 좌/우 정렬 위치가 절대 기준):
   - 우측(Right) 말풍선 = "user" (나 / 본인) : 프로필 사진이 없으며 화면 우측에 정렬된 말풍선
   - 좌측(Left) 말풍선 = "target" (상대방 / 분석 대상) : 프로필 사진 및 이름이 표시되며 화면 좌측에 정렬된 말풍선
   - ★ 중요 (테마 무관 절대 규칙): 카카오톡 테마(다크모드, 핑크테마, 커스텀 테마 등)에 따라 말풍선 색상(노란색, 흰색, 검은색, 분홍색 등)은 사용자마다 완전히 달라질 수 있습니다. 색상에 현혹되지 말고, 오직 "화면 좌측(상대방) vs 우측(나)" 물리적 수평 위치로만 화자를 판정하세요.
2. 상대방 이름(targetSpeakerName):
   - 상단 채팅방 제목 또는 좌측 프로필에 표시된 이름을 사용하세요.
   - 카카오톡 [프로필 가리기]로 '어피치', '라이언', '네오' 등 카카오프렌즈 캐릭터 이름이나 가명이 적용되어 있다면 그 이름을 그대로 사용하세요. 확인이 어려우면 '상대방'으로 표기하세요.
3. 이모티콘 및 스티커 판독 (매우 중요):
   - 텍스트 대신 이모티콘이나 캐릭터 스티커가 전송된 경우, 캐릭터의 표정과 동작을 파악하여 반드시 대괄호 형태로 요약 표기하세요.
   - 예시:
     - 고개 끄덕임 / 동의 -> "[이모티콘: 고개 끄덕임]"
     - 모른 척 / 딴청 피우기 / 시선 회피 -> "[이모티콘: 딴청 피우기]"
     - 우는 표정 / 슬픔 -> "[이모티콘: 우는 얼굴]"
     - 분노 / 화남 -> "[이모티콘: 화난 표정]"
     - 하트 / 애정 표현 -> "[이모티콘: 하트]"
4. 초장축 이미지 분할(슬라이스) 중복 제거:
   - 이미지가 세로로 분할되어 전달되었을 경우, 앞뒤 이미지 사이에 약 15% 정도 중복되는 구간이 있을 수 있습니다.
   - 동일한 내용의 중복 메시지는 한 번만 순서대로 포함시키세요.
5. 사진/동영상 파일:
   - 사진이 전송된 경우 "[사진]", 동영상인 경우 "[동영상]"으로 표기하세요.

[반환 JSON 스키마 - 다른 설명 없이 순수 JSON만 반환]:
{
  "targetSpeakerName": "상대방 이름 또는 캐릭터 가명",
  "userSpeakerName": "나",
  "messages": [
    {
      "speaker": "user" 또는 "target",
      "text": "말풍선 대화 텍스트 또는 [이모티콘: ...]",
      "time": "오후 11:32 (인식 가능한 경우, 없으면 생략 가능)",
      "date": "2024년 5월 12일 (날짜 구분선이 보이는 경우)"
    }
  ]
}
`;

export async function parseKakaoScreenshotsWithVision(
  images: GeminiInlineData[]
): Promise<PreprocessedConversation> {
  const geminiRes = await callGeminiVision(images, KAKAO_VISION_PROMPT);
  
  let rawContent = geminiRes.content.trim();
  // Strip code blocks if present
  if (rawContent.startsWith("```json")) {
    rawContent = rawContent.replace(/^```json\s*/, "").replace(/```$/, "").trim();
  } else if (rawContent.startsWith("```")) {
    rawContent = rawContent.replace(/^```\s*/, "").replace(/```$/, "").trim();
  }

  const parsed = JSON.parse(rawContent) as VisionParseResult;

  if (!parsed.messages || parsed.messages.length === 0) {
    throw new Error("캡처 이미지에서 유효한 대화를 감지하지 못했습니다. 더 선명한 대화 화면을 업로드해주세요.");
  }

  const targetName = parsed.targetSpeakerName || "상대방";
  const userName = parsed.userSpeakerName || "나";

  const participants: ConversationParticipant[] = [
    { id: "speaker_a", display_label: targetName },
    { id: "speaker_b", display_label: userName }
  ];

  let currentGroupId = 1;
  let currentEpisodeId = 1;
  let lastSpeaker: string | null = null;
  let lastParsedMinutes: number | null = null;
  let lastDate: string | null = null;

  const parseMinutes = (timeStr?: string | null): number | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(오후|오전)\s*(\d+):(\d+)/);
    if (!match) return null;
    let h = parseInt(match[2], 10);
    const m = parseInt(match[3], 10);
    if (match[1] === "오후" && h < 12) h += 12;
    if (match[1] === "오전" && h === 12) h = 0;
    return h * 60 + m;
  };

  const messages: ProcessedMessage[] = parsed.messages.map((m, idx) => {
    const isTarget = m.speaker === "target";
    const speakerId = isTarget ? "speaker_a" : "speaker_b";

    const currentMinutes = parseMinutes(m.time);
    let isNewEpisode = false;

    // Episode separation rule:
    // Requires date change OR major time reset (overnight / >= 12h gap)
    // Short 1~2 hour pauses in the same day are considered part of the same conflict episode.
    if (m.date && lastDate && m.date !== lastDate) {
      isNewEpisode = true;
    } else if (lastParsedMinutes !== null && currentMinutes !== null) {
      let diff = currentMinutes - lastParsedMinutes;
      if (diff < 0) diff += 24 * 60; // Next day wrap-around
      if (diff >= 30) {
        currentGroupId++; // Visual bubble grouping
      }
      if (diff >= 12 * 60) {
        isNewEpisode = true; // 12+ hour overnight gap
      }
    }

    if (isNewEpisode) {
      currentEpisodeId++;
      currentGroupId++;
    }

    if (m.date) lastDate = m.date;
    if (currentMinutes !== null) {
      lastParsedMinutes = currentMinutes;
    }

    if (lastSpeaker && lastSpeaker !== speakerId) {
      currentGroupId++;
    }
    lastSpeaker = speakerId;

    let type: "text" | "media" | "system" = "text";
    let mediaType: string | undefined = undefined;

    if (m.text.startsWith("[이모티콘:")) {
      type = "media";
      mediaType = "emoticon";
    } else if (m.text === "[사진]" || m.text === "사진") {
      type = "media";
      mediaType = "photo";
    } else if (m.text === "[동영상]" || m.text === "동영상") {
      type = "media";
      mediaType = "video";
    }

    return {
      id: `m${String(idx + 1).padStart(6, "0")}`,
      speaker_id: speakerId,
      timestamp: m.time || null,
      type,
      media_type: mediaType,
      text: m.text,
      episode_id: `e${String(currentEpisodeId).padStart(3, "0")}`,
      message_group_id: `g${String(currentGroupId).padStart(3, "0")}`
    };
  });

  const stats: ConversationStats = {
    total_messages: messages.length,
    speaker_a_messages: messages.filter(m => m.speaker_id === "speaker_a").length,
    speaker_b_messages: messages.filter(m => m.speaker_id === "speaker_b").length,
    speaker_a_text_messages: messages.filter(m => m.speaker_id === "speaker_a" && m.type === "text").length,
    speaker_b_text_messages: messages.filter(m => m.speaker_id === "speaker_b" && m.type === "text").length,
    speaker_a_character_count: messages.filter(m => m.speaker_id === "speaker_a").reduce((acc, m) => acc + m.text.length, 0),
    speaker_b_character_count: messages.filter(m => m.speaker_id === "speaker_b").reduce((acc, m) => acc + m.text.length, 0),
    episode_count: currentEpisodeId,
    media_count: messages.filter(m => m.type === "media").length,
    system_message_count: 0,
    start_time: messages[0]?.timestamp || null,
    end_time: messages[messages.length - 1]?.timestamp || null
  };

  return {
    schema_version: "conversation-v1.0",
    participants,
    identity_mapping: {
      user_speaker_id: "speaker_b",
      target_speaker_id: "speaker_a"
    },
    messages,
    stats,
    parser: {
      detected_format: "kakaotalk_vision",
      parse_confidence: 0.95,
      warnings: []
    }
  };
}
