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
- Zapisanie wykonania zadania, **automatyczna akceptacja.**
  - Nauczyciel ma wgląd w to, że dany uczeń to zrobił.
  - Zakładamy, **że uczeń jest uczciwy i to zależy od nauczyciela** czy odbierze mu wykonanie zadania czy zostawi
- Dany uczeń może wykonać daną ilość EkoDziałań

#### Wykonywanie EkoWyzwania

- Wybór EkoWyzwania (Nazwa, Opis)
- (opcjonalne) Zdjęcie i opis co się zrobiło
- Zapisanie wykonania wyzwania, **automatyczna akceptacja.**
  - Nauczyciel ma wgląd w to, że dany uczeń to zrobił.
  - Zakładamy, **że uczeń jest uczciwy i to zależy od nauczyciela** czy odbierze mu wykonanie wyzwania czy zostawi
- Dany uczeń może wykonać **jedno** EkoWyzwanie na tydzień

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
        - transportActions: 0
        - energyActions: 0
        - foodActions: 0
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
        - levels: [
        {
                - level: 1,
            - description: "Wykonaj 10 EkoDziałań z kategorii Recykling",
            - requiredCount: 10,
            - icon: "♻️"
        },
        {
            - level: 2,
            - description: "Wykonaj 25 EkoDziałań z kategorii Recykling",
            - requiredCount: 25,
            - icon: "🌍"
        }
        ]
    }
  - "eko-edukator": { // <- eko-edukator to jako badgeId
    - name: "Eko Edukator",
    - category: "Edukacja",
    - counterToCheck: "educationActions",
    - levels: [
      {
        - level: 1,
        - description: "Wykonaj 5 EkoDziałań z kategorii Edukacja",
        - requiredCount: 5,
        - icon: "📚"
      },
      {
        - level: 2,
        - description: "Wykonaj 15 EkoDziałań z kategorii Edukacja",
        - requiredCount: 15,
        - icon: "🎓"
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

// Definicje EkoDziałań (szablony)
ecoActions/{ecoActionId}/
  - name: "Gaszenie światła"
  - description: "Pamiętaj, aby gasić światło wychodząc z pokoju."
  - category: "Oszczędzanie"
  - counterToIncrement: "savingActions"
  - style: {
    - color: "green",
    - shape: "circle",
    - icon: "♻️",
  }
  - maxDaily: 3
  - maxWeekly: 3

// Zgłoszenia wykonanych EkoDziałań przez uczniów
submissions/{submissionId}/
  - studentId: "uczen_abc_uid"
  - studentName: "Jan Kowalski" // Duplikacja dla łatwiejszego wyświetlania
  - classId: "klasa_4a_uid" // Oczywiście ID będzie losowe niż w przykładzie
  - ecoActionId: "gaszenie_swiatla_id"
  - createdAt: Timestamp // Data zgłoszenia
  - status: "approved" | "rejected" // Domyślnie 'approved'
  - photoUrl: "url/do/zdjecia.jpg" // Opcjonalne
  - comment: "Zgasiłem światło w całej szkole!" // Opcjonalne

// Szablony/biblioteka EkoWyzwań
challengeTemplates/{templateId}/
  - name: "Nakrętkowy challenge"
  - description: "Zbieraj nakrętki przez cały tydzień."
  - category: "Recykling"

// NOWA KOLEKCJA: Wyzwania przypisane przez nauczycieli do klas
assignedChallenges/{assignmentId}/
  - templateId: "nakretkowy_challenge_id" // ID z kolekcji challengeTemplates
  - challengeName: "Nakrętkowy challenge"  // Denormalizacja dla łatwego wyświetlania
  - challengeDescription: "Zbieraj nakrętki przez cały tydzień."
  - classId: "klasa_4a_uid"
  - teacherId: "nauczyciel_xyz_uid"
  - startDate: Timestamp // Data rozpoczęcia (np. poniedziałek)
  - endDate: Timestamp   // Data zakończenia (np. niedziela)
  - classProgress: { // Informację o tym ile uczniów ukończyło zadanie
    - current: 15,
    - total: 25,
  },

// Zgłoszenia wykonanych EkoWyzwań (drobna zmiana)
challengeSubmissions/{submissionId}/
  - studentId: "uczen_abc_uid"
  - assignedChallengeId: "assignmentId_123" // Link do przypisanego wyzwania
  - classId: "klasa_4a_uid"
  - createdAt: Timestamp
  - status: "approved" | "rejected"

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
```

### Firestore.rules

```jsx
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Funkcja pomocnicza do sprawdzania roli użytkownika
    function getUserRole(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role;
    }

    // Funkcja sprawdzająca, czy nauczyciel zarządza daną klasą
    function isTeacherOfClass(classId) {
      let teacherId = get(/databases/$(database)/documents/classes/$(classId)).data.teacherId;
      return request.auth.uid == teacherId;
    }

    // Funkcja sprawdzająca, czy zalogowany użytkownik ma rolę 'ekoskop'.
    function isRequestUserEkoskop() {
      // request.auth.uid to bezpieczna zmienna przechowująca ID
      // użytkownika, który wysyła żądanie do bazy danych.
      return getUserRole(request.auth.uid) == 'ekoskop';
    }

    // Każdy zalogowany użytkownik może odczytać dane o sobie, ale tylko on może je modyfikować
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Dane szkół i klas są publiczne do odczytu dla zalogowanych użytkowników
    match /schools/{schoolId} {
      allow read: if request.auth != null;
      allow write: if isRequestUserEkoskop(); // Tylko EKOSKOP może dodawać/edytować szkoły
    }

    match /classes/{classId} {
      allow read: if request.auth != null;
      // Nauczyciel może edytować swoją klasę (np. weryfikować uczniów - to by wymagało innej logiki)
      // EKOSKOP może tworzyć klasy
      allow write: if isTeacherOfClass(classId) || isRequestUserEkoskop();
    }

    // Szablony EkoDziałań są publiczne do odczytu
    match /ecoActions/{ecoActionId} {
        allow read: if request.auth != null;
        allow write: if isRequestUserEkoskop(); // Tylko admini dodają globalne działania
    }

    // Zgłoszenia zadań
    match /submissions/{submissionId} {
        // Uczeń może stworzyć zgłoszenie tylko dla siebie i jeśli jest zweryfikowany
        allow create: if request.resource.data.studentId == request.auth.uid &&
                         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isVerified == true;

        // Uczeń może czytać swoje zgłoszenia. Nauczyciel może czytać zgłoszenia swojej klasy.
        allow read: if request.auth.uid == resource.data.studentId || isTeacherOfClass(resource.data.classId);

        // Nauczyciel może zaktualizować status zgłoszenia w swojej klasie (np. odrzucić)
        allow update: if isTeacherOfClass(request.resource.data.classId) &&
                         request.resource.data.status == 'rejected';
    }

    // Szablony wyzwań (challengeTemplates)
    match /challengeTemplates/{templateId} {
      // Każdy zalogowany użytkownik (uczeń, nauczyciel) może czytać szablony
      allow read: if request.auth != null;
      // Tylko administrator (EKOSKOP) może tworzyć, edytować i usuwać szablony
      allow write: if isRequestUserEkoskop();
    }

    // Wyzwania przypisane do klas (assignedChallenges)
    match /assignedChallenges/{assignmentId} {
      // Uczeń może odczytać tylko wyzwania przypisane do jego klasy
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.classId == resource.data.classId;

      // Nauczyciel może TWORZYĆ nowe przypisania tylko dla SWOJEJ klasy
      allow create: if isTeacherOfClass(request.resource.data.classId);

      // Nauczyciel może edytować/usuwać tylko te przypisania, które sam stworzył
      allow update, delete: if request.auth.uid == resource.data.teacherId;
    }

    // Zgłoszenia EkoWyzwań (challengeSubmissions)
    match /challengeSubmissions/{submissionId} {
      // Uczeń może stworzyć zgłoszenie dla siebie i jeśli jest zweryfikowany
      allow create: if request.resource.data.studentId == request.auth.uid &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isVerified == true;

      // Uczeń może czytać swoje zgłoszenia. Nauczyciel może czytać zgłoszenia swojej klasy.
      allow read: if request.auth.uid == resource.data.studentId || isTeacherOfClass(resource.data.classId);

      // Nauczyciel może zaktualizować status (odrzucić) zgłoszenie w swojej klasie.
      allow update: if isTeacherOfClass(request.resource.data.classId);
    }

    // Reguły dla szablonów odznak
    match /badgeTemplates/{badgeId} {
      // Każdy zalogowany użytkownik może czytać definicje odznak
      allow read: if request.auth.id != null;
      // Tylko EKOSKOP może tworzyć i modyfikować odznaki
      allow write: if isRequestUserEkoskop();
    }
  }

  // Reguły dla feedu aktywności
  match /activityFeeds/{classId}/items/{itemId} {

      // POZWÓL NA ODCZYT: tylko jeśli ID klasy w dokumencie
      // jest takie samo jak ID klasy zalogowanego użytkownika.
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.classId == classId;

      // ZABLOKUJ ZAPIS: Nikt nie może tworzyć, edytować ani usuwać
      // wpisów z poziomu aplikacji. To mogą robić tylko Cloud Functions.
      allow write: if false;
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
