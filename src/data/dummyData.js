// saveSome – Dummy Data
// Simulates Wiener Netze smart meter integration

export const user = {
  id: 'u01',
  name: 'Alex M.',
  email: 'alex.mueller@gmail.com',
  avatar: null,
  friends: 12,
  monthlyGoalKwh: 180,
  monthlyGoalEur: 144.0,
  strompreis: 0.30, // €/kWh
};

export const rooms = [
  { id: 'wohnzimmer',     name: 'Wohnzimmer',     icon: 'tv-outline' },
  { id: 'kueche',         name: 'Küche',           icon: 'restaurant-outline' },
  { id: 'bad',            name: 'Bad',             icon: 'water-outline' },
  { id: 'schlafzimmer',   name: 'Schlafzimmer',    icon: 'bed-outline' },
  { id: 'hauswirtschaft', name: 'Hauswirtschaft',  icon: 'settings-outline' },
];

export const devices = [
  {
    id: 'g01',
    name: 'AEG Kühlschrank',
    model: 'AEG Santo 9000',
    room_id: 'kueche',
    icon: 'cube-outline',
    energyClass: 'A+++',
    watt: 80,
    kwh_per_day: 1.92,
    status: 'active',
    start_time: '00:00',
    end_time: '24:00',
    type: 'dauerbetrieb',
    pnc: '923 421 406',
  },
  {
    id: 'g02',
    name: 'Smart TV',
    model: 'Samsung Neo QLED 65"',
    room_id: 'wohnzimmer',
    icon: 'tv-outline',
    energyClass: 'A+',
    watt: 120,
    kwh_per_day: 0.54,
    status: 'active',
    start_time: '18:30',
    end_time: '23:00',
    type: 'lang',
    pnc: '847 302 115',
  },
  {
    id: 'g03',
    name: 'Deckenlampe',
    model: 'Philips Hue Gradient',
    room_id: 'wohnzimmer',
    icon: 'bulb-outline',
    energyClass: 'A++',
    watt: 10,
    kwh_per_day: 0.05,
    status: 'active',
    start_time: '18:00',
    end_time: '23:00',
    type: 'lang',
    pnc: '334 921 007',
  },
  {
    id: 'g04',
    name: 'Sound System',
    model: 'Sonos Era 300',
    room_id: 'wohnzimmer',
    icon: 'volume-high-outline',
    energyClass: 'A+',
    watt: 35,
    kwh_per_day: 0.14,
    status: 'idle',
    start_time: '19:00',
    end_time: '22:00',
    type: 'mittel',
    pnc: '551 004 882',
  },
  {
    id: 'g05',
    name: 'Kaffeemaschine',
    model: 'DeLonghi Magnifica',
    room_id: 'kueche',
    icon: 'cafe-outline',
    energyClass: 'A++',
    watt: 900,
    kwh_per_day: 0.075,
    status: 'idle',
    start_time: '07:00',
    end_time: '07:30',
    type: 'kurz',
    pnc: '772 510 334',
  },
  {
    id: 'g06',
    name: 'Mikrowelle',
    model: 'Bosch Serie 6',
    room_id: 'kueche',
    icon: 'radio-outline',
    energyClass: 'A+',
    watt: 800,
    kwh_per_day: 0.10,
    status: 'idle',
    start_time: '12:00',
    end_time: '12:20',
    type: 'kurz',
    pnc: '663 188 220',
  },
  {
    id: 'g07',
    name: 'Geschirrspüler',
    model: 'Siemens iQ700',
    room_id: 'kueche',
    icon: 'water-outline',
    energyClass: 'A+++',
    watt: 1200,
    kwh_per_day: 0.60,
    status: 'active',
    start_time: '13:00',
    end_time: '14:30',
    type: 'mittel',
    pnc: '441 077 993',
  },
  {
    id: 'g08',
    name: 'Waschmaschine',
    model: 'Miele W1 Edition',
    room_id: 'hauswirtschaft',
    icon: 'reload-outline',
    energyClass: 'A+++',
    watt: 2000,
    kwh_per_day: 1.00,
    status: 'idle',
    start_time: '09:00',
    end_time: '10:30',
    type: 'mittel',
    pnc: '920 334 667',
  },
  {
    id: 'g09',
    name: 'Haartrockner',
    model: 'Dyson Supersonic',
    room_id: 'bad',
    icon: 'flash-outline',
    energyClass: 'B',
    watt: 1800,
    kwh_per_day: 0.075,
    status: 'idle',
    start_time: '07:00',
    end_time: '07:15',
    type: 'kurz',
    pnc: '118 554 329',
  },
  {
    id: 'g10',
    name: 'WLAN-Router',
    model: 'Fritz!Box 7590 AX',
    room_id: 'schlafzimmer',
    icon: 'wifi-outline',
    energyClass: 'A',
    watt: 12,
    kwh_per_day: 0.288,
    status: 'active',
    start_time: '00:00',
    end_time: '24:00',
    type: 'dauerbetrieb',
    pnc: '005 881 447',
  },
];

// Wiener Netze Smart Meter – simulierte Stundenwerte (kWh pro Stunde)
export const todayHourly = [
  { hour: 0,  kwh: 0.09, label: '0h' },
  { hour: 1,  kwh: 0.09, label: '1h' },
  { hour: 2,  kwh: 0.09, label: '2h' },
  { hour: 3,  kwh: 0.08, label: '3h' },
  { hour: 4,  kwh: 0.09, label: '4h' },
  { hour: 5,  kwh: 0.09, label: '5h' },
  { hour: 6,  kwh: 0.22, label: '6h' },
  { hour: 7,  kwh: 1.38, label: '7h' },
  { hour: 8,  kwh: 0.14, label: '8h' },
  { hour: 9,  kwh: 0.14, label: '9h' },
  { hour: 10, kwh: 0.25, label: '10h' },
  { hour: 11, kwh: 0.20, label: '11h' },
  { hour: 12, kwh: 1.64, label: '12h' },
  { hour: 13, kwh: 1.26, label: '13h' },
  { hour: 14, kwh: 0.14, label: '14h' },
  { hour: 15, kwh: 0.14, label: '15h' },
  { hour: 16, kwh: 0.14, label: '16h' },
  { hour: 17, kwh: 0.14, label: '17h' },
  { hour: 18, kwh: 2.19, label: '18h' },
  { hour: 19, kwh: 2.34, label: '19h' },
  { hour: 20, kwh: 0.30, label: '20h' },
  { hour: 21, kwh: 0.30, label: '21h' },
  { hour: 22, kwh: 0.14, label: '22h' },
  { hour: 23, kwh: 0.13, label: '23h' },
];

// Wochendaten (letzte 7 Tage) — passend zu Analyse-Screen
export const weeklyData = [
  { day: 'Mo', kwh: 4.2,  vorjahr: 5.1 },
  { day: 'Di', kwh: 5.8,  vorjahr: 6.0 },
  { day: 'Mi', kwh: 3.1,  vorjahr: 4.8 },
  { day: 'Do', kwh: 8.4,  vorjahr: 7.2 },
  { day: 'Fr', kwh: 4.7,  vorjahr: 5.5 },
  { day: 'Sa', kwh: 6.2,  vorjahr: 7.8 },
  { day: 'So', kwh: 5.1,  vorjahr: 6.3 },
];

export const monthlyData = [
  { label: 'Jan', kwh: 145 },
  { label: 'Feb', kwh: 132 },
  { label: 'Mär', kwh: 120 },
  { label: 'Apr', kwh: 110 },
  { label: 'Mai', kwh: 98  },
  { label: 'Jun', kwh: 88  },
  { label: 'Jul', kwh: 92  },
  { label: 'Aug', kwh: 95  },
  { label: 'Sep', kwh: 102 },
  { label: 'Okt', kwh: 118 },
  { label: 'Nov', kwh: 130 },
  { label: 'Dez', kwh: 148 },
];

export const yearlyData = [
  { label: '2022', kwh: 1420 },
  { label: '2023', kwh: 1380 },
  { label: '2024', kwh: 1310 },
  { label: '2025', kwh: 1278 },
];

// Top Verbraucher (nach absoluten kWh/Monat)
export const topConsumers = [
  { device_id: 'g01', name: 'Kühlschrank',    kwh_month: 57.6,  percent: 31, color: '#00d4aa' },
  { device_id: 'g02', name: 'Smart TV',       kwh_month: 16.2,  percent: 9,  color: '#00b894' },
  { device_id: 'g08', name: 'Waschmaschine',  kwh_month: 13.0,  percent: 7,  color: '#0984e3' },
  { device_id: 'g07', name: 'Geschirrspüler', kwh_month: 9.0,   percent: 5,  color: '#6c5ce7' },
  { device_id: 'g05', name: 'Kaffeemaschine', kwh_month: 2.25,  percent: 2,  color: '#fdcb6e' },
  { device_id: 'other', name: 'Sonstige',     kwh_month: 87.0,  percent: 46, color: '#2d3436' },
];

// Verbrauch nach Raum
export const roomConsumption = [
  { room_id: 'kueche',         kwh_month: 69.3,  percent: 38 },
  { room_id: 'wohnzimmer',     kwh_month: 39.9,  percent: 22 },
  { room_id: 'hauswirtschaft', kwh_month: 36.5,  percent: 20 },
  { room_id: 'schlafzimmer',   kwh_month: 14.6,  percent: 8  },
  { room_id: 'bad',            kwh_month: 21.9,  percent: 12 },
];

// Aktueller Monat Zusammenfassung
export const currentMonth = {
  kwh: 120,
  eur: 36.0,
  goalKwh: 180,
  goalEur: 144.0,
  percentOfGoal: 67,
  vsLastMonth: -8,    // % besser als Vormonat
  vsVorjahr: -15,
};

// Freunde-Vergleich (Profile Screen)
export const friendsComparison = {
  userKwh: 140,
  friendsAvgKwh: 165,
  percentBetter: 15,
  globalAvgKwh: 210,
  globalPercentile: 20, // Top 20%
};

// Amortisationsrechner – Beispielgeräte
export const amortizationDevices = [
  { id: 'g01', name: 'Kühlschrank', currentKwh: 80,  newKwh: 40,  newPrice: 799  },
  { id: 'g02', name: 'Smart TV',    currentKwh: 120, newKwh: 80,  newPrice: 1299 },
  { id: 'g08', name: 'Waschmaschine', currentKwh: 2000, newKwh: 1600, newPrice: 899 },
];

// Energiespartipps (für personalisierte Tips)
export const energyTips = [
  {
    id: 't01',
    device: 'Kühlschrank',
    tip: 'Stelle den Kühlschrank auf 7°C — jedes Grad wärmer spart 6% Energie.',
    saving_kwh_month: 3.5,
    saving_eur_month: 1.05,
  },
  {
    id: 't02',
    device: 'Waschmaschine',
    tip: 'Wasche bei 30°C statt 60°C — das spart bis zu 60% Energie pro Waschgang.',
    saving_kwh_month: 5.2,
    saving_eur_month: 1.56,
  },
  {
    id: 't03',
    device: 'Smart TV',
    tip: 'Aktiviere den Eco-Modus — reduziert Helligkeit automatisch und spart ~20%.',
    saving_kwh_month: 1.8,
    saving_eur_month: 0.54,
  },
];

// Stromrechnung OCR – simulierte Daten (nach Scan)
export const billScanResult = {
  anbieter: 'Wien Energie',
  zeitraum: 'Jänner – April 2025',
  gesamtVerbrauch_kwh: 487,
  gesamtKosten_eur: 146.10,
  grundgebuehr_eur: 12.50,
  arbeitspreis_cent_kwh: 27.3,
  zaehlerstand_von: 12840,
  zaehlerstand_bis: 13327,
  scanned: true,
};
