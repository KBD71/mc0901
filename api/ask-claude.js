// /api/ask-claude.js

export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Vercel 환경 변수에서 Claude API 키를 가져옴
  const apiKey = process.env.CLAUDE;
  if (!apiKey) {
    return res.status(500).json({ error: 'Claude API key is not configured.' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", // 사용자가 지정한 모델
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API Error:', errorBody);
      return res.status(response.status).json({ error: `API request failed: ${errorBody}` });
    }

    const data = await response.json();
    
    // Claude 응답에서 실제 텍스트 내용을 추출하여 클라이언트에 전송
    const claudeResponseText = data.content && data.content[0] ? data.content[0].text : 'No response from model.';
    
    res.status(200).json({ answer: claudeResponseText });

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'An internal error occurred.' });
  }
}