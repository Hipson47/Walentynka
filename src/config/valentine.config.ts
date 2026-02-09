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
  choices: [
    { id: "dinner", label: "Kolacyjka", emoji: "🍝" },
    { id: "movie", label: "film?", emoji: "🎬" },
    { id: "walk", label: "Spacer?", emoji: "☕" },
  ] as ChoiceOption[],
  signature: "Z miłością",
  from: "",
};
