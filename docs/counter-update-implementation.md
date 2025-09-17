# System Aktualizacji Liczników i Odznak

## Implementacja ✅

System automatycznej aktualizacji liczników użytkownika po zatwierdzeniu zgłoszeń został pomyślnie zaimplementowany.

## Jak to działa

### 1. Zatwierdzenie zgłoszenia przez nauczyciela

Gdy nauczyciel zatwierdza zgłoszenie EkoDziałania lub EkoWyzwania w `SubmissionDetailPage.jsx`:

1. **Aktualizacja statusu zgłoszenia** - zgłoszenie zostaje oznaczone jako "approved"
2. **Aktualizacja liczników użytkownika** - automatycznie zwiększane są odpowiednie liczniki
3. **Sprawdzenie nowych odznak** - system sprawdza czy użytkownik zdobył nowe odznaki
4. **Wysłanie powiadomień** - użytkownik otrzymuje powiadomienie o nowych odznak
5. **Dodanie do feed aktywności** - informacja o nowych odznak pojawia się w feed klasy

### 2. Aktualizowane liczniki

#### Dla EkoDziałań (`type: "eco_action"`):

- `counters.totalActions` +1
- `counters.{categoryCounter}` +1 (np. `recyclingActions`, `savingActions`)

#### Dla EkoWyzwań (`type: "challenge"`):

- `counters.totalChallenges` +1
- `counters.{categoryCounter}` +1 (jeśli EkoWyzwanie ma przypisaną kategorię)

### 3. System odznak

System automatycznie:

- Sprawdza czy użytkownik osiągnął wymagane progi dla odznak
- Aktualizuje pole `earnedBadges` w profilu użytkownika
- Tworzy powiadomienia o nowych odznak
- Dodaje wpisy do feed aktywności klasy

### 4. Pliki zmodyfikowane

#### Nowy serwis: `src/services/userCounterService.js`

- `updateUserCountersOnApproval()` - główna funkcja aktualizująca liczniki
- `checkAndUpdateNewBadges()` - sprawdza i przyznaje nowe odznaki
- `revertUserCountersOnRejection()` - cofa liczniki przy odrzuceniu
- `getUserCounters()` - pobiera aktualne liczniki

#### Zmodyfikowany: `src/pages/teacher/SubmissionDetailPage.jsx`

- Dodano import nowego serwisu
- Zmodyfikowano funkcję `handleUpdateSubmission()`
- Zmodyfikowano funkcję `confirmRejectSubmission()`
- Dodano obsługę powiadomień o nowych odznak

## Przykład działania

```
1. Uczeń "Jan Kowalski" zgłasza EkoDziałanie "Segregacja śmieci" (kategoria: Recykling)
2. Nauczyciel zatwierdza zgłoszenie
3. System automatycznie:
   - Zwiększa `totalActions` z 9 do 10
   - Zwiększa `recyclingActions` z 2 do 3
   - Sprawdza czy 10 EkoDziałań = nowa odznaka "Eko Aktywista" poziom 1
   - Sprawdza czy 3 akcje recyklingu = nowa odznaka "Mistrz Recyklingu" poziom 1
   - Wysyła powiadomienie: "Gratulacje! Zdobyłeś odznakę Eko Aktywista poziom 1!"
   - Dodaje wpis do feed klasy: "Jan Kowalski otrzymał odznakę Eko Aktywista (poziom 1)"
```

## Zgodność ze strukturą bazy danych

System jest w pełni zgodny ze strukturą bazy opisaną w `project_brief.md`:

- ✅ Liczniki zgodne z `users/{userId}/counters`
- ✅ Odznaki zgodne z `users/{userId}/earnedBadges`
- ✅ Wykorzystuje `badgeTemplates/{badgeId}` i `counterToCheck`
- ✅ Integracja z systemem powiadomień
- ✅ Integracja z feed aktywności klasy

## Testowanie

Aby przetestować system:

1. Zaloguj się jako nauczyciel
2. Przejdź do listy zgłoszeń
3. Zatwierdź zgłoszenie ucznia
4. Sprawdź profil ucznia - liczniki powinny być zaktualizowane
5. Sprawdź sekcję odznak - nowe odznaki powinny być widoczne
6. Sprawdź powiadomienia ucznia
7. Sprawdź feed aktywności klasy
