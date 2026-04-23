import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { transcript } = await req.json();

  const systemPrompt = `You are an expert English language assessor trained in the CEFR framework (A1, A2, B1, B2, C1, C2).

Analyze the following spoken English transcript and assess the speaker's level. Consider:
- Vocabulary range and accuracy
- Grammar complexity and accuracy
- Sentence structure variety
- Fluency indicators (filler words, hesitations visible in text)
- Overall communicative effectiveness

The speaker is a non-native English learner. Note: casual spoken transcripts often use simpler vocabulary than the speaker's true competence level — when in doubt between two levels, lean toward the higher one.

Respond ONLY in this exact JSON format:
{
  "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "title": "one-word level name e.g. Intermediate",
  "summary": "2-3 sentences explaining what they do well and what to work on. Be encouraging and specific.",
  "strengths": ["strength 1", "strength 2"],
  "areas_to_improve": ["area 1", "area 2"]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transcript: "${transcript}"` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
    }),
  });

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  return new Response(JSON.stringify(content), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
