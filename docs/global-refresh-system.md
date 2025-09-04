# System Globalnego Odświeżania Danych

## Przegląd

System pozwala na globalne odświeżanie danych z poziomu navbara lub innych miejsc w aplikacji. Komponenty mogą rejestrować swoje funkcje odświeżania, które są wywoływane jednocześnie gdy użytkownik kliknie przycisk odświeżania.

## Struktura

### 1. `RefreshContext.jsx`

Główny context zarządzający systemem:

- `RefreshProvider` - provider do owinięcia aplikacji
- `useGlobalRefresh()` - hook do obsługi globalnego odświeżania
- `useRegisterRefresh(id, refreshFn)` - hook do rejestracji funkcji odświeżania

### 2. `RefreshButton.jsx`

Komponent przycisku odświeżania z różnymi wariantami:

- `variant="navbar"` - dla navbara (przezroczyste tło)
- `variant="button"` - standardowy przycisk (zielone tło)
- `variant="floating"` - pływający przycisk (białe tło z cieniem)

## Jak używać

### 1. Dodanie providera (już zrobione w `main.jsx`)

```jsx
<RefreshProvider>
  <App />
</RefreshProvider>
```

### 2. Dodanie przycisku do navbara (już zrobione)

```jsx
import RefreshButton from "../ui/RefreshButton";

// W navbarze
<RefreshButton size="sm" variant="navbar" />;
```

### 3. Rejestracja funkcji odświeżania w komponencie

#### Opcja A: Używając istniejącej funkcji odświeżania

```jsx
import { useRegisterRefresh } from "../contexts/RefreshContext";

export default function MyPage() {
  const handleRefresh = useCallback(async () => {
    // Twoja logika odświeżania
    await loadData();
  }, []);

  // Zarejestruj funkcję w systemie globalnym
  useRegisterRefresh("my-page", handleRefresh);

  // reszta komponentu...
}
```

#### Opcja B: Używając hooka testowego (tymczasowo)

```jsx
import { useRefreshTest } from "../hooks/useRefreshTest";

export default function MyPage() {
  // Hook testowy - wyświetla logi w konsoli
  useRefreshTest("my-page", "Refreshing my page data...");

  // reszta komponentu...
}
```

### 4. Dodanie dodatkowych przycisków w innych miejscach

```jsx
// Standardowy przycisk
<RefreshButton
  variant="button"
  size="default"
  showText={true}
/>

// Pływający przycisk
<RefreshButton
  variant="floating"
  size="lg"
  className="fixed bottom-4 right-4 z-50"
/>
```

## Aktualny stan implementacji

✅ **Zaimplementowane:**

- `RefreshContext` z pełną funkcjonalnością
- `RefreshButton` z różnymi wariantami
- Integracja z navbarem
- Rejestracja w `DashboardPage` i `ActivityPage`
- Test hook w `ProfilePage`

✅ **Dodane do aplikacji:**

- Provider w `main.jsx`
- Przycisk w `Navbar.jsx`
- Hooki w stronach z danymi do odświeżenia

## Testy

Po wdrożeniu, przycisk odświeżania w navbarze powinien:

1. Pokazać animację kręcenia podczas odświeżania
2. Wywoływać funkcje odświeżania wszystkich zarejestrowanych komponentów
3. Wyświetlać logi w konsoli (dla stron z `useRefreshTest`)

## Możliwe rozszerzenia

1. **Selektywne odświeżanie** - możliwość odświeżania tylko określonych kategorii danych
2. **Statusy odświeżania** - pokazywanie które komponenty się odświeżają
3. **Automatyczne odświeżanie** - timer lub inne triggery
4. **Wskaźnik postępu** - pokazywanie postępu odświeżania
5. **Toast notifications** - powiadomienia o sukcesie/błędach

## Debugowanie

W konsoli deweloperskiej zobaczysz logi:

- `🔄 Refreshing... (component-id)` - rozpoczęcie odświeżania
- `✅ Refresh completed for component-id` - zakończenie odświeżania
