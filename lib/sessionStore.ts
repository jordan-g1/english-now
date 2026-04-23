export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export type Correction = {
  messageId: string;
  original: string;
  corrected: string;
  explanation: string;
};

type SessionData = {
  scenario: string;
  messages: Message[];
  corrections: Correction[];
};

let _session: SessionData = {
  scenario: '',
  messages: [],
  corrections: [],
};

export const sessionStore = {
  get: () => _session,
  set: (data: Partial<SessionData>) => {
    _session = { ..._session, ...data };
  },
  reset: () => {
    _session = { scenario: '', messages: [], corrections: [] };
  },
};
