# Komponenty Powiadomień

## NotificationBell (z podglądem)

Główny komponent dzwonka z podglądem ostatnich powiadomień w popup'ie.

```jsx
import { NotificationBell } from "../components/notifications";

// Podstawowe użycie
<NotificationBell />

// Z konfiguracją
<NotificationBell
  size="large"
  showPreview={true}
/>
```

**Props:**

- `size`: "small" | "default" | "large" - rozmiar ikony
- `showPreview`: boolean - czy pokazywać podgląd (domyślnie true)

## SimpleNotificationBell (przekierowuje)

Prosty dzwonek, który przy kliknięciu przekierowuje do strony powiadomień.

```jsx
import { SimpleNotificationBell } from "../components/notifications";

// Podstawowe użycie
<SimpleNotificationBell />

// Z konfiguracją
<SimpleNotificationBell
  size="small"
  className="ml-2"
/>
```

**Props:**

- `size`: "small" | "default" | "large" - rozmiar ikony
- `className`: string - dodatkowe klasy CSS

## NotificationCenter

Główny komponent centrum powiadomień z filtrowaniem i zarządzaniem.

```jsx
import { NotificationCenter } from "../components/notifications";

<NotificationCenter onClose={() => navigate(-1)} />;
```

## CreateNotification

Formularz do tworzenia nowych powiadomień (dla nauczycieli i EkoSkopu).

```jsx
import { CreateNotification } from "../components/notifications";

<CreateNotification onClose={() => navigate(-1)} />;
```

## Hook: useNotifications

Hook do zarządzania stanem powiadomień z cache'owaniem.

```jsx
import { useNotifications } from "../hooks/useNotifications";

const {
  notifications,
  unreadCount,
  loading,
  error,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotifications,
  getRecentNotifications,
} = useNotifications();
```

## Debug

Komponent `NotificationDebug` w `/debug` pozwala na tworzenie testowych powiadomień:

- Powiadomienia informacyjne
- Przypomnienia
- Alerty
- Powiadomienia globalne
- Powiadomienia dla klasy

## Optymalizacje

- Cache 5-minutowy dla powiadomień
- Pojedyncze zapytanie do Firestore zamiast wielu
- Filtrowanie po stronie klienta
- Automatyczne odświeżanie co 10 minut
- Memoizowane wartości pochodne
