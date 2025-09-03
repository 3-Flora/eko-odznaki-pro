# Demonstracja systemu limitów zgłoszeń

## 🎯 Implementacja kompletna

System wyświetlania informacji o tym, ile zostało do wysłania dla każdego EkoDziałania i EkoWyzwania został w pełni zaimplementowany.

## 📱 Gdzie można zobaczyć limity

### 1. **Strona główna aktywności (ActivityPage)**

#### Przegląd limitów (nowa sekcja)

- **Lokalizacja**: Między nagłówkiem a listą aktywności
- **Komponent**: `ActivityLimitsOverview`
- **Co pokazuje**:
  - Przegląd wszystkich EkoDziałań z limitami
  - Informację o EkoWyzwaniach (1 na tydzień)
  - Dla każdego EkoDziałania: obecny stan/limit + pozostałe zgłoszenia

#### Karty EkoDziałań

- **Komponent**: `SubmissionLimitsBadge`
- **Co pokazuje**:
  - ✅ **Możesz zgłosić**: `"2 dzisiaj (1/3)"` lub `"3 w tygodniu (2/5)"`
  - ⚠️ **Limit osiągnięty**: `"Limit osiągnięty (3/3)"`
  - 🔵 **Bez limitów**: `"Bez limitów"`

### 2. **Strona zgłaszania aktywności (SubmitActivityPage)**

#### Szczegółowe informacje o limitach

- **Komponent**: `SubmissionLimitsInfo`
- **Co pokazuje**:
  - Pełny opis możliwości zgłaszania
  - **Możesz zgłosić**:

    ```text
    ✅ Możesz zgłosić tę aktywność
    🕐 Dzisiaj: 1/3 (pozostało: 2)
    📅 W tym tygodniu: 3/10 (pozostało: 7)
    ```

  - **Limit osiągnięty**:

    ```text
    ⚠️ Limit osiągnięty
    Osiągnąłeś maksymalną liczbę zgłoszeń dzisiaj (3/3)
    📅 Reset: jutro o 00:00
    ```

## 🎨 Rodzaje wyświetlanych informacji

### Kolory i stany

- 🟢 **Zielony**: Możesz zgłaszać, dużo pozostałych zgłoszeń
- 🟠 **Pomarańczowy**: Możesz zgłaszać, ale zostało mało (≤1)
- 🔴 **Czerwony**: Limit osiągnięty
- 🔵 **Niebieski**: Brak limitów

### Przykłady wyświetlanych tekstów

#### Na kartach EkoDziałań

```text
✅ 2 dzisiaj (1/3)           // Pozostało 2, użyto 1 z 3 dzisiaj
✅ 3 w tygodniu (2/5)        // Pozostało 3, użyto 2 z 5 w tygodniu
⚠️ Limit osiągnięty (3/3)    // Osiągnięty limit dzienny/tygodniowy
🔵 Bez limitów               // Aktywność bez ograniczeń
```

#### Na stronie zgłaszania

```text
✅ Możesz zgłosić tę aktywność
🕐 Dzisiaj: 1/3 (pozostało: 2)
📅 W tym tygodniu: 3/10 (pozostało: 7)
```

```text
⚠️ Limit osiągnięty
Osiągnąłeś maksymalną liczbę zgłoszeń dzisiaj (3/3)
📅 Reset: jutro o 00:00
```

## 🔧 Komponenty zaimplementowane

1. **`SubmissionLimitsBadge`** - Kompaktowe wyświetlanie na kartach
2. **`SubmissionLimitsInfo`** - Szczegółowe informacje na stronie zgłaszania
3. **`ActivityLimitsOverview`** - Przegląd wszystkich limitów na stronie głównej
4. **`ActionLimitSummary`** - Pojedyncza aktywność w przeglądzie

## 📋 Przykładowe dane testowe

W pliku `src/data/ecoActionsData.js` znajdują się przykładowe EkoDziałania z limitami:

```javascript
"gaszenie-swiatla": {
  name: "Gaszenie światła",
  maxDaily: 3,      // 3 razy dziennie
  maxWeekly: 10,    // 10 razy w tygodniu
  // ...
},
"segregacja-odpadow": {
  name: "Segregacja odpadów",
  maxDaily: 2,      // 2 razy dziennie
  maxWeekly: 7,     // 7 razy w tygodniu
  // ...
}
```

## ✨ Funkcje dodatkowe

- **Automatyczne odświeżanie** po zgłoszeniu aktywności
- **Responsywny design** - działa na telefonach i tabletach
- **Dark mode** - pełne wsparcie trybu ciemnego
- **Walidacja w czasie rzeczywistym** - sprawdzanie limitów przed zgłoszeniem
- **Inteligentne wyświetlanie** - pokazuje najbardziej restrykcyjny limit

System jest gotowy do użycia! 🚀
