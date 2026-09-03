async function runTest() {
  console.log("Testing POST /api/analyze...");
  
  const sampleText = `
[김철수] [오후 1:00] 우리 이야기 좀 해
[이영희] [오후 1:05] 지금은 좀 바빠서 나중에 얘기하자
[김철수] [오후 1:06] 맨날 바쁘다고만 하잖아
[이영희] [오후 1:10] 아 진짜 왜 자꾸 그래 나 피곤해
[김철수] [오후 1:11] 너 나 피하는거지?
[이영희] [오후 1:15] 생각할 시간이 필요해 나중에 내가 연락할게
  `;

  try {
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sampleText, targetSpeaker: '이영희' })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Analyze failed: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log("✅ Analyze API Success:", data);
    
    const { id } = data;
    
    console.log(`Testing POST /api/premium/unlock/${id}...`);
    const unlockRes = await fetch(`http://localhost:3000/api/premium/unlock/${id}`, {
      method: 'POST'
    });
    
    if (!unlockRes.ok) {
      const errorText = await unlockRes.text();
      throw new Error(`Unlock failed: ${unlockRes.status} - ${errorText}`);
    }
    
    const unlockData = await unlockRes.json();
    console.log("✅ Unlock API Success:", unlockData);
    
  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

runTest();
