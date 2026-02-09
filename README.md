# Walentynkowy Prank v2 💌

Interaktywna kartka walentynkowa z 5-krokowym flow!

## Flow

1. **Koperta** — kliknij, aby otworzyć
2. **Pytanie** — "Czy zostaniesz moją walentynką?" + uciekający przycisk NIE
3. **Celebracja** — serduszka unoszą się przez kilka sekund
4. **Wybór randki** — 3 opcje do wyboru
5. **Finał** — podsumowanie + przycisk "PS..." z prywatną wiadomością

## Jak uruchomić lokalnie?

1. Pobierz/sklonuj repozytorium
2. Dodaj swoje GIF-y do `/assets`:
   - `ask.gif` — ekran pytania
   - `yay.gif` — ekran sukcesu
3. Otwórz `index.html` w przeglądarce

> 💡 Bez GIF-ów wyświetlą się emoji jako fallback

## Personalizacja (opcjonalne)

Dodaj parametr `?to=Imię` do URL:
```
index.html?to=Asia
```
Wtedy pytanie będzie brzmiało: *"Asia, czy zostaniesz moją walentynką?"*

## GitHub Pages

1. Utwórz repo na GitHub
2. Wrzuć wszystkie pliki (w tym `/assets`)
3. **Settings** → **Pages** → wybierz `main` → **Save**
4. Gotowe! Udostępnij link 💕

## Struktura

```
walentynki/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── ask.gif
    └── yay.gif
```

## Funkcje

- 💌 Animowana koperta intro
- 🏃 Uciekający "NIE" (cały viewport)
- 💕 Floating hearts
- 🎯 Wybór randki
- 📝 Modal z prywatną wiadomością
- ♿ Respektuje `prefers-reduced-motion`
- 📱 Responsywny (mobile-first)
