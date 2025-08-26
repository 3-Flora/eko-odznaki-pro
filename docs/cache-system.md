# System Cache'owania Danych

## Przegląd

Aplikacja została wyposażona w zaawansowany system cache'owania danych, który:

- **Automatycznie odświeża dane** co określony czas
- **Odświeża dane przy powrocie do aplikacji** (focus)
- **Pozwala na ręczne odświeżanie** przez przeciągnięcie w dół (pull-to-refresh)
- **Zarządza stanem ładowania** i błędami
- **Optymalizuje wydajność** przez unikanie niepotrzebnych zapytań

## Struktura

### 1. Cache Service (`src/services/cacheService.js`)

Główny serwis zarządzający cache'em:

```javascript
import cacheService, {
  useAssignedChallenges,
  useEcoActionsForDashboard,
  useAllEcoActions,
  useActivityFeed,
  useUsersRanking,
} from "../services/cacheService";
```

**Funkcje pomocnicze:**

- `getAssignedChallenges(classId)` - pobiera aktywne wyzwania dla klasy
- `getEcoActionsForDashboard()` - pobiera 3 EkoDziałania na dashboard
- `getAllEcoActions()` - pobiera wszystkie EkoDziałania
- `getActivityFeed(classId)` - pobiera feed aktywności
- `getUsersRanking()` - pobiera ranking użytkowników

**Konfiguracja cache'a:**

- Assigned Challenges: 2 minuty
- EcoActions Dashboard: 10 minut
- All EcoActions: 10 minut
- Activity Feed: 1 minuta
- Users Ranking: 5 minut

### 2. Data Cache Context (`src/contexts/DataCacheContext.jsx`)

React Context providing cache functionality:

```javascript
import { useCachedData, useDataCache } from "../contexts/DataCacheContext";

// W komponencie:
const { data, isLoading, error, refresh, invalidate } = useCachedData(
  key,
  fetchFunction,
  options,
);
```

### 3. Pull to Refresh (`src/components/ui/PullToRefresh.jsx`)

Komponent umożliwiający odświeżanie przez przeciągnięcie:

```javascript
import PullToRefresh from '../components/ui/PullToRefresh';

// Podstawowe użycie (odświeża wszystkie dane):
<PullToRefresh>
  {children}
</PullToRefresh>

// Z custom funkcją odświeżania:
<PullToRefresh onRefresh={customRefreshFunction}>
  {children}
</PullToRefresh>
```

## Użycie w Komponentach

### Przykład - Dashboard Page

```javascript
import { useCachedData } from "../contexts/DataCacheContext";
import { useEcoActionsForDashboard } from "../services/cacheService";

export default function DashboardPage() {
  const ecoActionsConfig = useEcoActionsForDashboard();

  const {
    data: ecoActions,
    isLoading: loadingEcoActions,
    error,
    refresh,
  } = useCachedData(
    ecoActionsConfig.key,
    ecoActionsConfig.fetchFunction,
    ecoActionsConfig.options,
  );

  return (
    <PullToRefresh>
      {loadingEcoActions ? (
        <Skeleton />
      ) : (
        <ActionsCarousel data={ecoActions || []} />
      )}
    </PullToRefresh>
  );
}
```

## Funkcjonalności

### Automatyczne Odświeżanie

- **Po czasie cache'a** - dane są automatycznie odświeżane gdy osiągną maksymalny wiek
- **Pri fokusie aplikacji** - gdy użytkownik wraca do aplikacji, stare dane (>1min) są odświeżane
- **Inteligentne planowanie** - każdy typ danych ma swoją częstotliwość odświeżania

### Pull-to-Refresh

- **Gestykulacja w dół** - przeciągnij w dół aby odświeżyć
- **Wizualny feedback** - ikona i tekst pokazują postęp
- **Elastyczny efekt** - rubber band effect podczas przeciągania
- **Threshold** - 80px domyślny próg aktywacji

### Zarządzanie Stanem

- **Loading states** - wskazuje kiedy dane są pobierane
- **Error handling** - obsługuje błędy z graceful fallback
- **Data persistence** - dane pozostają dostępne nawet przy błędach

## Wskaźnik Statusu Cache'a

Opcjonalny komponent do pokazania statusu danych:

```javascript
import CacheStatusIndicator from "../components/ui/CacheStatusIndicator";

<CacheStatusIndicator
  lastFetch={lastFetch}
  isLoading={isLoading}
  error={error}
/>;
```

## Korzyści

1. **Lepsza wydajność** - mniej zapytań do bazy danych
2. **Lepsza UX** - szybsze ładowanie, smooth transitions
3. **Offline-ready** - dane dostępne nawet przy problemach z siecią
4. **Automatyczne zarządzanie** - nie trzeba pamiętać o odświeżaniu
5. **Flexibility** - łatwe dostosowanie dla różnych typów danych

## Debugowanie

W trybie development, cache status jest logowany do konsoli:

```
Cache [ecoActions_dashboard]: {
  lastFetch: '2025-08-25T10:30:00.000Z',
  isLoading: false,
  error: null,
  age: '145s'
}
```

## Rozszerzanie

Aby dodać nowe dane do cache'a:

1. **Utwórz fetch function** w `cacheService.js`:

```javascript
export const getMyNewData = async () => {
  // fetch logic
};

export const useMyNewData = () => ({
  key: "myNewData",
  fetchFunction: getMyNewData,
  options: { maxAge: 5 * 60 * 1000 }, // 5 minut
});
```

2. **Użyj w komponencie**:

```javascript
const config = useMyNewData();
const { data, isLoading } = useCachedData(
  config.key,
  config.fetchFunction,
  config.options,
);
```
