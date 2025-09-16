# PRD

## 🤔 Założenia

**Temat:** Aplikacja mająca zachęcić do wykonywania działań proekologicznych

**Główna grupa odbiorców:** dzieci w klasach szkolnych, nauczyciele

**Rodzaj aplikacji:** Mobilna (Dla uczniów i nauczycieli) + Web (Dla nauczycieli oraz EKOSKOPU)

## 📱 Przykładowe użycie aplikacji

1. Uczeń loguje się do aplikacji i przegląda dostępne EkoWyzwania.
2. Wybiera EkoWyzwanie "Zrób coś z odpadów" i wykonuje je, tworząc doniczkę z plastikowej butelki.
3. Po wykonaniu zadania, uczeń dodaje EkoDziałanie, opisując swoje działania i dodając zdjęcie.
4. Nauczyciel przegląda zgłoszone EkoDziałania i akceptuje je.
5. Uczeń zdobywa odznakę za wykonanie określonej ilości EkoWyzwań.

## 📚 Słownik

EkoOdznaki → nazwa aplikacji

EkoDziałanie → działania ekologicznie które użytkownik wykonuje w aplikacji

EkoWyzwania → wyzwania które trzeba wykonać w danym tygodniu

## ⚙️ Funkcjonalność

### System logowania

- Aby **nauczyciel** się zarejestrował musi
  - Zgłosić się do EKOSKOPU
  - EKOSKOP zgłosi się do nauczyciela
  - Skan legitymacji, skan zatrudnienia podbity przez dyrektor
  - Po utworzeniu konta nauczyciela jest też tworzona klasa do której uczniowie mogą wybrać przy tworzeniu konta, oraz nauczyciel WERYFIKUJE czy dana osoba jest z tej klasy i ją zatwierdza
    - Zanim uczeń zostanie zatwierdzony, nie może zgłaszać EkoDziałań/EkoWyzwań
- Aby **uczeń** się zarejestrował musi
  - Przejść przez formularz tworzenia konta w aplikacji
  - Logowanie Loginem i hasłem:
    - Nazwa wyświetlana
    - Email (unikalne)
    - Hasło
    - Powtórzenie hasła
  - Google/Apple (do przebadania)
    - Nazwa wyświetlana
  - **Gdy nie jest zarejestrowany w bazie, wyświetla się formularz podania szkoły**
    - Formularzu wybiera szkołę a następnie wybiera klasę
    - Po zatwierdzeniu przez nauczyciela, uczeń dostaje powiadomienie i może zacząć korzystać z aplikacji
- Przy logowaniu Ucznia/Nauczyciela
  - Email
  - Hasło

---

### Co można robić w aplikacji?

- Wykonywać EkoDziałania
  - **EkoDziałanie** są to działania które uczeń wykonuje w danym dniu
  - Ograniczenie ilości na tydzień i dzień
  - Przykładowe Kategorie:
    - **Oszczędzanie** - (Działania oszczędzające zasoby ziemi, gaszenie światła, używanie rzeczy wielorazowych itp.)
    - **Edukacja** - (Działania które poszerzają wiedzę na temat ekologii, np. obejrzenie filmiku na YT na temat ekologii czy jakiś film dokumentalny na temat ekologii - oczywiście będą podlinkowane materiały jakieś)
    - **Recykling** - (Działania polegające na recyklingowi śmieci, np. wyrzucanie do określonych pojemników śmieci, sprzątanie planty z śmieci)

- Wykonywać EkoWyzwania
  - **EkoWyzwania** są to konkretne działania, które uczeń są ograniczone czasowo do wykonania
  - Przykładowe EkoWyzwania (Tytuł - Opis)
    - **Zrób coś z odpadów** – np. plastikowa butelka w doniczkę lub karton w organizer.
    - **Nakrętkowy challenge** – zbieraj nakrętki i zobacz, ile uda Ci się nazbierać w tygodniu.
    - **Posadź roślinkę** – w klasie lub w domu i codziennie ją podlewaj.
    - **Eko-plakat** – przygotuj plakat z ekologicznym przesłaniem dla szkoły.
    - **Wyłączamy światło** – codziennie pilnować, żeby w klasie/ domu nie świeciło się światło bez potrzeby.

---

#### Wykonywanie EkoDziałania

- Wybór EkoZadania (Nazwa, Opis)
- (opcjonalne) Zdjęcie i opis co się zrobiło
- **Sprawdzenie limitów przed wysłaniem:** System automatycznie sprawdza czy użytkownik nie przekroczył dziennych lub tygodniowych limitów dla danego EkoDziałania
- Zapisanie wykonania zadania, **automatyczna akceptacja.**
  - Nauczyciel ma wgląd w to, że dany uczeń to zrobił.
  - Zakładamy, **że uczeń jest uczciwy i to zależy od nauczyciela** czy odbierze mu wykonanie zadania czy zostawi
- Dany uczeń może wykonać daną ilość EkoDziałań **zgodnie z limitami określonymi w szablonie EkoDziałania**
- **Limity są sprawdzane w czasie rzeczywistym** - w interfejsie użytkownik widzi:
  - Ile pozostało mu zgłoszeń dzisiaj/w tym tygodniu
  - Informację o przekroczeniu limitu z datą resetowania
  - Zablokowane przyciski dla EkoDziałań z osiągniętym limitem

#### Wykonywanie EkoWyzwania

- Wybór EkoWyzwania (Nazwa, Opis)
- (opcjonalne) Zdjęcie i opis co się zrobiło
- **Sprawdzenie globalnego limitu EkoWyzwań:** System sprawdza czy użytkownik nie zgłosił już innego EkoWyzwania w tym tygodniu
- **Sprawdzenie limitów konkretnego EkoWyzwania:** Dodatowa walidacja limitów dla wybranego wyzwania
- Zapisanie wykonania wyzwania, **automatyczna akceptacja.**
  - Nauczyciel ma wgląd w to, że dany uczeń to zrobił.
  - Zakładamy, **że uczeń jest uczciwy i to zależy od nauczyciela** czy odbierze mu wykonanie wyzwania czy zostawi
- Dany uczeń może wykonać **jedno** EkoWyzwanie na tydzień
- **System wyświetla informacje o limitach** podobnie jak w EkoDziałaniach

---

### Ranking punktów między uczniami jednej klasy

- Ilość EkoDziałań w danym miesiącu
- Reset rankingu co pierwszy dzień miesiąca
- Można sprawdzać ranking z poprzednich miesięcy
- Rankingi są pomiędzy uczniami w klasie
- Nazwa wyświetlana → Ilość wykonanych działań
  - Pytanie czy, ze szczegółami czy bez
  - Czy suma ogólnych działań w tygodniu
- Automatyczne przydzielanie odznak na bazie ilości ukończonych działań
  - W zależności ile razy wykonał dane EkoDziałanie, uczeń otrzymuje odznakę która potem automatycznie się ulepsza gdy zdobędzie kamień milowy.
  - Aby ograniczyć możliwość zdobycia najlepszej odznaki w pierwszych tygodniach, system będzie zaprojektowany w taki sposób, że uczeń MUSI być REGULARNY przez cały okres gry. Tzn. że w danym tygodniu może zrobić MAX ileś danego działania

---

## 🔒 System Limitów EkoDziałań i EkoWyzwań

### Implementacja

System limitów został zaimplementowany zgodnie z wymaganiami z dokumentacji. Składa się z następujących komponentów:

#### Serwis walidacji limitów (`submissionLimitService.js`)

- `validateSubmissionLimits()` - sprawdza dzienne i tygodniowe limity dla konkretnej aktywności
- `validateWeeklyChallengeLimit()` - sprawdza globalny limit EkoWyzwań (jedno na tydzień)
- `getUserSubmissionStats()` - pobiera statystyki zgłoszeń użytkownika
- `formatResetDate()` - formatuje datę resetowania limitów

#### Hook `useSubmissionLimits`

- Integruje sprawdzanie limitów z komponentami React
- Automatycznie odświeża dane o limitach
- Zwraca informację czy użytkownik może zgłosić aktywność

#### Komponenty UI

- `SubmissionLimitsInfo` - wyświetla szczegółowe informacje o limitach
- `SubmissionLimitsBadge` - kompaktowy znaczek z informacją o limitach

### Jak działają limity

1. **EkoDziałania:**
   - Każde EkoDziałanie ma własne limity `maxDaily` i `maxWeekly`
   - Limity są sprawdzane przed wysłaniem zgłoszenia
   - UI pokazuje pozostałe zgłoszenia i blokuje przycisk gdy limit osiągnięty

2. **EkoWyzwania:**
   - Globalny limit: jedno EkoWyzwanie na tydzień (niezależnie od typu)
   - Dodatkowo każde EkoWyzwanie może mieć własne limity `maxDaily`/`maxWeekly`
   - Tydzień liczy się od poniedziałku do niedzieli

3. **Walidacja:**
   - Sprawdzana przed wysłaniem w `AuthContext.submitEcoAction()` i `submitChallengeSubmission()`
   - Liczone są zgłoszenia ze statusem "approved" i "pending"
   - Błąd jest rzucany jeśli limit zostanie przekroczony

### Zmiany w interfejsie

- **ActivityPage:** EkoDziałania z osiągniętym limitem są wyszarzone i nieaktywne
- **SubmitActivityPage:** Widoczne informacje o limitach i zablokowany przycisk wysyłania
- **Znaczniki limitów:** Kompaktowe informacje o pozostałych zgłoszeniach

---

### Dashboard Nauczyciela

- Tworzenie EkoWyzwań: Kategoria, Opis
  - Gotowe zadania do wyboru
    - Mogą zostać stworzone przez nauczycieli
  - Trwają zawsze tydzień
  - Są ustalane na cały okres Gry

---

### Inne

- Statystyki odnośnie tego ile udało się zrobić
  - Uczeń: ilość działań oraz podział na kategorie
  - Nauczyciel: Suma działań całej klasy, ilość działań każdego ucznia, suma działań dla każdej kategorii
- Ekoskop posiada wgląd do statystyk szkół
- Feed z artykułami od ekoskopu

---

## 🗃️ Baza danych

### 🔥 Przykładowa Struktura Bazy Danych

```jsx
// Główne kolekcje w Twojej bazie danych

// Użytkownicy (studenci, nauczyciele, EKOSKOP)
users/{userId}/
    - email: "jan.kowalski@email.com"
    - displayName: "Jan Kowalski"
    - role: "student" | "teacher" | "ekoskop"
    - schoolId: "szkola_podstawowa_1_uid"
    - classId: "klasa_4a_uid"
    - isVerified: true // Dla ucznia, ustawiane przez nauczyciela
    - counters: {
        - totalActions: 5, // Ilość wykonanych EkoDziałań
        - totalChallenges: 2, // Ilość wykonanych EkoWyzwań
    // Inne countery odnosnie kategorii EkoDziałań
    // np. jeśli użytkownik zrobi 1 EkoDziałanie
    // z kategorią Recykling, to wtedy wzrasta counter
        - recyclingActions: 2,  // <-- Klucz do odznak za recykling
        - educationActions: 1,  // <-- Klucz do odznak za edukację
        - savingActions: 2      // <-- Klucz do odznak za oszczędzanie
        - transportActions: 0   // <-- Klucz do odznak za transport
        - energyActions: 0      // <-- Klucz do odznak za energię
        - foodActions: 0        // <-- Klucz do odznak za jedzenie
    // Mozemy dodać więcej
    - totalActiveDays: 1
  }
  // ZDOBYTE ODZNAKI: Przechowujemy tylko te odznaki, które użytkownik
  // faktycznie zdobył (osiągnął co najmniej poziom 1).
  // To jest bardziej optymalne niż trzymanie mapy wszystkich odznak.
  - earnedBadges: {
    - {badgeId}: { // Klucz to ID z badgeTemplates
        - lvl: 1,
        - unlockedAt: "2023-10-26T15:30:00Z"
    }
    - "green-champion": {
        - lvl: 2,
        - unlockedAt: "2023-10-26T15:30:00Z"
    }
  }

// Odznaki
badgeTemplates/{badgeId}/
  - "mistrz-recyklingu": { // <- mistrz-reclinkgu to jako badgeId
        - name: "Mistrz recyklingu",
        - category: "Recykling",
        - counterToCheck: "recyclingActions",
        - badgeImage: "/badges/mistrz-recyklingu.png",
        - levels: [
        {
            - level: 1,
            - description: "Wykonaj 10 EkoDziałań z kategorii Recykling",
            - requiredCount: 10,
        },
        {
            - level: 2,
            - description: "Wykonaj 25 EkoDziałań z kategorii Recykling",
            - requiredCount: 25,
        },
        createdAt: Timestamp,
        isActive: true,
        ]
    }
  - "eko-edukator": { // <- eko-edukator to jako badgeId
    - name: "Eko Edukator",
    - category: "Edukacja",
    - counterToCheck: "educationActions",
    - badgeImage: "badges/eko-edukator.png",
    - levels: [
      {
        - level: 1,
        - description: "Wykonaj 5 EkoDziałań z kategorii Edukacja",
        - requiredCount: 5,
      },
      {
        - level: 2,
        - description: "Wykonaj 15 EkoDziałań z kategorii Edukacja",
        - requiredCount: 15,
      }
    ]
}

// Szkoły
schools/{schoolId}/
  - name: "Szkoła Podstawowa nr 1 w Warszawie"
  - address: "Warszawa"
  - email: "sekretariat@edu.pl"
  - phone: "+48 123 123 123"

// Klasy
classes/{classId}/
  - name: "Klasa 4a"
  - schoolId: "szkola_podstawowa_1_uid"
  - teacherId: "nauczyciel_xyz_uid"
  - allowRegistration: true

// 🆕 WNIOSKI NAUCZYCIELI O UTWORZENIE KONTA
teacherApplications/{applicationId}/
  - email: "jan.nowak@email.com"
  - displayName: "Jan Nowak"
  - schoolId: "szkola_podstawowa_1_uid"
  - schoolName: "Szkoła Podstawowa nr 1 w Warszawie" // Denormalizacja dla łatwego wyświetlania
  - proposedClassName: "Klasa 5b"
  - phone: "+48 123 456 789" // Opcjonalne
  - additionalInfo: "Jestem nauczycielem od 5 lat..." // Opcjonalne
  - status: "pending" | "approved" | "rejected" // Domyślnie 'pending'
  - createdAt: Timestamp
  - reviewedAt: Timestamp // Kiedy ekoskop dokonał oceny
  - reviewedBy: "ekoskop_user_uid" // Który ekoskop dokonał oceny
  - rejectionReason: "Niepełne dokumenty" // Tylko przy statusie 'rejected'
  - approvedTeacherId: "utworzony_nauczyciel_uid" // Tylko przy statusie 'approved'
  // 🔒 BEZPIECZEŃSTWO: Dokumenty przechowywane w FireStorage
  - documents: {
    - idCard: {
      - fileName: "legitymacja_jan_nowak.jpg"
      - storagePath: "teacher-applications/{applicationId}/id-card.jpg" // Ścieżka w FireStorage
      - uploadedAt: Timestamp
      - fileSize: 1024567 // bytes
      - mimeType: "image/jpeg"
      - verified: false // Czy ekoskop zweryfikował dokument
    }
    - employmentCertificate: {
      - fileName: "zaswiadczenie_zatrudnienie.pdf"
      - storagePath: "teacher-applications/{applicationId}/employment-cert.pdf"
      - uploadedAt: Timestamp
      - fileSize: 2048123 // bytes
      - mimeType: "application/pdf"
      - verified: false
    }
  }
  // 🔒 METADATA DLA AUDYTU I BEZPIECZEŃSTWA
  - auditLog: [
    {
      - action: "created" | "reviewed" | "approved" | "rejected" | "document_uploaded"
      - timestamp: Timestamp
      - performedBy: "user_uid" // Kto wykonał akcję
      - details: "Uploaded ID card document" // Dodatkowe szczegóły
      - ipAddress: "192.168.1.1" // Opcjonalne dla bezpieczeństwa
    }
  ]
  - metadata: {
    - clientIP: "192.168.1.1" // IP z którego złożono wniosek
    - userAgent: "Mozilla/5.0..." // Informacje o przeglądarce
    - submissionSource: "web" | "mobile" // Skąd złożono wniosek
  }

// Definicje EkoDziałań (szablony)
ecoActions/{ecoActionId}/
  - name: "Gaszenie światła"
  - description: "Pamiętaj, aby gasić światło wychodząc z pokoju."
  - category: "Oszczędzanie"
  - counterToIncrement: "savingActions"
  - style: {
    - color: "green",
    - icon: "♻️",
  }
  - maxDaily: 3
  - maxWeekly: 3

// NOWA KOLEKCJA: Wyzwania przypisane przez EkoSkop dla każdej klasy
ecoChallenges/{assignmentId}/
  - name: "Nakrętkowy challenge"
  - description: "Zbieraj nakrętki przez cały tydzień."
  - category: "Recykling"
  - startDate: Timestamp // Data rozpoczęcia (np. poniedziałek)
  - endDate: Timestamp   // Data zakończenia (np. niedziela)
  - style: {
    - color: "green",
    - icon: "♻️",
  }
  - maxDaily: 1
  - maxWeekly: 1

// Zgłoszenia wykonanych EkoDziałań przez uczniów
submissions/{submissionId}/
  - type: "eco_action" | "challenge"
  - ecoActivityId: "gaszenie_swiatla_id"
  - studentId: "uczen_abc_uid"
  - studentName: "Jan Kowalski" // Duplikacja dla łatwiejszego wyświetlania
  - classId: "klasa_4a_uid" // Oczywiście ID będzie losowe niż w przykładzie
  - createdAt: Timestamp // Data zgłoszenia
  - status: "approved" | "rejected" | "pending" // Domyślnie 'pending'
  - photoUrls: [] // Lista URLi zdjęć hostowanych na firebase storage
  - comment: "Zgasiłem światło w całej szkole!" // Opcjonalne
  - reviewedBy: "nauczyciel_xyz_uid"
  - reviewedAt: Timestamp
  - rejectionReason: "Nieodpowiednie zdjęcie"

// Główna kolekcja przechowująca feedy wszystkich klas
activityFeeds/{classId}/
  // Dokument dla konkretnej klasy, np. "klasa_4a_uid"
  // Może zawierać podsumowania, np. totalItems: 150

  // Subkolekcja z poszczególnymi wpisami w feedzie
  items/{itemId}/
    - classId: "klasa_4a_uid" // Dla reguł bezpieczeństwa - MUSI być zgodne z ID klasy w ścieżce
    - type: "action_completed" | "challenge_completed" | "badge_earned"
    - timestamp: Timestamp // Kluczowe do sortowania
    - studentId: "uczen_abc_uid"
    - studentName: "Kasia Nowak" // Denormalizacja dla łatwego wyświetlania
    // Obiekt z danymi zależnymi od typu zdarzenia
    - eventData: {
        // dla "action_completed"
        actionName: "Gaszenie światła"
        // dla "challenge_completed"
        // challengeName: "Nakrętkowy Challenge"
        // dla "badge_earned"
        // badgeName: "Eko-Aktywista",
        // level: 1
    }

    // POWIADOMIENIA (globalne lub skierowane do konkretnej grupy/użytkownika)
    notifications/{notificationId}/
      - title: "Nowy challenge dla Twojej klasy!"
      - message: "Od jutra zaczynamy zbieranie nakrętek 🚀"
      - createdAt: Timestamp
      - createdBy: "ekoskop_uid" // UID nadawcy
      - type: "info" | "alert" | "reminder" // dla UI
      - isGlobal: true | false // jeśli true → widzą wszyscy
      - target: {
          role: "student" | "teacher" | "all", // jeśli null i isGlobal=true → wszyscy
          schoolId: "szkola_podstawowa_1_uid", // opcjonalne
          classId: "klasa_4a_uid",              // opcjonalne
          userId: "uczen_abc_uid"              // opcjonalne
      }
      - readBy: [ "uczen_abc_uid", "uczen_xyz_uid" ] // kto już odczytał

    // Opcjonalnie możesz dodać subkolekcję do śledzenia statusu użytkownika
    notifications/{notificationId}/userStatus/{userId}/
      - readAt: Timestamp
      - dismissed: true | false

```

## 🔒 Firebase Storage - Struktura i Bezpieczeństwo

### Struktura folderów w Firebase Storage:

```
teacher-applications/
  {applicationId}/
    id-card.{extension}        // Skan legitymacji (jpg, png, pdf)
    employment-cert.{extension} // Zaświadczenie o zatrudnieniu (pdf, jpg, png)

user-submissions/
  {submissionId}/
    photo-1.{extension}        // Zdjęcia do EkoDziałań/EkoWyzwań
    photo-2.{extension}

profile-images/
  {userId}/
    avatar.{extension}         // Zdjęcia profilowe użytkowników
```

### 🛡️ Reguły bezpieczeństwa Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 🔒 WNIOSKI NAUCZYCIELI - tylko właściciel może uploadować, ekoskop może czytać
    match /teacher-applications/{applicationId}/{document} {
      // Pozwól na upload tylko jeśli użytkownik to właściciel wniosku
      allow write: if request.auth != null
        && isOwnerOfApplication(applicationId)
        && isValidTeacherDocument(document)
        && request.resource.size < 10 * 1024 * 1024; // Max 10MB

      // Pozwól na odczyt tylko ekoskopowi lub właścicielowi
      allow read: if request.auth != null
        && (isEkoskop() || isOwnerOfApplication(applicationId));
    }

    // 🔒 ZGŁOSZENIA UCZNIÓW - tylko właściciel może uploadować, nauczyciel i ekoskop mogą czytać
    match /user-submissions/{submissionId}/{file} {
      allow write: if request.auth != null
        && isOwnerOfSubmission(submissionId)
        && request.resource.size < 5 * 1024 * 1024; // Max 5MB

      allow read: if request.auth != null
        && (isEkoskop() || isTeacherOfSubmission(submissionId) || isOwnerOfSubmission(submissionId));
    }

    // 🔒 ZDJĘCIA PROFILOWE - tylko właściciel
    match /profile-images/{userId}/{file} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024; // Max 2MB
    }

    // Pomocnicze funkcje bezpieczeństwa
    function isEkoskop() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ekoskop";
    }

    function isOwnerOfApplication(applicationId) {
      return get(/databases/$(database)/documents/teacherApplications/$(applicationId)).data.createdBy == request.auth.uid;
    }

    function isOwnerOfSubmission(submissionId) {
      return get(/databases/$(database)/documents/submissions/$(submissionId)).data.studentId == request.auth.uid;
    }

    function isTeacherOfSubmission(submissionId) {
      let submission = get(/databases/$(database)/documents/submissions/$(submissionId)).data;
      let userClass = get(/databases/$(database)/documents/classes/$(submission.classId)).data;
      return userClass.teacherId == request.auth.uid;
    }

    function isValidTeacherDocument(document) {
      return document in ['id-card.jpg', 'id-card.png', 'id-card.pdf',
                         'employment-cert.jpg', 'employment-cert.png', 'employment-cert.pdf'];
    }
  }
}
```

### 🛡️ Reguły bezpieczeństwa Firestore dla wniosków:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 🔒 WNIOSKI NAUCZYCIELI
    match /teacherApplications/{applicationId} {
      // Każdy może utworzyć wniosek (do rejestracji)
      allow create: if request.auth != null
        && isValidTeacherApplication()
        && resource == null; // Upewnij się, że dokument nie istnieje

      // Tylko właściciel może czytać swój wniosek
      allow read: if request.auth != null
        && (resource.data.createdBy == request.auth.uid || isEkoskop());

      // Tylko ekoskop może aktualizować status wniosku
      allow update: if request.auth != null
        && isEkoskop()
        && isValidStatusUpdate();

      // Nikt nie może usuwać wniosków (dla audytu)
      allow delete: if false;
    }

    // Pomocnicze funkcje walidacji
    function isValidTeacherApplication() {
      let data = request.resource.data;
      return data.keys().hasAll(['email', 'displayName', 'schoolId', 'proposedClassName', 'status'])
        && data.status == 'pending'
        && data.createdBy == request.auth.uid
        && data.email is string
        && data.displayName is string;
    }

    function isValidStatusUpdate() {
      let before = resource.data;
      let after = request.resource.data;

      // Można zmieniać tylko status, reviewedAt, reviewedBy i powód odrzucenia
      return before.createdBy == after.createdBy
        && before.email == after.email
        && before.schoolId == after.schoolId
        && after.status in ['pending', 'approved', 'rejected']
        && (before.status == 'pending') // Można zmieniać tylko z pending
        && after.reviewedBy == request.auth.uid
        && after.reviewedAt is timestamp;
    }

    function isEkoskop() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ekoskop";
    }
  }
}
```

### Jak Twoja Logika Idealnie Pasuje do Rekomendowanej Struktury

Cały proces można zautomatyzować, np. używając **Firebase Cloud Functions**.

1. **Użytkownik wykonuje EkoDziałanie**
   - W kolekcji `submissions` pojawia się nowy, zatwierdzony dokument.
2. **Cloud Function reaguje na zdarzenie**
   - Funkcja uruchamia się automatycznie, gdy w `submissions` pojawia się nowy wpis.
   - Odczytuje, który użytkownik (`studentId`) wykonał działanie.
3. **Aktualizacja licznika (`counter`)**
   - Funkcja **zwiększa o 1** wartość pola `totalActions` (lub innego, odpowiedniego licznika) w dokumencie `users/{userId}`. To jest krok, który już masz w swojej strukturze.
4. **Sprawdzenie warunków odznak (magia dzieje się tutaj!)**
   - Po zaktualizowaniu licznika funkcja pobiera **wszystkie szablony odznak** z kolekcji `badgeTemplates`.
   - Dla każdej odznaki sprawdza, czy nowa wartość licznika (np. `totalActions: 25`) spełnia warunki do odblokowania nowego poziomu (np. `level_1_requires: 25`).
   - Sprawdza również, czy użytkownik nie ma już tego poziomu lub wyższego.
5. **Przyznanie lub aktualizacja odznaki**
   - Jeśli warunek został spełniony, funkcja tworzy lub aktualizuje wpis w mapie `earnedBadges` u użytkownika. Na przykład, jeśli `totalActions` osiągnęło `25`, funkcja zapisuje:
     `users/{userId}/earnedBadges/eko-aktywista: { level: 1, unlockedAt: Timestamp }`
   - Jeśli użytkownik miał już `level: 1`, a teraz osiągnął `50` działań, funkcja zaktualizuje ten wpis na:
     `users/{userId}/earnedBadges/eko-aktywista: { level: 2, unlockedAt: Timestamp }`

### 🧠 Random pomysły

- Day streak, ale nie taki ze jak nie będziesz raz to koniec, ale liczy po prostu ile dni robisz EkoDzialania. Czyli liczy ile dni zrobiłeś choć jedną akcję.
