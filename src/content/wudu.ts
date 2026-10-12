export type WuduStep = {
  title: string;
  instruction: string;
  times?: number;
};

export const WUDU_STEPS: WuduStep[] = [
  { title: 'Intention', instruction: 'In your heart, intend to perform wudu to purify yourself for prayer.' },
  { title: 'Say Bismillah', instruction: 'Say "Bismillah" (In the name of God) before you begin.' },
  { title: 'Hands', instruction: 'Wash both hands up to the wrists, between the fingers too. Start with the right hand.', times: 3 },
  { title: 'Mouth', instruction: 'Take water into your mouth with your right hand, swirl it around and spit it out.', times: 3 },
  { title: 'Nose', instruction: 'Sniff water gently into your nose with your right hand and blow it out using your left hand.', times: 3 },
  { title: 'Face', instruction: 'Wash your whole face, from the hairline to the chin and from ear to ear.', times: 3 },
  { title: 'Arms', instruction: 'Wash your right arm from the fingertips up to and including the elbow, then the left arm.', times: 3 },
  { title: 'Head', instruction: 'With wet hands, wipe over your head from the front to the back and then back to the front.', times: 1 },
  { title: 'Ears', instruction: 'Wipe the inside of your ears with your index fingers and the back of your ears with your thumbs.', times: 1 },
  { title: 'Feet', instruction: 'Wash your right foot up to and including the ankle, between the toes too, then the left foot.', times: 3 },
  {
    title: 'Closing testimony',
    instruction:
      'Finish by saying: "Ash-hadu an la ilaha illallah wahdahu la sharika lah, wa ash-hadu anna Muhammadan \'abduhu wa rasuluh" (I bear witness there is no god but God, alone without partner, and that Muhammad is His servant and messenger).',
  },
];

export const WUDU_BREAKERS = [
  'Using the toilet or passing wind',
  'Deep sleep',
  'Losing consciousness',
  'Bleeding heavily or vomiting a mouthful (according to some schools)',
];
