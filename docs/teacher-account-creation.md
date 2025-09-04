# System tworzenia kont nauczycielskich

## Przegląd

Dodano kompletny system umożliwiający ekoskopowi tworzenie kont dla nauczycieli zgodnie z procesem opisanym w dokumentacji projektu.

## Nowe funkcjonalności

### 1. Formularz wniosku dla nauczycieli (`/teacher-application`)

**Lokalizacja**: `/src/pages/TeacherApplicationPage.jsx`

Publiczna strona gdzie nauczyciele mogą:

- Wypełnić formularz z podstawowymi danymi
- Wybrać szkołę z listy
- Podać preferowaną nazwę klasy
- Przesłać wymagane dokumenty (legitymacja służbowa, zaświadczenie o zatrudnieniu)
- Dodać wiadomość do ekoskopu

**Dostęp**: Bezpośredni link na stronie logowania lub przez URL `/teacher-application`

### 2. Panel zarządzania wnioskami ekoskopu (`/ekoskop/users/teacher-applications`)

**Lokalizacja**: `/src/pages/ekoskop/TeacherApplicationsPage.jsx`

Panel dla ekoskopu do:

- Przeglądania wszystkich wniosków nauczycieli
- Filtrowania po statusie (oczekujące, zaakceptowane, odrzucone)
- Zaakceptowania/odrzucenia wniosków z opcjonalnym powodem
- Przejścia do tworzenia konta dla zaakceptowanych wniosków
- Podglądu załączonych dokumentów

### 3. Ulepszona strona tworzenia kont nauczycieli (`/ekoskop/users/create-teacher`)

**Lokalizacja**: `/src/pages/ekoskop/CreateTeacherPage.jsx`

Rozszerzona funkcjonalność:

- Auto-wypełnianie formularza na podstawie zaakceptowanego wniosku
- Generowanie losowych haseł
- Weryfikacja dokumentów
- Automatyczne tworzenie klasy dla nauczyciela
- Walidacja unikalności emaila

## Proces weryfikacji nauczycieli

### Krok 1: Zgłoszenie nauczyciela

1. Nauczyciel wchodzi na `/teacher-application`
2. Wypełnia formularz z danymi osobowymi i zawodowymi
3. Przesyła wymagane dokumenty
4. System tworzy wpis w kolekcji `teacherApplications`

### Krok 2: Weryfikacja przez ekoskop

1. Ekoskop loguje się i przechodzi do `/ekoskop/users/teacher-applications`
2. Przegląda listę wniosków oczekujących
3. Sprawdza dokumenty i dane nauczyciela
4. Akceptuje lub odrzuca wniosek (z opcjonalnym powodem)

### Krok 3: Tworzenie konta

1. Po zaakceptowaniu wniosku ekoskop klika "Utwórz konto"
2. Formularz zostaje auto-wypełniony danymi z wniosku
3. Ekoskop może edytować dane, wygenerować hasło
4. System tworzy konto Firebase Auth i dokument w Firestore
5. Automatycznie tworzona jest klasa przypisana do nauczyciela

## Struktura danych

### Kolekcja `teacherApplications`

```javascript
{
  displayName: "Jan Kowalski",
  email: "nauczyciel@szkola.edu.pl",
  phone: "+48 123 456 789", // opcjonalny
  schoolId: "school_id",
  requestedClassName: "5a", // opcjonalny
  message: "Dodatkowe informacje...", // opcjonalny
  documents: {
    idDocument: true, // czy przesłano skan legitymacji
    employmentDocument: true // czy przesłano zaświadczenie
  },
  status: "pending" | "approved" | "rejected",
  rejectionReason: "...", // tylko gdy status = "rejected"
  createdAt: Timestamp,
  processedAt: Timestamp // gdy status zmieniony
}
```

### Rozszerzona kolekcja `users` dla nauczycieli

```javascript
{
  // ... istniejące pola
  documents: {
    idVerified: true,
    employmentVerified: true
  },
  notes: "Notatki ekoskopu...",
  createdBy: "ekoskop_user_id",
  createdAt: Timestamp
}
```

### Rozszerzona kolekcja `classes`

```javascript
{
  // ... istniejące pola
  teacherId: "teacher_user_id",
  createdBy: "ekoskop_user_id",
  createdAt: Timestamp
}
```

## Nawigacja

### Dla ekoskopu:

- **Główne menu**: `Użytkownicy` → strona zarządzania użytkownikami
- **Przyciski na stronie użytkowników**:
  - "Wnioski nauczycieli" → lista wniosków
  - "Utwórz konto nauczyciela" → bezpośrednie tworzenie konta

### Dla nauczycieli:

- **Strona logowania**: Link "Jesteś nauczycielem? Złóż wniosek o konto →"
- **Bezpośredni URL**: `/teacher-application`

## Dodatkowe ulepszenia

### Komponent Button

Dodano brakujące style:

- `outline` - przezroczyste tło z ramką
- `success` - zielony styl dla akcji pozytywnych

### Obsługa błędów i walidacja

- Sprawdzanie unikalności emaili
- Walidacja wymaganych pól
- Sprawdzanie przesłania dokumentów
- Obsługa błędów Firebase Auth

### UX/UI

- Automatyczne wypełnianie formularzy
- Statusy wizualne dla wniosków
- Statystyki na dashboardzie wniosków
- Loading states i komunikaty sukcesu/błędu

## TODO / Kolejne kroki

1. **Upload dokumentów**:
   - Obecnie jest placeholder - trzeba zaimplementować prawdziwy upload do Firebase Storage
   - Dodać podgląd przesłanych dokumentów

2. **Notyfikacje**:
   - Email do nauczyciela po zmianie statusu wniosku
   - Dashboard notifications dla ekoskopu o nowych wnioskach

3. **Dodatkowa weryfikacja**:
   - Sprawdzanie czy szkoła istnieje
   - Weryfikacja numeru telefonu

4. **Audit log**:
   - Historia zmian statusów wniosków
   - Logi działań ekoskopu

5. **Bulk actions**:
   - Masowe zatwierdzanie/odrzucanie wniosków
   - Export listy wniosków do CSV

## Testowanie

Aby przetestować nową funkcjonalność:

1. Przejdź na `/teacher-application` i wypełnij wniosek
2. Zaloguj się jako ekoskop i przejdź do `/ekoskop/users/teacher-applications`
3. Zaakceptuj wniosek i utwórz konto przez przycisk "Utwórz konto"
4. Sprawdź czy nauczyciel może się zalogować i ma przypisaną klasę
