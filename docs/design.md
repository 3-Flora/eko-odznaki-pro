# Design System Guide - EkoOdznaki

Kompletny przewodnik stylistyczny aplikacji **EkoOdznaki** - systemu gamifikacji edukacji ekologicznej.

## 📱 O aplikacji

**EkoOdznaki** to innowacyjna aplikacja edukacyjna, która motywuje uczniów do podejmowania działań proekologicznych poprzez system odznak i wyzwań. Aplikacja łączy edukację ekologiczną z elementami gamifikacji, tworząc angażujące środowisko nauki.

### Główne funkcjonalności

- 🌱 **EkoDziałania** - zgłaszanie i weryfikacja przez nauczyciela działań ekologicznych
- 🏆 **System odznak** - wielopoziomowe osiągnięcia za różne aktywności
- 🎯 **EkoWyzwania** - czasowe wyzwania dla uczniów
- 👥 **Zarządzanie użytkownikami** - struktura Szkoła → Klasa → Uczniowie
- 📊 **Śledzenie postępu** - ranking i statystyki
- 🔧 **Panel administracyjny** - zarządzanie systemem

---

## 🎨 Paleta kolorów

### Kolory główne

```css
/* Zielony (Primary) - główny kolor aplikacji, symbolizuje ekologię */
--green-50: #f0fdf4 --green-100: #dcfce7 --green-200: #bbf7d0
  --green-300: #86efac --green-400: #4ade80 --green-500: #22c55e
  /* Główny zielony */ --green-600: #16a34a /* Hover states */
  --green-700: #15803d /* Dark mode variant */ --green-800: #166534
  --green-900: #14532d
  /* Niebieski (Secondary) - wspiera zielony, reprezentuje czystość */
  --blue-50: #eff6ff --blue-100: #dbeafe --blue-200: #bfdbfe --blue-300: #93c5fd
  --blue-400: #60a5fa --blue-500: #3b82f6 /* Główny niebieski */
  --blue-600: #2563eb /* Hover states */ --blue-700: #1d4ed8 --blue-800: #1e40af
  --blue-900: #1e3a8a /* Dark mode variant */
  /* Szary (Neutral) - tekst i tła */ --gray-50: #f9fafb /* Jasne tła */
  --gray-100: #f3f4f6 /* Borders, separatory */ --gray-200: #e5e7eb
  --gray-300: #d1d5db --gray-400: #9ca3af /* Placeholders */ --gray-500: #6b7280
  /* Secondary text */ --gray-600: #4b5563 /* Primary text light mode */
  --gray-700: #374151 --gray-800: #1f2937 /* Dark mode backgrounds */
  --gray-900: #111827 /* Dark mode text */;
```

### Kolory funkcjonalne

```css
/* Sukces - potwierdzenia, zatwierdzone działania */
--emerald-50: #ecfdf5 --emerald-100: #d1fae5 --emerald-400: #34d399
  --emerald-500: #10b981 /* Success states */ --emerald-600: #059669
  /* Success hover */ --emerald-700: #047857
  /* Ostrzeżenie - oczekujące działania, uwagi */ --yellow-50: #fffbeb
  --yellow-100: #fef3c7 --yellow-400: #fbbf24 --yellow-500: #f59e0b
  /* Warning states */ --yellow-600: #d97706 /* Warning hover */
  --yellow-700: #b45309 /* Błąd - odrzucone działania, errory */
  --red-50: #fef2f2 --red-100: #fee2e2 --red-400: #f87171 --red-500: #ef4444
  /* Error states */ --red-600: #dc2626 /* Error hover */ --red-700: #b91c1c
  /* Informacja - różne kategorie działań */ --teal-500: #14b8a6
  /* Oszczędzanie wody */ --purple-500: #a855f7 /* Edukacja */
  --orange-500: #f97316 /* Transport */ --indigo-500: #6366f1
  /* Dodatkowe kategorie */;
```

---

## 🌙 System Dark Mode

Aplikacja w pełni wspiera tryb ciemny z automatycznym przełączaniem na podstawie preferencji systemu.

### Implementacja

```css
/* Podstawowe tła */
.bg-white dark:bg-gray-800
.bg-gray-50 dark:bg-gray-900
.bg-gray-100 dark:bg-gray-800

/* Tekst */
.text-gray-900 dark:text-white
.text-gray-800 dark:text-gray-100
.text-gray-600 dark:text-gray-300
.text-gray-500 dark:text-gray-400

/* Bordery */
.border-gray-200 dark:border-gray-700
.border-gray-300 dark:border-gray-600

/* Gradienty - dostosowane do trybu ciemnego */
.bg-gradient-to-r from-green-400 to-blue-500
dark:from-green-700 dark:to-blue-900

/* Cienie - subtelniejsze w dark mode */
.shadow-lg dark:shadow-gray-900/25
```

### Zasady Dark Mode

1. **Kontrastowość** - zachowanie czytelności w obu trybach
2. **Spójność** - wszystkie komponenty mają warianty dark mode
3. **Automatyzacja** - przełączanie na podstawie preferencji systemu
4. **Bateria** - ciemne tło oszczędza baterię na OLED

---

## 📐 Typografia

### Hierarchia czcionek

```css
/* Display - główne nagłówki stron */
.text-4xl  /* 36px - tytuły główne */
.text-3xl  /* 30px - nagłówki sekcji */

/* Headings - nagłówki treści */
.text-2xl  /* 24px - tytuły kart, modali */
.text-xl   /* 20px - podnagłówki */
.text-lg   /* 18px - ważne elementy */

/* Body - tekst podstawowy */
.text-base /* 16px - tekst standardowy */
.text-sm   /* 14px - tekst pomocniczy */

```

### Wagi i style

```css
/* Wagi */
.font-bold      /* 700 - nagłówki główne */
.font-semibold  /* 600 - ważne informacje */
.font-medium    /* 500 - podkreślenia, przyciski */
.font-normal    /* 400 - tekst standardowy */
.font-light     /* 300 - tekst pomocniczy */

/* Style */
.italic         /* Cytaty, komentarze */
.not-italic     /* Reset italics */
.uppercase      /* Statusy, kategorie */
.normal-case    /* Reset uppercase */
```

### Przykłady zastosowania

```jsx
/* Nagłówek strony */
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
  EkoDziałania
</h1>

/* Tytuł karty */
<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
  Nowe zgłoszenie
</h2>

/* Tekst podstawowy */
<p className="text-base text-gray-600 dark:text-gray-300">
  Opisz swoje działanie ekologiczne...
</p>

/* Metadane */
<span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
  2 dni temu
</span>
```

---

## 🔲 Geometria i layout

### Zaokrąglenia (Border Radius)

```css
/* Hierarchia zaokrągleń */
.rounded-sm   /* 2px - małe elementy */
.rounded      /* 4px - domyślne */
.rounded-md   /* 6px - większe elementy */
.rounded-lg   /* 8px - karty standardowe */
.rounded-xl   /* 12px - karty główne */
.rounded-2xl  /* 16px - sekcje, kontenery */
.rounded-3xl  /* 24px - główne sekcje */
.rounded-full /* 50% - awatary, ikony, przyciski okrągłe */

/* Przykłady zastosowania */
.rounded-lg   /* Przyciski, pola formularzy */
.rounded-xl   /* Karty EkoDziałań */
.rounded-2xl  /* Główne sekcje, dashboardy */
.rounded-full /* Awatary użytkowników, liczniki odznak */
```

### Cienie (Shadows)

```css
/* Hierarchia cieni */
.shadow-none  /* Brak cienia */
.shadow-sm    /* Subtelne - małe elementy */
.shadow       /* Standardowe - przyciski */
.shadow-md    /* Średnie - karty */
.shadow-lg    /* Duże - modalne, flyouts */
.shadow-xl    /* Bardzo duże - główne sekcje */
.shadow-2xl   /* Największe - overlays */

/* Kolory cieni dla dark mode */
.shadow-gray-900/10   /* Light mode */
.dark:shadow-gray-900/25  /* Dark mode - intensywniejsze */

/* Przykłady */
.shadow-lg    /* Karty EkoDziałań */
.shadow-xl    /* Modalne okna */
.shadow-sm    /* Przyciski secondary */
```

### Odstępy (Spacing)

```css
/* System 4px - wszystkie odstępy to wielokrotności 4px */

/* Padding */
.p-1   /* 4px - bardzo małe */
.p-2   /* 8px - małe elementy */
.p-3   /* 12px - średnie */
.p-4   /* 16px - standardowe */
.p-5   /* 20px - większe */
.p-6   /* 24px - karty */
.p-8   /* 32px - sekcje */
.p-10  /* 40px - główne kontenery */
.p-12  /* 48px - bardzo duże sekcje */

/* Margin */
.m-2   /* 8px - małe odstępy */
.m-4   /* 16px - standardowe */
.m-6   /* 24px - między sekcjami */
.m-8   /* 32px - duże odstępy */

/* Gap w gridach/flexach */
.gap-1  /* 4px - gęste układy */
.gap-2  /* 8px - małe */
.gap-3  /* 12px - średnie */
.gap-4  /* 16px - standardowe */
.gap-6  /* 24px - przestronne */
.gap-8  /* 32px - bardzo przestronne */

/* Specific spacing examples */
.space-y-4  /* Vertical spacing między children */
.space-x-2  /* Horizontal spacing między children */
```

---

## 🎯 Komponenty UI

### Przyciski

#### Primary (Główne działania)

```jsx
<button className="inline-flex items-center justify-center rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-600 focus:ring-2 focus:ring-green-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700">
  Zapisz działanie
</button>
```

#### Secondary (Działania pomocnicze)

```jsx
<button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
  Anuluj
</button>
```

#### Danger (Działania niebezpieczne)

```jsx
<button className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-600 focus:ring-2 focus:ring-red-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700">
  Usuń
</button>
```

#### Ghost (Subtelne działania)

```jsx
<button className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
  Szczegóły
</button>
```

### Karty

#### Standardowa karta

```jsx
<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
  {/* Zawartość karty */}
</div>
```

#### Karta z hover efektem

```jsx
<div className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
  {/* Zawartość karty */}
</div>
```

#### Karta EkoDziałania

```jsx
<div className="rounded-xl border-l-4 border-green-500 bg-white p-4 shadow-lg dark:bg-gray-800">
  {/* Status, tytuł, opis, punkty */}
</div>
```

### Pola formularzy

#### Input tekstowy

```jsx
<input className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400" />
```

#### Textarea

```jsx
<textarea
  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
  rows="4"
/>
```

#### Select

```jsx
<select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white">
  <option>Wybierz kategorię</option>
</select>
```

### Odznaki (Badges)

#### Status badge

```jsx
<span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
  Zatwierdzone
</span>
```

#### Counter badge

```jsx
<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
  3
</span>
```

---

## 🌈 System kolorów kategorii

### Kategorie EkoDziałań

```javascript
const categoryColors = {
  Recykling: {
    icon: "♻️",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    description: "Segregacja odpadów, ponowne wykorzystanie",
  },
  Edukacja: {
    icon: "📚",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
    description: "Nauka o ekologii, dzielenie się wiedzą",
  },
  Oszczędzanie: {
    icon: "💡",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-200 dark:border-yellow-800",
    description: "Oszczędzanie wody, energii, zasobów",
  },
  Transport: {
    icon: "🚲",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-200 dark:border-orange-800",
    description: "Ekologiczne środki transportu",
  },
};
```

### Statusy zgłoszeń

```javascript
const statusConfig = {
  approved: {
    icon: "CheckCircle",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    label: "Zatwierdzone",
    description: "Działanie zostało zweryfikowane i zaakceptowane",
  },
  pending: {
    icon: "Clock",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-200 dark:border-yellow-800",
    label: "Oczekujące",
    description: "Działanie oczekuje na weryfikację nauczyciela",
  },
  rejected: {
    icon: "XCircle",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800",
    label: "Odrzucone",
    description: "Działanie nie spełnia kryteriów",
  },
};
```

### Poziomy odznak

```javascript
const badgeLevels = {
  1: {
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    ring: "ring-gray-300 dark:ring-gray-600",
    name: "Początkujący",
  },
  2: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    ring: "ring-yellow-300 dark:ring-yellow-700",
    name: "Zaawansowany",
  },
  3: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    ring: "ring-blue-300 dark:ring-blue-700",
    name: "Ekspert",
  },
  4: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    ring: "ring-purple-300 dark:ring-purple-700",
    name: "Mistrz",
  },
};
```

---

## 🎭 Animacje (Framer Motion)

### Standardowe wejścia

```jsx
// Fade in z przesunięciem od dołu
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Fade in z przesunięciem od lewej
const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Scale in - dla modali
const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: "easeOut" },
};
```

### Animacje list i grid'ów

```jsx
// Opóźnione animacje dla elementów listy
const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const listItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

// Przykład użycia
<motion.div variants={staggerChildren} initial="initial" animate="animate">
  {items.map((item, index) => (
    <motion.div key={item.id} variants={listItem}>
      {/* Zawartość elementu */}
    </motion.div>
  ))}
</motion.div>
```

### Hover i interakcje

```jsx
// Subtelne powiększenie przy hover
const cardHover = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Efekt przycisku
const buttonPress = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};
```

### Loading states

```jsx
// Pulsujący szkielet
const skeleton = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Spinner rotation
const spinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
```

### Szkielety ładowania

```jsx
// Szkielet karty
<div className="animate-pulse">
  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
  <div className="h-20 w-full rounded bg-gray-200 dark:bg-gray-700" />
</div>

// Szkielet awatara
<div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

// Szkielet tekstu
<div className="space-y-2">
  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
  <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
  <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
</div>
```

---

## 🔄 Responsywność

### Breakpoints (Tailwind domyślne)

```css
/* Mobile first approach */
/* Default: mobile (0px+) */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Grid systemy

```css
/* Responsywne gridy */
.grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Przykłady dla różnych komponentów */
/* Karty EkoDziałań */
.grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

/* Odznaki */
.grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6

/* Dashboard stats */
.grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

### Typografia responsywna

```css
/* Nagłówki */
.text-2xl sm:text-3xl lg:text-4xl

/* Tekst podstawowy */
.text-sm sm:text-base lg:text-lg

/* Odstępy responsywne */
.p-4 sm:p-6 lg:p-8
.gap-4 sm:gap-6 lg:gap-8
.space-y-4 sm:space-y-6 lg:space-y-8
```

### Ukrywanie/pokazywanie elementów

```css
/* Ukryj na mobile, pokaż na desktop */
.hidden lg:block

/* Pokaż na mobile, ukryj na desktop */
.block lg:hidden

/* Menu mobilne vs desktop */
.lg:hidden /* Hamburger menu - tylko mobile */
.hidden lg:flex /* Desktop navigation - tylko desktop */
```

### Przykłady komponentów responsywnych

```jsx
// Karta responsywna
<div className="
  p-4 sm:p-6
  rounded-lg sm:rounded-xl
  text-sm sm:text-base
  space-y-2 sm:space-y-3
">

// Navigation responsywne
<nav className="
  flex flex-col sm:flex-row
  space-y-2 sm:space-y-0 sm:space-x-4
  p-4 sm:p-6
">

// Grid responsywny
<div className="
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  gap-4 sm:gap-6 lg:gap-8
">
```

---

## 🌟 Wzorce i konwencje

### Hierarchia wizualna

```css
/* Ważność elementów przez rozmiar i wagę */
.text-3xl font-bold     /* Tytuły główne */
.text-xl font-semibold  /* Tytuły sekcji */
.text-lg font-medium    /* Podtytuły */
.text-base font-normal  /* Tekst podstawowy */
.text-sm text-gray-600  /* Tekst pomocniczy */
.text-sm text-gray-500  /* Metadane */
```

### Stany interaktywne

```css
/* Focus states - zawsze widoczne dla dostępności */
.focus:outline-none focus:ring-2 focus:ring-green-500/20

/* Hover states - subtelne zmiany */
.hover:bg-gray-50 transition-colors duration-200

/* Active/pressed states */
.active:scale-95 transform transition-transform

/* Disabled states */
.disabled:opacity-50 disabled:cursor-not-allowed
```

### Kontrast i dostępność

```css
/* Minimalne kontrasty (WCAG AA) */
/* Tekst podstawowy: 4.5:1 */
.text-gray-900 /* na bg-white */
.text-white    /* na bg-gray-900 */

/* Tekst pomocniczy: 3:1 */
.text-gray-600 /* na bg-white */
.text-gray-300 /* na bg-gray-900 */

/* Focus indicators - zawsze widoczne */
.focus:ring-2 .focus:ring-green-500/20
```

### Konsystencja spacing

```css
/* Wszystkie odstępy to wielokrotności 4px */
/* Używaj tylko tych wartości: */
/* 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px */

/* Unikaj niestandardowych wartości */
/* DOBRZE: p-4 (16px) */
/* ŹLE: p-[15px] */
```

---

## 🎨 Gradienty i efekty

### Główne gradienty

```css
/* Hero sections */
.bg-gradient-to-r from-green-400 to-blue-500
dark:from-green-700 dark:to-blue-900

/* Cards z akcentem */
.bg-gradient-to-br from-emerald-50 to-green-50
dark:from-emerald-900/20 dark:to-green-900/20

/* Przyciski premium */
.bg-gradient-to-r from-green-500 to-emerald-500
hover:from-green-600 hover:to-emerald-600

/* Backgrounds subtelne */
.bg-gradient-to-b from-white to-gray-50
dark:from-gray-900 dark:to-gray-800
```

### Text gradienty

```css
/* Nagłówki premium */
.bg-gradient-to-r from-green-600 to-blue-600
.bg-clip-text .text-transparent

/* Liczniki, statystyki */
.bg-gradient-to-r from-emerald-600 to-green-600
.bg-clip-text .text-transparent
```

### Overlay efekty

```css
/* Zdjęcia z overlay */
.relative before:absolute before:inset-0
before:bg-black/20 before:rounded-lg

/* Glass effect (subtle) */
.backdrop-blur-sm bg-white/80 dark:bg-gray-900/80
```

---

## 📱 Specyfika mobilna (Ionic/Capacitor)

### Safe Area handling

```jsx
// Obsługa safe area na iOS
<div
  className="h-screen"
  style={{
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)'
  }}
>

// Alternatywnie z Tailwind
<div className="pt-safe pb-safe">
```

### Touch interactions

```css
/* Większe target areas na mobile */
.min-h-[44px] min-w-[44px] /* iOS minimum touch target */

/* Disable text selection dla UI elementów */
.select-none

/* Smooth touch scrolling */
.overflow-y-auto .overscroll-contain

/* Touch feedback */
.active:bg-gray-100 .transition-colors .duration-75
```

### Mobile-specific animations

```jsx
// Szybsze animacje na mobile
const mobileAnimation = {
  transition: { duration: 0.2 }, // Krócej niż na desktop
};

// Pull to refresh feel
const pullToRefresh = {
  y: [0, 10, 0],
  transition: { duration: 0.3 },
};
```

### Viewport considerations

```css
/* Viewport units bezpieczne dla mobile */
.h-svh /* Screen viewport height - bez UI przeglądarki */
.h-dvh /* Dynamic viewport height - z UI przeglądarki */

/* Preferuj svh dla pełnoekranowych widoków */
.min-h-svh /* Aplikacja główna */
```

---

## 🔧 Implementacja techniczna

### CSS Custom Properties

```css
:root {
  /* Brand colors */
  --brand-primary: theme("colors.green.500");
  --brand-secondary: theme("colors.blue.500");

  /* Semantic colors */
  --color-success: theme("colors.emerald.500");
  --color-warning: theme("colors.yellow.500");
  --color-error: theme("colors.red.500");

  /* Spacing */
  --spacing-unit: 0.25rem; /* 4px base */

  /* Border radius */
  --radius-sm: 0.5rem; /* 8px */
  --radius-md: 0.75rem; /* 12px */
  --radius-lg: 1rem; /* 16px */
}
```

### Tailwind rozszerzenia

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#22c55e",
          secondary: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
    },
  },
};
```

### Komponenty bazowe

```jsx
// Button base component
const buttonVariants = {
  primary: "bg-green-500 hover:bg-green-600 text-white",
  secondary: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
  ghost: "hover:bg-gray-100 text-gray-600",
};

const sizeVariants = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};
```

---

## 📚 Zasady użytkowania

### 1. Konsystencja kolorów

- **Zawsze** używaj zdefiniowanych kolorów z palety
- **Nigdy** nie twórz niestandardowych odcieni
- Zachowaj kontrasty zgodne z WCAG AA

### 2. Hierarchia typograficzna

- Jeden główny nagłówek na stronie (text-3xl)
- Logiczna hierarchia h1 → h2 → h3
- Konsystentne spacing między elementami

### 3. Responsywność

- **Mobile first** - projektuj od najmniejszego ekranu
- Testuj na rzeczywistych urządzeniach
- Uwzględniaj safe areas i touch targets

### 4. Animacje

- **Subtelność** - animacje wspierają UX, nie dominują
- **Performance** - użyj transform i opacity
- **Dostępność** - respektuj prefers-reduced-motion

### 5. Dark mode

- **Wszystkie komponenty** muszą mieć wariant dark mode
- **Testuj czytelność** w obu trybach
- **Zachowaj semantykę** kolorów (sukces = zielony)

---

## 🎯 Przykłady implementacji

### Kompletny komponent EkoDziałanie

```jsx
function EkoActionCard({ action, onApprove, onReject }) {
  const statusConfig = {
    approved: {
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: CheckCircle,
    },
    pending: {
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      icon: Clock,
    },
    rejected: {
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: XCircle,
    },
  };

  const config = statusConfig[action.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border-l-4 border-green-500 bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{action.category.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {action.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color} `}
            >
              <Icon className="mr-1 h-3 w-3" />
              {statusConfig[action.status].label}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            +{action.points}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            punktów
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300">
        {action.description}
      </p>

      {/* Image if present */}
      {action.imageUrl && (
        <div className="mb-4">
          <img
            src={action.imageUrl}
            alt="Zdjęcie działania"
            className="h-48 w-full rounded-lg object-cover"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <User className="h-4 w-4" />
          <span>{action.userName}</span>
          <span>•</span>
          <span>{formatDate(action.createdAt)}</span>
        </div>

        {action.status === "pending" && (
          <div className="flex space-x-2">
            <button
              onClick={() => onReject(action.id)}
              className="inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <X className="mr-1 h-4 w-4" />
              Odrzuć
            </button>
            <button
              onClick={() => onApprove(action.id)}
              className="inline-flex items-center rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <Check className="mr-1 h-4 w-4" />
              Zatwierdź
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

### Dashboard z metrykami

```jsx
function DashboardStats({ stats }) {
  const metrics = [
    {
      label: "Wszystkie działania",
      value: stats.totalActions,
      change: "+12%",
      icon: Leaf,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Zdobyte odznaki",
      value: stats.totalBadges,
      change: "+5%",
      icon: Award,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Łączne punkty",
      value: stats.totalPoints,
      change: "+18%",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Aktywni uczniowie",
      value: stats.activeStudents,
      change: "+3%",
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {metric.change}
                  </span>
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                    vs ostatni miesiąc
                  </span>
                </div>
              </div>

              <div className={`rounded-xl p-3 ${metric.bg} `}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
```

---

## 🎨 Podsumowanie

**EKO Odznaki Pro** wykorzystuje nowoczesny, spójny design system oparty na:

### 🌱 **Filozofia**

- **Ekologia** jako główny motyw (zieleń, natura, zrównoważoność)
- **Gamifikacja** z jasnymi nagrodami wizualnymi
- **Dostępność** dla wszystkich użytkowników
- **Mobilność** jako priorytet

### 🎯 **Kluczowe zasady**

1. **Konsystencja** - jednolite wzorce w całej aplikacji
2. **Czytelność** - wysoki kontrast i hierarchia wizualna
3. **Interaktywność** - natychmiastowy feedback
4. **Responsywność** - działanie na wszystkich urządzeniach
5. **Performance** - płynne animacje i szybkie ładowanie

### 🔧 **Technologie**

- **Tailwind CSS** - utility-first styling
- **Framer Motion** - płynne animacje
- **Lucide Icons** - spójne ikony
- **Dark mode** - automatyczne przełączanie
- **Ionic/Capacitor** - natywne zachowanie na mobile

Ten design system można łatwo adaptować do innych projektów edukacyjnych lub aplikacji z elementami gamifikacji, zachowując nowoczesny i przyjazny wygląd.

---

**Wersja:** 1.0  
**Data:** Sierpień 2025  
**Aplikacja:** EKO Odznaki Pro  
**Framework:** React + Tailwind CSS + Ionic
