import { sanitizeConversation } from '../privacySanitizer';

async function runPrivacyTests() {
  const msgs = [
    { speaker_id: "김민수", text: "내 번호 010-1234-5678이야" },
    { speaker_id: "이지연", text: "메일 abc@example.com으로 보내줘" },
    { speaker_id: "김민수", text: "오늘 10시에 만나자" },
    { speaker_id: "이지연", text: "3일 정도 생각해보고 연락할게" },
    { speaker_id: "김민수", text: "내 주민번호 900101-1234567 이고 카드는 1234-5678-9012-3456 이야." }
  ];

  const result = sanitizeConversation(msgs, "이지연");

  console.log("Original Target:", "이지연");
  console.log("Sanitized Target:", result.targetSpeakerId);
  console.log("-----------------------------------------");
  result.messages.forEach(m => {
    console.log(`[${m.speaker}] ${m.text}`);
  });

  // Verify
  if (result.targetSpeakerId !== "SPEAKER_B") {
    throw new Error("Target mapping failed!");
  }
  if (result.messages[0].text.includes("010")) {
    throw new Error("Phone number not masked!");
  }
  if (!result.messages[2].text.includes("10시")) {
    throw new Error("Time was incorrectly masked!");
  }
  
  console.log("✅ PRIVACY SANITIZER PASSED");
}

runPrivacyTests().catch(console.error);
