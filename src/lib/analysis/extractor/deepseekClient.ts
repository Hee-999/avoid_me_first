export interface DeepSeekChatPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}

export interface DeepSeekChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callDeepSeekAPI(prompt: string, maxTokens?: number): Promise<DeepSeekChatResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const tempStr = process.env.DEEPSEEK_TEMPERATURE || "0.1";
  const temperature = parseFloat(tempStr);
  
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured on the server.");
  }

  const endpoint = `${baseUrl}/chat/completions`;

  const payload: DeepSeekChatPayload = {
    model,
    messages: [{ role: "user", content: prompt }],
    temperature,
    max_tokens: maxTokens || parseInt(process.env.DEEPSEEK_MAX_TOKENS || process.env.DEEPSEEK_MAX_OUTPUT_TOKENS || "8000", 10),
    response_format: { type: "json_object" }
  };

  // Note: DeepSeek officially supports response_format: { type: "json_object" } for V3/V4.
  // The SDK/HTTP endpoint automatically disables thinking for structured output in V4 if not requested.
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Unexpected DeepSeek API response structure.");
  }

  if (!data.choices[0].message.content) {
    console.log("[DEBUG API] Empty content! Choice object:", JSON.stringify(data.choices[0], null, 2));
  }
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  };
}
