# saveSome

Haushaltsstromverbrauch-App mit simulierter Wiener Netze Smart Meter Integration.

## Starten

```bash
npm install --legacy-peer-deps
npx expo start
```

Dann:
- `i` → iOS Simulator
- `a` → Android Emulator  
- QR-Code scannen → Expo Go App

## Screens
- **Home** – Geräte nach Raum, Monatskosten, Ziel-Fortschritt
- **Analyse** – Balkendiagramm Woche/Monat/Jahr, Top Verbraucher, Amortisationsrechner
- **Add** – Typenschild scannen + Manuelle Suche
- **Profil** – Freundesvergleich, globales Ranking

## Struktur
```
src/
  data/
    dummyData.js   ← alle Dummy-Daten (Geräte, Wiener Netze Stundenwerte, ...)
    theme.js       ← Farben, Schriften, Abstände
  screens/         ← je ein File pro Screen
  components/      ← AppHeader, DeviceItem
  navigation/      ← Bottom Tab + Stack Navigator
```
