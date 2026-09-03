async function runTest() {
  console.log("Testing POST /api/analyze with Target Speaker Selection...");
  
  const sampleText = `
[모래] [오후 1:00] 우리 이야기 좀 해
[숲] [오후 1:05] 지금은 좀 바빠서 나중에 얘기하자
[모래] [오후 1:06] 맨날 바쁘다고만 하잖아
[숲] [오후 1:10] 아 진짜 왜 자꾸 그래 나 피곤해
[모래] [오후 1:11] 너 나 피하는거지?
[숲] [오후 1:15] 생각할 시간이 필요해 나중에 내가 연락할게
  `;

  try {
    console.log("--- TEST A: User is 모래, Target is 숲 ---");
    const resA = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: sampleText, 
        user_speaker_id: 'speaker_a',
        target_speaker_id: 'speaker_b',
        target_speaker_label: '숲'
      })
    });
    
    if (!resA.ok) throw new Error(`Analyze A failed: ${resA.status}`);
    const dataA = await resA.json();
    console.log("Analyze A API Success ID:", dataA.id);

    const unlockResA = await fetch(`http://localhost:3000/api/premium/unlock/${dataA.id}`, { method: 'POST' });
    if (!unlockResA.ok) throw new Error("Unlock A failed");
    console.log("Unlock A Success");

    console.log("Waiting 15 seconds for async pipeline (after hook)...");
    await new Promise(r => setTimeout(r, 15000));

    const resultResA = await fetch(`http://localhost:3000/api/result/${dataA.id}`, {
      headers: { cookie: resA.headers.get('set-cookie') || '' }
    });
    const resultDataA = await resultResA.json();
    console.log("Result A target_speaker_label:", resultDataA.analysis.target_speaker_label);
    console.log("Result A status:", resultDataA.analysis.status.report);
    if (!resultDataA.premium_report) console.error("❌ A: Premium Report missing!");
    else console.log("✅ A: Premium Report generated successfully");

    
    console.log("\n--- TEST B: User is 숲, Target is 모래 ---");
    const resB = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: sampleText, 
        user_speaker_id: 'speaker_b',
        target_speaker_id: 'speaker_a',
        target_speaker_label: '모래'
      })
    });
    
    if (!resB.ok) throw new Error(`Analyze B failed: ${resB.status}`);
    const dataB = await resB.json();
    console.log("Analyze B API Success ID:", dataB.id);

    const unlockResB = await fetch(`http://localhost:3000/api/premium/unlock/${dataB.id}`, { method: 'POST' });
    if (!unlockResB.ok) throw new Error("Unlock B failed");
    console.log("Unlock B Success");

    console.log("Waiting 15 seconds for async pipeline (after hook)...");
    await new Promise(r => setTimeout(r, 15000));

    const resultResB = await fetch(`http://localhost:3000/api/result/${dataB.id}`, {
      headers: { cookie: resB.headers.get('set-cookie') || '' }
    });
    const resultDataB = await resultResB.json();
    console.log("Result B target_speaker_label:", resultDataB.analysis.target_speaker_label);
    console.log("Result B status:", resultDataB.analysis.status.report);
    if (!resultDataB.premium_report) console.error("❌ B: Premium Report missing!");
    else console.log("✅ B: Premium Report generated successfully");

  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

runTest();
