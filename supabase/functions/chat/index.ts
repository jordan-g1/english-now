import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

const SCENARIO_PROMPTS: Record<string, string> = {
  free:       'You are having a casual, open conversation with the user. They can talk about anything they like.',
  restaurant: 'You are playing a friendly waiter at a nice restaurant. The user is the customer.',
  interview:  'You are a professional hiring manager conducting a job interview. The user is the candidate. Be encouraging but professional.',
  smalltalk:  'You are making friendly small talk with a new acquaintance. Keep it light and fun.',
  doctor:     'You are a friendly doctor seeing a patient. The user is the patient. Be caring and professional.',
  shopping:   'You are a helpful store assistant. The user is shopping. Help them find what they need.',
};

const LEVEL_INSTRUCTIONS: Record<string, string> = {
  A1: 'The user is a BEGINNER (A1). Use only very simple vocabulary and short sentences (max 8 words). Speak slowly and clearly. Avoid idioms, slang, or complex grammar entirely.',
  A2: 'The user is ELEMENTARY (A2). Use simple vocabulary and short sentences. Avoid complex grammar. Stick to common, everyday words.',
  B1: 'The user is INTERMEDIATE (B1). Use natural language but keep sentences clear. You can use common idioms occasionally. Avoid very complex vocabulary.',
  B2: 'The user is UPPER INTERMEDIATE (B2). Speak naturally and fluently. Use a full range of vocabulary and grammar. You can use idioms and nuanced expressions.',
  C1: 'The user is ADVANCED (C1). Speak naturally as you would with a near-native speaker. Use sophisticated vocabulary, complex structures, idioms, and cultural references freely.',
  C2: 'The user is at MASTERY level (C2). Treat them as a native speaker. Use the full richness of the English language — nuance, wordplay, cultural references, and complex ideas.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { messages, scenario, userId } = await req.json();

  // Fetch user profile for personalization
  let level = 'B1';
  let nativeLanguage = '';
  let goal = '';

  if (userId) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('cefr_level, english_level, native_language, goal')
      .eq('id', userId)
      .single();

    if (profile) {
      level = profile.cefr_level ?? profile.english_level ?? 'B1';
      nativeLanguage = profile.native_language ?? '';
      goal = profile.goal ?? '';
    }
  }

  const scenarioContext = SCENARIO_PROMPTS[scenario] ?? SCENARIO_PROMPTS.free;
  const levelInstructions = LEVEL_INSTRUCTIONS[level] ?? LEVEL_INSTRUCTIONS['B1'];

  const systemPrompt = `${scenarioContext}

LANGUAGE LEVEL: ${levelInstructions}
${nativeLanguage ? `NATIVE LANGUAGE: The user's native language is ${nativeLanguage}. Be aware of common mistakes speakers of this language make in English.` : ''}
${goal ? `USER GOAL: The user is learning English for: ${goal}. Keep this context in mind.` : ''}

Your role:
- Respond naturally and conversationally. Keep replies concise (1–3 sentences) for a natural back-and-forth.
- Match the complexity of your language strictly to the user's level.
- If the user made a grammar or vocabulary mistake, DO NOT correct them inside your reply. Just respond naturally as if you understood them.
- After each message, identify the single most important mistake (if any). Focus on grammar and natural phrasing — ignore minor typos or punctuation.

Correction rules:
- "original": the exact word or short phrase the user got wrong (not the full message — just the error)
- "corrected": the full corrected version of the user's ENTIRE message, rewritten naturally
- "explanation": 1–2 sentences. Explain WHY it's wrong and what rule or pattern applies. Be specific and helpful, not generic. Write like a friendly tutor, not a dictionary.

Respond ONLY in this exact JSON format:
{
  "reply": "your conversational response",
  "correction": null
}

Or if they made a mistake:
{
  "reply": "your conversational response",
  "correction": {
    "original": "the exact incorrect phrase",
    "corrected": "the full corrected sentence",
    "explanation": "specific, friendly explanation of the rule"
  }
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  return new Response(JSON.stringify(content), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
