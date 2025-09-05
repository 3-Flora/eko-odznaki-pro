# Teacher Submissions Page Cache System

## Przegląd

Zaimplementowano system cache dla `TeacherSubmissionsPage.jsx` z funkcjonalnością pull-to-refresh i integracją z globalnym systemem odświeżania danych.

## Nowe funkcjonalności

### 1. Cache danych zgłoszeń

- **TTL (Time To Live)**: 5 minut
- **Storage**: Pamięć lokalna (Map) - dane są zachowane tylko podczas sesji
- **Zakres**: Wszystkie dane strony (submissions, ecoActions, ecoChallenges, nazwy klas/szkół)
- **Klucze cache**: Unikalne dla każdej klasy i opcjonalnie filtrowanego ucznia

### 2. Pull-to-refresh

- **Threshold**: 80px przeciągnięcia w dół
- **Platformy**: Obsługa zarówno touch (mobile) jak i desktop
- **Wskaźnik**: Wizualny feedback dla użytkownika
- **Animacje**: Smooth transitions i loading states

### 3. Integracja z globalnym systemem odświeżania

- **Rejestracja**: Automatyczna rejestracja w `RefreshContext`
- **ID komponentu**: `teacher-submissions`
- **Trigger**: Przycisk odświeżania w navbarze

### 4. Ulepszone UI

- **Cache info**: Wyświetlanie informacji o czasie ostatniego odświeżenia
- **Loading states**: Poprawne loading states podczas odświeżania

## Implementacja

### Cache Configuration

```javascript
const CACHE_TTL = 5 * 60 * 1000; // 5 minut
const submissionsCache = new Map();
```

### Struktura klucza cache

`teacher_submissions_{classId}_{studentId}`

Gdzie:

- `classId`: ID klasy nauczyciela
- `studentId`: ID ucznia (jeśli filtrujemy) lub "all"

### Główne funkcje

#### `loadSubmissions(forceRefresh = false)`

- Główna funkcja ładowania danych
- Sprawdza cache jeśli `forceRefresh = false`
- Pobiera wszystkie potrzebne dane z API
- Zapisuje dane do cache

#### `refreshAll()`

- Funkcja odświeżania dla pull-to-refresh i globalnego systemu
- Wywołuje `loadSubmissions(true)` - wymusza pominięcie cache

#### Cache utilities

- `getCacheKey(classId, studentId)` - generuje klucz cache
- `getCachedData(key)` - pobiera dane z cache z walidacją TTL
- `setCachedData(key, data)` - zapisuje dane do cache z timestampem

## Struktura danych w cache

```javascript
{
  submissions: [...], // Lista zgłoszeń
  ecoActions: [...],  // Lista EkoDziałań
  ecoChallenges: [...], // Lista EkoWyzwań
  className: "...",   // Nazwa klasy
  schoolName: "..."   // Nazwa szkoły
}
```

## Użycie

### Pull-to-refresh

Automatycznie dostępne na urządzeniach mobilnych - przeciągnij w dół od góry strony.

### Globalny refresh

Kliknij przycisk odświeżania w navbarze - odświeży dane na wszystkich zarejestrowanych stronach.

### Cache behavior

#### Pierwsza wizyta

1. Dane ładowane z API
2. Zapisywane do cache
3. Wyświetlane użytkownikowi

#### Kolejne wizyty (w czasie TTL)

1. Dane ładowane natychmiast z cache
2. Wyświetlana informacja "Dane z cache • X min temu"
3. Możliwość force refresh przez pull-to-refresh lub przycisk globalny

#### Po wygaśnięciu TTL

1. Cache automatycznie wygasa
2. Następne wejście powoduje pobieranie z API
3. Nowe dane zapisywane do cache

## Korzyści

1. **Wydajność**: Mniej zapytań do Firestore dzięki cache
2. **UX**: Szybsze ładowanie danych z cache
3. **Offline resilience**: Dane dostępne z cache gdy API niedostępne
4. **Mobile-friendly**: Native pull-to-refresh behavior
5. **Desktop support**: Przycisk odświeżania dla użytkowników desktop
6. **Spójność**: Unifikacja z systemem odświeżania całej aplikacji

## Pliki zmodyfikowane

### Zmodyfikowane pliki

- `src/pages/TeacherSubmissionsPage.jsx` - Dodano system cache i pull-to-refresh

### Nowe importy

- `useCallback`, `useMemo` z React
- `useRegisterRefresh` z RefreshContext
- `PullToRefreshWrapper` component

## Testowanie

Aby przetestować nowe funkcjonalności:

1. **Cache**: Odwiedź stronę zgłoszeń, odśwież stronę - dane powinny ładować się natychmiast
2. **Pull-to-refresh**: Na mobile przeciągnij w dół od góry strony
3. **Global refresh**: Kliknij przycisk odświeżania w navbarze
4. **TTL**: Poczekaj 5+ minut i sprawdź czy dane są pobierane ponownie z API
5. **Cache info**: Sprawdź czy wyświetla się informacja o czasie ostatniego odświeżenia

## Debugowanie

W konsoli deweloperskiej zobaczysz logi:

- `🔧 Registering refresh function for: teacher-submissions` - rejestracja w globalnym systemie
- `🧹 Cleaning up refresh function for: teacher-submissions` - czyszczenie przy unmount

## Możliwe rozszerzenia

1. **Invalidacja cache po akcjach**: Automatyczne czyszczenie cache po zatwierdzeniu/odrzuceniu zgłoszenia
2. **Selektywne odświeżanie**: Odświeżanie tylko określonych części danych
3. **Persistent cache**: Zapisywanie cache w localStorage dla lepszej wydajności
4. **Real-time updates**: WebSocket lub Firestore listeners dla live updates
