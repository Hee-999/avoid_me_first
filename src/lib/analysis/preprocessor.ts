import { PreprocessedConversation, ProcessedMessage, ConversationParticipant, ConversationStats, ParserResult } from "./interfaces";

export const PREPROCESSOR_VERSION = "1.0";
export const CONVERSATION_SCHEMA_VERSION = "conversation-v1.0";

const EPISODE_GAP_MINUTES = 120; // 2 hours
const GROUP_GAP_MINUTES = 5; // 5 minutes

export function preprocessConversation(rawText: string): PreprocessedConversation {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const participantsMap = new Map<string, string>(); // display_label -> speaker_a/b
  const messages: ProcessedMessage[] = [];
  const warnings: string[] = [];
  
  let currentEpisodeId = 1;
  let currentGroupId = 1;
  
  let lastTimestampStr: string | null = null;
  let lastParsedMinutes = 0;
  let lastSpeakerId: string | null = null;

  for (const line of lines) {
    // Attempt Kakao format parsing: [Name] [Time] Text
    // Note: time might be [오후 11:32]
    const kakaoMatch = line.match(/^\[(.*?)\]\s*\[(.*?)\]\s*(.*)$/);
    let displayLabel = "";
    let timeStr = "";
    let content = "";
    let isSystem = false;

    if (kakaoMatch) {
      displayLabel = kakaoMatch[1];
      timeStr = kakaoMatch[2];
      content = kakaoMatch[3];
    } else {
      // Attempt Basic Name: Text format
      const basicMatch = line.match(/^(.*?):\s*(.*)$/);
      if (basicMatch) {
        displayLabel = basicMatch[1];
        content = basicMatch[2];
      } else {
        // Unparsable line, skip or mark as system
        continue;
      }
    }

    // Determine Speaker ID
    let speakerId = participantsMap.get(displayLabel);
    if (!speakerId) {
      if (participantsMap.size === 0) speakerId = "speaker_a";
      else if (participantsMap.size === 1) speakerId = "speaker_b";
      else {
        warnings.push(`More than 2 speakers detected. Ignoring speaker: ${displayLabel}`);
        continue; // MVP only supports 2 speakers
      }
      participantsMap.set(displayLabel, speakerId);
    }

    // Parse Time
    let parsedMinutes = lastParsedMinutes;
    let normalizedTime = timeStr || null;
    if (timeStr) {
      const pmMatch = timeStr.match(/(오후|오전)\s*(\d+):(\d+)/);
      if (pmMatch) {
        const isPm = pmMatch[1] === "오후";
        let h = parseInt(pmMatch[2], 10);
        const m = parseInt(pmMatch[3], 10);
        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;
        parsedMinutes = h * 60 + m;
        normalizedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
    }

    // Episode & Group logic
    let isNewEpisode = false;
    let isNewGroup = false;

    if (messages.length === 0) {
      isNewEpisode = true;
      isNewGroup = true;
    } else {
      if (timeStr) {
        let diff = parsedMinutes - lastParsedMinutes;
        if (diff < 0) diff += 24 * 60; // Next day wrap-around (simplification)
        
        if (diff >= EPISODE_GAP_MINUTES) {
          isNewEpisode = true;
          isNewGroup = true;
        } else if (diff >= GROUP_GAP_MINUTES || speakerId !== lastSpeakerId) {
          isNewGroup = true;
        }
      } else {
        // No time, fallback to speaker change
        if (speakerId !== lastSpeakerId) {
          isNewGroup = true;
        }
      }
    }

    if (isNewEpisode && messages.length > 0) currentEpisodeId++;
    if (isNewGroup && messages.length > 0) currentGroupId++;

    // Determine Message Type
    let type: "text" | "media" | "system" = "text";
    let mediaType: string | undefined = undefined;

    if (content === "이모티콘") {
      type = "media";
      mediaType = "emoticon";
    } else if (content === "사진" || content === "photo") {
      type = "media";
      mediaType = "photo";
    } else if (content === "동영상" || content === "video") {
      type = "media";
      mediaType = "video";
    }

    messages.push({
      id: `m${String(messages.length + 1).padStart(6, '0')}`,
      speaker_id: speakerId,
      timestamp: normalizedTime,
      type,
      media_type: mediaType,
      text: content,
      episode_id: `e${String(currentEpisodeId).padStart(3, '0')}`,
      message_group_id: `g${String(currentGroupId).padStart(3, '0')}`
    });

    lastTimestampStr = timeStr;
    lastParsedMinutes = parsedMinutes;
    lastSpeakerId = speakerId;
  }

  // Generate Stats
  const stats: ConversationStats = {
    total_messages: messages.length,
    speaker_a_messages: 0,
    speaker_b_messages: 0,
    speaker_a_text_messages: 0,
    speaker_b_text_messages: 0,
    speaker_a_character_count: 0,
    speaker_b_character_count: 0,
    episode_count: currentEpisodeId,
    media_count: 0,
    system_message_count: 0,
    start_time: messages.length > 0 ? messages[0].timestamp : null,
    end_time: messages.length > 0 ? messages[messages.length - 1].timestamp : null
  };

  for (const msg of messages) {
    if (msg.speaker_id === "speaker_a") {
      stats.speaker_a_messages++;
      if (msg.type === "text") {
        stats.speaker_a_text_messages++;
        stats.speaker_a_character_count += msg.text.length;
      }
    } else if (msg.speaker_id === "speaker_b") {
      stats.speaker_b_messages++;
      if (msg.type === "text") {
        stats.speaker_b_text_messages++;
        stats.speaker_b_character_count += msg.text.length;
      }
    }
    
    if (msg.type === "media") stats.media_count++;
    if (msg.type === "system") stats.system_message_count++;
  }

  const participants: ConversationParticipant[] = Array.from(participantsMap.entries()).map(([label, id]) => ({
    id: id as "speaker_a" | "speaker_b",
    display_label: label
  }));

  let detectedFormat = "unknown";
  if (participants.length > 0) {
    if (rawText.includes("[") && rawText.includes("]")) detectedFormat = "kakaotalk";
    else detectedFormat = "basic_colon";
  }

  return {
    schema_version: CONVERSATION_SCHEMA_VERSION,
    participants,
    identity_mapping: {
      user_speaker_id: null,
      target_speaker_id: null
    },
    messages,
    stats,
    parser: {
      detected_format: detectedFormat,
      parse_confidence: messages.length > 0 ? 0.9 : 0.0,
      warnings
    }
  };
}
