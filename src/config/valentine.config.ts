export type ChoiceOption = {
  id: string;
  label: string;
  emoji: string;
};

export const valentineConfig = {
  texts: {
    introHint: "Otwórz",
    askHeadline: "Dziubas, czy zostaniesz moją walentynką?",
    celebrateHeadline: "Kocham Cię najmocniej na świecie ❤️",
    choiceHeadline: "Randeczka? ⭐",
    finalHeadline: "Dobry wybór ✅",
    finalSubtext: "Nie mogę się doczekać! 💕",
    psTitle: "Psssst.... 🙊",
    psBody:
      "Chciałem Ci powiedzieć, że jesteś najwspanialszą osobą jaką znam. Każdego dnia cieszę się, że jesteś w moim życiu. Kocham Cię! ❤️",
  },
  gifPaths: {
    ask: "/assets/gif/ask.gif",
    celebrate: "/assets/gif/yay.gif",
    final: "/assets/gif/final.gif",
  },
  assets: {
    heroImage: "/assets/hero/hero.jpg",
  },
  introMotion: {
    useWebGPU: false,
    triggerVelocityNorm: 0.12,
    triggerVelocityHoldMs: 60,
    landingIntersectionRatio: 0.65,
    loopsCount: 2.25,
    flyDurationMs: 1800,
    ctaDelayMs: 80,
    ctaFadeMs: 240,
  },
  choices: [
    { id: "dinner", label: "Kolacyjka", emoji: "🍝" },
    { id: "movie", label: "film?", emoji: "🎬" },
    { id: "walk", label: "Spacer?", emoji: "☕" },
  ] as ChoiceOption[],
  signature: "Z miłością",
  from: "",
};
