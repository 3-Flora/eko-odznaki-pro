# Obsługa nawigacji "wstecz" w aplikacji mobilnej

## 1. Zainstaluj wymagany plugin Capacitor

```bash
npm install @capacitor/app
```

## 2. Zsynchronizuj projekt z platformami natywnymi

```bash
npx cap sync
```

## 3. Funkcjonalności

### Przycisk "wstecz" na Androidzie

- **Na stronie głównej (/)**: Zamyka aplikację
- **Na innych stronach**: Cofa do poprzedniej strony w historii

### Gest przesunięcia palcem (swipe)

- **Przesunięcie palcem w prawo** od lewej krawędzi ekranu cofa do poprzedniej strony
- **Działa na wszystkich urządzeniach dotykowych**

### Klawiatura (głównie dla developmentu)

- **Alt + Strzałka w lewo**: Cofa do poprzedniej strony
- **Backspace** (gdy nie jesteś w polu tekstowym): Cofa do poprzedniej strony

## 4. Konfiguracja

Wszystkie funkcjonalności zostały zaimplementowane w `src/App.jsx` przy użyciu hooków:

- `useBackNavigation` - obsługa przycisku "wstecz" i klawiatury
- `useSwipeBackGesture` - obsługa gestów dotykowych

### Dostosowywanie ścieżek wyjścia

```javascript
useBackNavigation({
  exitRoutes: ["/", "/login"], // Dodaj ścieżki, gdzie "wstecz" zamyka aplikację
  enableKeyboard: true,
  enableAndroidBack: true,
});
```

### Dostosowywanie gestów

```javascript
useSwipeBackGesture({
  enabled: true,
  minDistance: 80, // Minimalna odległość przesunięcia
  edgeThreshold: 30, // Odległość od krawędzi do rozpoczęcia gestu
});
```

## 5. Testowanie

- **Android**: Testuj na prawdziwym urządzeniu lub emulatorze z Androidem
- **Przeglądarka**: Użyj klawiszy Alt + Strzałka w lewo lub Backspace
- **iOS/Touch**: Przesuń palcem w prawo od lewej krawędzi ekranu
