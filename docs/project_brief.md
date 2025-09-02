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
        }
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
