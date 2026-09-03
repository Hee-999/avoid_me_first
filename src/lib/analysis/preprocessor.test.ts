import assert from "assert";
import { preprocessConversation } from "./preprocessor";

const SYNTHETIC_KAKAO_TEST = `
[구름] [오후 11:32] 나 오늘 너무 피곤해서... 우리 내일 얘기하면 안 될까?
[별이] [오후 11:33] 또 내일로 미루려고?
[별이] [오후 11:33] 우리 계속 이렇게 넘어갈 순 없잖아
[구름] [오후 11:34] 지금은 진짜 얘기하고 싶지 않아
[별이] [오후 11:34] 나는 싸우자는 게 아니라 풀 건 풀자는 거야
[별이] [오후 11:35] 왜 문제 생길 때마다 대화를 피하려고 해?
[구름] [오후 11:35] 또 시작이네
[구름] [오후 11:35] 그만하자
[별이] [오후 11:36] 그럼 언제 얘기할 건데?
[구름] [오후 11:37] 모르겠어 지금은 그냥 혼자 있고 싶어
`;

const SYNTHETIC_BASIC_TEST = `
봄: 좋은 아침
여름: 잘 잤어?
봄: 응ㅋㅋ 너는?
여름: 나도 잘잤지
`;

const SYNTHETIC_MEDIA_TEST = `
[달] [오후 6:21] 사진
[별] [오후 6:22] 이모티콘
[달] [오후 6:23] 이거 봤어?
`;

async function runTests() {
  console.log("Running Preprocessor Unit Tests...\n");

  // TEST 1: Kakao Parsing
  console.log("Test 1: Kakao format parsing & Speaker separation");
  const res1 = preprocessConversation(SYNTHETIC_KAKAO_TEST);
  
  assert(res1.messages.length === 10, "Should have exactly 10 messages");
  assert(res1.participants.length === 2, "Should detect 2 participants");
  assert(res1.participants.find(p => p.id === "speaker_a")?.display_label === "구름");
  assert(res1.participants.find(p => p.id === "speaker_b")?.display_label === "별이");
  
  // Timestamp normalization check
  assert(res1.messages[0].timestamp === "23:32", "Should convert 오후 11:32 to 23:32");
  
  // Unique Message IDs
  const msgIds = res1.messages.map(m => m.id);
  const uniqueIds = new Set(msgIds);
  assert(uniqueIds.size === 10, "All message IDs must be unique");
  
  // Stats
  assert(res1.stats.speaker_a_messages === 5, "Speaker A should have 5 messages");
  assert(res1.stats.speaker_b_messages === 5, "Speaker B should have 5 messages");
  
  console.log("✅ Test 1 Passed\n");


  // TEST 2: Basic Parsing
  console.log("Test 2: Basic Name: format parsing");
  const res2 = preprocessConversation(SYNTHETIC_BASIC_TEST);
  assert(res2.messages.length === 4, "Should have exactly 4 messages");
  assert(res2.participants[0].display_label === "봄");
  assert(res2.participants[1].display_label === "여름");
  console.log("✅ Test 2 Passed\n");


  // TEST 3: Media Parsing
  console.log("Test 3: Media event parsing");
  const res3 = preprocessConversation(SYNTHETIC_MEDIA_TEST);
  assert(res3.messages.length === 3, "Should have 3 messages");
  assert(res3.messages[0].type === "media" && res3.messages[0].media_type === "photo", "Should detect photo");
  assert(res3.messages[1].type === "media" && res3.messages[1].media_type === "emoticon", "Should detect emoticon");
  assert(res3.messages[2].type === "text", "Should detect text");
  assert(res3.stats.media_count === 2, "Should count 2 media messages");
  console.log("✅ Test 3 Passed\n");

  console.log("All unit tests passed successfully!");
}

runTests().catch(console.error);
