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



## Readme - M3

* Gruppe:	4
* Team-Nr.: 409
* Projektthema: SaveSomeBills

### Implementierung

Framework:	React Native iOS 

API-Version:	iOS 14

GerÃ¤t(e), auf dem(denen) getestet wurde:
iPhone 12 mini

Externe Libraries und Frameworks:

@react-navigation/native
@react-navigation/bottom-tabs
@react-navigation/native-stack

expo-sqlite
expo-camera
expo-status-bar
expo-font
@expo/vector-icons
@expo/vector-icons

react-native-gesture-handler
react-native-screens
react-native-safe-area-context

Dauer der Entwicklung:
5h 30min

Weitere Anmerkungen:
