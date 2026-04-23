export type Phrase = {
  phrase: string;
  meaning: string;
  example: string;
};

export const PHRASES: Phrase[] = [
  { phrase: "Break the ice", meaning: "Start a conversation in an awkward or new situation", example: "He told a joke to break the ice at the meeting." },
  { phrase: "Get the ball rolling", meaning: "Start something happening", example: "Let's get the ball rolling — who wants to go first?" },
  { phrase: "Hit the nail on the head", meaning: "Describe exactly what is causing a problem", example: "You really hit the nail on the head with that point." },
  { phrase: "On the same page", meaning: "In agreement or having the same understanding", example: "Before we start, let's make sure we're all on the same page." },
  { phrase: "Cut to the chase", meaning: "Get to the point without wasting time", example: "I'll cut to the chase — we need to finish this by Friday." },
  { phrase: "Up in the air", meaning: "Uncertain, not yet decided", example: "The meeting time is still up in the air." },
  { phrase: "Bite the bullet", meaning: "Endure a painful situation", example: "I just had to bite the bullet and apologize." },
  { phrase: "The ball is in your court", meaning: "It is your turn to take action", example: "I've made my offer — the ball is in your court now." },
  { phrase: "Go back to the drawing board", meaning: "Start something over from the beginning", example: "The plan didn't work, so we went back to the drawing board." },
  { phrase: "Hit the ground running", meaning: "Start something with enthusiasm and energy", example: "She hit the ground running on her first day at work." },
  { phrase: "Wrap your head around", meaning: "Understand something complicated", example: "I can't quite wrap my head around this concept yet." },
  { phrase: "Pull someone's leg", meaning: "Joke with someone", example: "Don't worry, I'm just pulling your leg!" },
  { phrase: "Under the weather", meaning: "Feeling ill or unwell", example: "I'm feeling a bit under the weather today." },
  { phrase: "Once in a blue moon", meaning: "Very rarely", example: "We only see each other once in a blue moon." },
  { phrase: "Costs an arm and a leg", meaning: "Very expensive", example: "That restaurant costs an arm and a leg." },
  { phrase: "Let the cat out of the bag", meaning: "Accidentally reveal a secret", example: "She let the cat out of the bag about the surprise party." },
  { phrase: "Speak your mind", meaning: "Say what you are thinking directly", example: "Please feel free to speak your mind during the meeting." },
  { phrase: "In the long run", meaning: "Over a long period of time", example: "It costs more now, but it'll save money in the long run." },
  { phrase: "Keep something at bay", meaning: "Keep something from getting closer", example: "Exercise helps keep stress at bay." },
  { phrase: "Miss the boat", meaning: "Miss an opportunity", example: "If you don't apply today, you'll miss the boat." },
  { phrase: "Sit on the fence", meaning: "Avoid taking a side in a disagreement", example: "You can't sit on the fence forever — you have to decide." },
  { phrase: "A penny for your thoughts", meaning: "Used to ask what someone is thinking", example: "You look serious. A penny for your thoughts?" },
  { phrase: "Beat around the bush", meaning: "Avoid saying what you really mean", example: "Stop beating around the bush — just tell me the problem." },
  { phrase: "By the skin of your teeth", meaning: "Just barely", example: "We made it to the airport by the skin of our teeth." },
  { phrase: "Call it a day", meaning: "Stop working on something", example: "We've been at it for hours — let's call it a day." },
  { phrase: "On the tip of my tongue", meaning: "Something you know but can't quite remember", example: "Her name is on the tip of my tongue." },
  { phrase: "Burning the midnight oil", meaning: "Working late into the night", example: "She's been burning the midnight oil to finish the report." },
  { phrase: "A blessing in disguise", meaning: "Something that seems bad but turns out good", example: "Losing that job was a blessing in disguise." },
  { phrase: "Devil's advocate", meaning: "Argue the opposite side to test an idea", example: "Let me play devil's advocate — what if the plan fails?" },
  { phrase: "Every cloud has a silver lining", meaning: "Every bad situation has a positive aspect", example: "I know things are tough, but every cloud has a silver lining." },
  { phrase: "Kill two birds with one stone", meaning: "Solve two problems with one action", example: "Walking to work kills two birds with one stone — I save money and exercise." },
  { phrase: "The elephant in the room", meaning: "An obvious problem nobody wants to discuss", example: "Nobody mentioned the budget — the elephant in the room." },
  { phrase: "Throw someone under the bus", meaning: "Blame someone else to protect yourself", example: "He threw his colleague under the bus in the meeting." },
  { phrase: "Touch base", meaning: "Make brief contact with someone", example: "Let's touch base later this week to catch up." },
  { phrase: "Go the extra mile", meaning: "Make more effort than is expected", example: "She always goes the extra mile for her clients." },
  { phrase: "Back to square one", meaning: "Starting over after a failure", example: "The deal fell through, so we're back to square one." },
  { phrase: "In hot water", meaning: "In trouble or a difficult situation", example: "He got in hot water for missing the deadline." },
  { phrase: "Take it with a grain of salt", meaning: "Be sceptical about something", example: "I'd take that review with a grain of salt." },
  { phrase: "Barking up the wrong tree", meaning: "Looking in the wrong place for something", example: "If you think I did it, you're barking up the wrong tree." },
  { phrase: "Beat a dead horse", meaning: "Waste time on something that won't work", example: "We've discussed this enough — let's not beat a dead horse." },
];

export function getPhraseOfTheDay(): Phrase {
  const index = Math.floor(Date.now() / 86400000) % PHRASES.length;
  return PHRASES[index];
}
