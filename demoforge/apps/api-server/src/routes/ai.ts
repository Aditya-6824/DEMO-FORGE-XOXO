import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

export const aiRouter = Router();

aiRouter.post('/analyze-spec', async (req, res) => {
  const { specUrl, specJson } = req.body;
  if (!specUrl && !specJson) return res.status(400).json({ error: 'specUrl or specJson is required' });

  try {
    let rawSpec = specJson;
    if (specUrl) {
      const resp = await fetch(specUrl);
      rawSpec = await resp.json();
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const systemPrompt = "You are an API demo expert. Analyze this OpenAPI specification and return a JSON object with: { endpoints: [ { method, path, summary, requestBodyExample, responseExample } ], suggestedDemoTitle, suggestedDemoDescription, recommendedFlow: [ ordered array of endpoint paths for a compelling demo ] }. Return only valid JSON.";

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // updated exact model name for anthropic api compatibility
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify(rawSpec) }],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    res.json(JSON.parse(content));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

aiRouter.post('/explain', async (req, res) => {
  const { apiResponse, endpoint, method } = req.body;
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `Explain what this API response indicates in 2-3 plain-English sentences.\nEndpoint: ${method} ${endpoint}\nResponse:\n${JSON.stringify(apiResponse, null, 2)}`;
    
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ explanation: content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
