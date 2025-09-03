# Dashboard Cache i Pull-to-Refresh

## Przegląd

Dodano wsparcie dla cache i pull-to-refresh w DashboardPage oraz DashboardHeader. Te funkcjonalności poprawiają wydajność aplikacji i doświadczenie użytkownika.

## Nowe funkcjonalności

### 1. Cache danych dashboardu

- **TTL (Time To Live)**: 5 minut
- **Storage**: Pamięć lokalna (Map) - dane są zachowane tylko podczas sesji
- **Zakres**: Wszystkie dane dashboardu (eco challenges, eco actions, teacher stats)
- **Klucze cache**: Unikalne dla każdego użytkownika i klasy

### 2. Pull-to-refresh

- **Threshold**: 80px przeciągnięcia w dół
- **Platformy**: Obsługa zarówno touch (mobile) jak i desktop (przycisk)
- **Wskaźnik**: Wizualny feedback dla użytkownika
- **Animacje**: Smooth transitions i loading states

### 3. Ulepszone UI

- **DashboardHeader**: Dodano przycisk odświeżania i informacje o cache
- **Timestamp**: Wyświetlanie czasu ostatniego odświeżenia
- **Loading states**: Wszystkie komponenty mają poprawne loading states

## Pliki zmodyfikowane

### Nowe pliki

- `src/hooks/useDashboardData.js` - Hook do zarządzania danymi dashboardu z cache

### Zmodyfikowane pliki

- `src/pages/DashboardPage.jsx` - Główna strona dashboardu z pull-to-refresh
- `src/components/dashboard/DashboardHeader.jsx` - Header z przyciskiem odświeżania

## Użycie

### Hook useDashboardData

```javascript
const {
  data, // Dane dashboardu (ecoChallenge, ecoActions, teacherStats, etc.)
  loading, // Loading states dla poszczególnych sekcji
  errors, // Błędy dla poszczególnych sekcji
  isAnyLoading, // Czy jakakolwiek sekcja się ładuje
  lastRefresh, // Timestamp ostatniego odświeżenia
  refreshAll, // Funkcja do force refresh wszystkich danych
  clearCache, // Funkcja do czyszczenia cache
  isTeacher, // Czy użytkownik to nauczyciel
} = useDashboardData(currentUser);
```

### Pull-to-refresh

```javascript
const {
  isPulling, // Czy użytkownik przeciąga
  isRefreshing, // Czy trwa odświeżanie
  progress, // Postęp 0-100%
  containerRef, // Ref do kontenera scroll
} = usePullToRefresh(refreshAll, {
  threshold: 80,
  enabled: true,
});
```

## Konfiguracja cache

```javascript
const CACHE_TTL = 5 * 60 * 1000; // 5 minut
```

### Struktura klucza cache

`dashboard_{type}_{userId}_{classId}`

Gdzie:

- `type`: ecoChallenge, ecoActions, teacher
- `userId`: ID użytkownika
- `classId`: ID klasy (lub 'no-class'/'global')

## Korzyści

1. **Wydajność**: Mniej zapytań do API dzięki cache
2. **UX**: Szybsze ładowanie danych z cache
3. **Offline resilience**: Dane dostępne z cache gdy API niedostępne
4. **Mobile-friendly**: Native pull-to-refresh behavior
5. **Desktop support**: Przycisk odświeżania dla użytkowników desktop

## Behawior

### Pierwsza wizyta

1. Dane ładowane z API
2. Zapisywane do cache
3. Wyświetlane użytkownikowi

### Kolejne wizyty (w czasie TTL)

1. Dane ładowane natychmiast z cache
2. Wyświetlana informacja "Dane z cache • X min temu"
3. Możliwość force refresh przez pull-to-refresh lub przycisk

### Po wygaśnięciu TTL

1. Cache automatycznie wygasa
2. Następne wejście powoduje pobieranie z API
3. Nowe dane zapisywane do cache

## Testowanie

Aby przetestować nowe funkcjonalności:

1. **Cache**: Odwiedź dashboard, odśwież stronę - dane powinny ładować się natychmiast
2. **Pull-to-refresh**: Na mobile przeciągnij w dół od góry strony
3. **Desktop refresh**: Kliknij przycisk odświeżania w headerze
4. **TTL**: Poczekaj 5+ minut i sprawdź czy dane są pobierane ponownie z API
