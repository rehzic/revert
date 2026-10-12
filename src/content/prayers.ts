export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type Prayer = {
  id: PrayerId;
  name: string;
  arabic: string;
  when: string;
  rakahs: number;
  // Number of rak'ahs (from the start) in which Al-Fatiha and the surah are recited aloud.
  aloudRakahs: number;
};

export const PRAYERS: Prayer[] = [
  { id: 'fajr', name: 'Fajr', arabic: 'الفجر', when: 'Dawn, before sunrise', rakahs: 2, aloudRakahs: 2 },
  { id: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', when: 'Just after midday', rakahs: 4, aloudRakahs: 0 },
  { id: 'asr', name: 'Asr', arabic: 'العصر', when: 'Afternoon', rakahs: 4, aloudRakahs: 0 },
  { id: 'maghrib', name: 'Maghrib', arabic: 'المغرب', when: 'Just after sunset', rakahs: 3, aloudRakahs: 2 },
  { id: 'isha', name: 'Isha', arabic: 'العشاء', when: 'Night', rakahs: 4, aloudRakahs: 2 },
];

export function getPrayer(id: string): Prayer | undefined {
  return PRAYERS.find((p) => p.id === id);
}

export type Recitation = {
  arabic?: string;
  transliteration: string;
  meaning: string;
  repeat?: number;
};

export type Step = {
  rakah: number;
  position: string;
  instruction: string;
  recitations: Recitation[];
};

const TAKBIR: Recitation = { arabic: 'الله أكبر', transliteration: 'Allahu Akbar', meaning: 'God is the Greatest' };

const FATIHA: Recitation = {
  arabic:
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
  transliteration:
    "Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-'alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal-mustaqim. Siratal-ladhina an'amta 'alayhim, ghayril-maghdubi 'alayhim wa lad-dallin.",
  meaning:
    'In the name of God, the Most Gracious, the Most Merciful. All praise is for God, Lord of all the worlds, the Most Gracious, the Most Merciful, Master of the Day of Judgement. You alone we worship and You alone we ask for help. Guide us to the straight path, the path of those You have blessed, not of those who earned Your anger, nor of those who went astray.',
};

const IKHLAS: Recitation = {
  arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
  transliteration: 'Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.',
  meaning:
    'Say: He is God, the One. God, the Eternal Refuge. He neither begets nor is born, and there is none comparable to Him. (Surah Al-Ikhlas, a short surah to start with; any other surah you know is fine.)',
};

const TASHAHHUD: Recitation = {
  arabic:
    'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
  transliteration:
    "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
  meaning:
    'All greetings, prayers and good things are for God. Peace be upon you, O Prophet, and the mercy of God and His blessings. Peace be upon us and upon the righteous servants of God. I bear witness that there is no god but God, and I bear witness that Muhammad is His servant and messenger.',
};

const SALAWAT: Recitation = {
  arabic:
    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
  transliteration:
    "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid.",
  meaning:
    'O God, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Abraham and the family of Abraham; You are Praiseworthy, Glorious. O God, bless Muhammad and the family of Muhammad, as You blessed Abraham and the family of Abraham; You are Praiseworthy, Glorious.',
};

function sujood(rakah: number, which: 'first' | 'second'): Step {
  return {
    rakah,
    position: which === 'first' ? 'Sujood (prostration)' : 'Second sujood',
    instruction:
      'Say "Allahu Akbar" and go down into prostration: forehead and nose, both palms, both knees and the toes of both feet touch the ground.',
    recitations: [
      { arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى', transliteration: "Subhana Rabbiyal-A'la", meaning: 'Glory be to my Lord, the Most High', repeat: 3 },
    ],
  };
}

export function buildSteps(prayer: Prayer): Step[] {
  const steps: Step[] = [];
  for (let r = 1; r <= prayer.rakahs; r++) {
    if (r === 1) {
      steps.push({
        rakah: r,
        position: 'Intention (niyyah)',
        instruction: `Stand facing the qibla. In your heart, intend to pray the ${prayer.rakahs} rak'ahs of ${prayer.name}. The intention does not need to be said out loud.`,
        recitations: [],
      });
      steps.push({
        rakah: r,
        position: 'Opening takbir',
        instruction: 'Raise both hands to your ears (or shoulders) and say the takbir. You are now in prayer.',
        recitations: [TAKBIR],
      });
    }
    const aloud = r <= prayer.aloudRakahs;
    const recite = r <= 2 ? [FATIHA, IKHLAS] : [FATIHA];
    steps.push({
      rakah: r,
      position: 'Standing (qiyam)',
      instruction:
        (r === 1
          ? 'Place your right hand over your left on your chest or stomach. '
          : 'Stand straight with your right hand over your left. ') +
        (r <= 2 ? 'Recite Al-Fatiha, then a short surah' : 'Recite Al-Fatiha only') +
        (aloud ? ' out loud (if praying alone, aloud is recommended but not required).' : ' quietly to yourself.'),
      recitations: recite,
    });
    steps.push({
      rakah: r,
      position: "Ruku' (bowing)",
      instruction: 'Say "Allahu Akbar" and bow, placing your hands on your knees with your back straight.',
      recitations: [
        { arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', transliteration: "Subhana Rabbiyal-'Adhim", meaning: 'Glory be to my Lord, the Magnificent', repeat: 3 },
      ],
    });
    steps.push({
      rakah: r,
      position: 'Rising from bowing',
      instruction: 'Stand back up straight, saying the first phrase as you rise and the second once you are standing.',
      recitations: [
        { arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ', transliteration: "Sami'allahu liman hamidah", meaning: 'God hears whoever praises Him' },
        { arabic: 'رَبَّنَا وَلَكَ الْحَمْدُ', transliteration: 'Rabbana wa lakal-hamd', meaning: 'Our Lord, to You belongs all praise' },
      ],
    });
    steps.push(sujood(r, 'first'));
    steps.push({
      rakah: r,
      position: 'Sitting between prostrations',
      instruction: 'Say "Allahu Akbar" and sit up on your knees, resting briefly.',
      recitations: [{ arabic: 'رَبِّ اغْفِرْ لِي', transliteration: 'Rabbighfir li', meaning: 'My Lord, forgive me' }],
    });
    steps.push(sujood(r, 'second'));

    const isLast = r === prayer.rakahs;
    if (r === 2 && !isLast) {
      steps.push({
        rakah: r,
        position: 'First sitting (tashahhud)',
        instruction:
          'Say "Allahu Akbar" and sit. Recite the tashahhud, raising your right index finger at the testimony. Then say "Allahu Akbar" and stand up for the next rak\'ah.',
        recitations: [TASHAHHUD],
      });
    } else if (isLast) {
      steps.push({
        rakah: r,
        position: 'Final sitting',
        instruction: 'Say "Allahu Akbar" and sit. Recite the tashahhud, then the prayer upon the Prophet (salawat).',
        recitations: [TASHAHHUD, SALAWAT],
      });
      steps.push({
        rakah: r,
        position: 'Ending the prayer (tasleem)',
        instruction: 'Turn your head to the right and give the greeting, then turn to the left and say it again. Your prayer is complete.',
        recitations: [
          {
            arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
            transliteration: "As-salamu 'alaykum wa rahmatullah",
            meaning: 'Peace be upon you and the mercy of God',
            repeat: 2,
          },
        ],
      });
    } else {
      steps.push({
        rakah: r,
        position: "Stand for the next rak'ah",
        instruction: 'Say "Allahu Akbar" and stand back up.',
        recitations: [TAKBIR],
      });
    }
  }
  return steps;
}
