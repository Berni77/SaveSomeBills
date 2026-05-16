import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, typography, spacing, radius } from '../data/theme';
import AppHeader from '../components/AppHeader';
import { getAllDevices, insertDevice } from '../data/database';

// ─── Full device database ─────────────────────────────────────────────────────
const ALL_DEVICES = [
  // Küche
  { id: 'db01', name: 'AEG Santo 9000',       category: 'Kühlschrank',    energyClass: 'A++',   watt: 80,   desc: 'Kühl-Gefrierkombi',          pnc: '923 421 406', icon: 'cube-outline',      room: 'kueche' },
  { id: 'db02', name: 'AEG CustomFlex',        category: 'Kühlschrank',    energyClass: 'A++++', watt: 60,   desc: 'Energiesparmodell',           pnc: '923 421 407', icon: 'cube-outline',      room: 'kueche' },
  { id: 'db03', name: 'Liebherr CBNd 5723',    category: 'Kühlschrank',    energyClass: 'A+++',  watt: 70,   desc: 'NoFrost Kühlschrank',         pnc: '810 334 221', icon: 'cube-outline',      room: 'kueche' },
  { id: 'db04', name: 'Siemens iQ700',         category: 'Geschirrspüler', energyClass: 'A+++',  watt: 1200, desc: 'Spülmaschine 60cm',           pnc: '441 077 993', icon: 'water-outline',     room: 'kueche' },
  { id: 'db05', name: 'Bosch Serie 8',         category: 'Geschirrspüler', energyClass: 'A+++',  watt: 1100, desc: 'Leise Spülmaschine',          pnc: '552 881 004', icon: 'water-outline',     room: 'kueche' },
  { id: 'db06', name: 'DeLonghi Magnifica',    category: 'Kaffeemaschine', energyClass: 'A++',   watt: 900,  desc: 'Kaffeevollautomat',           pnc: '772 510 334', icon: 'cafe-outline',      room: 'kueche' },
  { id: 'db07', name: 'Jura E8',               category: 'Kaffeemaschine', energyClass: 'A+',    watt: 1450, desc: 'Premium Kaffeevollautomat',   pnc: '339 004 778', icon: 'cafe-outline',      room: 'kueche' },
  { id: 'db08', name: 'Bosch Serie 6',         category: 'Mikrowelle',     energyClass: 'A+',    watt: 800,  desc: 'Einbau-Mikrowelle',           pnc: '663 188 220', icon: 'radio-outline',     room: 'kueche' },
  { id: 'db09', name: 'Miele M7244TC',         category: 'Mikrowelle',     energyClass: 'A',     watt: 900,  desc: 'Mikrowelle mit Grill',        pnc: '774 002 551', icon: 'radio-outline',     room: 'kueche' },
  { id: 'db10', name: 'Philips HD9741',        category: 'Heißluftfritteuse', energyClass: 'A',  watt: 1400, desc: 'XXL Air Fryer',              pnc: '883 441 009', icon: 'flame-outline',     room: 'kueche' },
  { id: 'db11', name: 'WMF Kult Pro',          category: 'Wasserkocher',   energyClass: 'A++',   watt: 2200, desc: 'Wasserkocher 1.6L',          pnc: '116 773 882', icon: 'thermometer-outline',room: 'kueche' },
  // Wohnzimmer
  { id: 'db12', name: 'Samsung Neo QLED 65"',  category: 'Fernseher',      energyClass: 'A+',    watt: 120,  desc: '65 Zoll Smart TV 4K',        pnc: '847 302 115', icon: 'tv-outline',        room: 'wohnzimmer' },
  { id: 'db13', name: 'LG OLED C3 55"',        category: 'Fernseher',      energyClass: 'A++',   watt: 95,   desc: '55 Zoll OLED Smart TV',      pnc: '229 558 334', icon: 'tv-outline',        room: 'wohnzimmer' },
  { id: 'db14', name: 'Philips OLED 807',      category: 'Fernseher',      energyClass: 'A+',    watt: 110,  desc: '48 Zoll Ambilight TV',       pnc: '445 003 771', icon: 'tv-outline',        room: 'wohnzimmer' },
  { id: 'db15', name: 'Sonos Era 300',         category: 'Sound System',   energyClass: 'A+',    watt: 35,   desc: 'Dolby Atmos Lautsprecher',   pnc: '551 004 882', icon: 'volume-high-outline',room: 'wohnzimmer' },
  { id: 'db16', name: 'Sony PlayStation 5',    category: 'Spielekonsole',  energyClass: 'B',     watt: 200,  desc: 'Gaming Konsole',             pnc: '330 119 667', icon: 'game-controller-outline', room: 'wohnzimmer' },
  { id: 'db17', name: 'Microsoft Xbox Series X', category: 'Spielekonsole', energyClass: 'B',    watt: 180,  desc: 'Gaming Konsole',             pnc: '441 220 998', icon: 'game-controller-outline', room: 'wohnzimmer' },
  { id: 'db18', name: 'Fritz!Box 7590 AX',     category: 'Router',         energyClass: 'A',     watt: 12,   desc: 'WLAN-Router',                pnc: '005 881 447', icon: 'wifi-outline',      room: 'wohnzimmer' },
  // Hauswirtschaft
  { id: 'db19', name: 'Miele W1 Edition',      category: 'Waschmaschine',  energyClass: 'A+++',  watt: 2000, desc: 'Energieeffiziente Waschmaschine', pnc: '920 334 667', icon: 'reload-outline', room: 'hauswirtschaft' },
  { id: 'db20', name: 'Bosch WAV28G00',        category: 'Waschmaschine',  energyClass: 'A+++',  watt: 1800, desc: 'HomeConnect Waschmaschine',  pnc: '771 009 334', icon: 'reload-outline',    room: 'hauswirtschaft' },
  { id: 'db21', name: 'Miele T1',              category: 'Wäschetrockner', energyClass: 'A+++',  watt: 2500, desc: 'Wärmepumpentrockner',        pnc: '881 220 004', icon: 'sunny-outline',     room: 'hauswirtschaft' },
  { id: 'db22', name: 'Siemens iQ700 Trockner',category: 'Wäschetrockner', energyClass: 'A++',   watt: 2200, desc: 'Wärmepumpentrockner',        pnc: '334 778 110', icon: 'sunny-outline',     room: 'hauswirtschaft' },
  // Bad
  { id: 'db23', name: 'Dyson Supersonic',      category: 'Haartrockner',   energyClass: 'B',     watt: 1800, desc: 'Hitzeschutz-Haartrockner',   pnc: '118 554 329', icon: 'flash-outline',     room: 'bad' },
  { id: 'db24', name: 'Braun Satin Hair 7',    category: 'Haartrockner',   energyClass: 'C',     watt: 2200, desc: 'Ionen-Haartrockner',         pnc: '229 667 881', icon: 'flash-outline',     room: 'bad' },
  // Schlafzimmer/Büro
  { id: 'db25', name: 'Apple MacBook Pro M3',  category: 'Laptop',         energyClass: 'A+++',  watt: 30,   desc: 'MacBook Pro 14 Zoll',        pnc: '773 441 002', icon: 'laptop-outline',    room: 'schlafzimmer' },
  { id: 'db26', name: 'Dell XPS 15',           category: 'Laptop',         energyClass: 'A+',    watt: 65,   desc: 'Premium Laptop',             pnc: '882 003 559', icon: 'laptop-outline',    room: 'schlafzimmer' },
  { id: 'db27', name: 'LG 27UK850',            category: 'Monitor',        energyClass: 'A+',    watt: 30,   desc: '27 Zoll 4K Monitor',         pnc: '441 880 003', icon: 'desktop-outline',   room: 'schlafzimmer' },
];

const CATEGORIES = ['Alle', ...new Set(ALL_DEVICES.map(d => d.category))];

const ROOMS = [
  { id: 'kueche',         label: 'Küche' },
  { id: 'wohnzimmer',     label: 'Wohnzimmer' },
  { id: 'bad',            label: 'Bad' },
  { id: 'schlafzimmer',   label: 'Schlafzimmer' },
  { id: 'hauswirtschaft', label: 'Hauswirtschaft' },
];

const ROOM_LABELS = Object.fromEntries(ROOMS.map(r => [r.id, r.label]));

export default function AddScreen() {
  const [mode, setMode] = useState('scan');
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('Alle');
  const [addedDevices, setAddedDevices] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    getAllDevices().then(rows => {
      const existingIds = rows.map(r => r.id);
      setAddedDevices(ALL_DEVICES.filter(d => existingIds.includes(d.id)).map(d => d.id));
    }).catch(() => {});
  }, []);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customWatt, setCustomWatt] = useState('');
  const [customEnergyClass, setCustomEnergyClass] = useState('');
  const [customRoom, setCustomRoom] = useState('');

  const filtered = ALL_DEVICES.filter(d => {
    const matchCat   = selectedCat === 'Alle' || d.category === selectedCat;
    const matchQuery = query.length < 2 || d.name.toLowerCase().includes(query.toLowerCase()) || d.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const addDevice = async (device) => {
    if (addedDevices.includes(device.id)) {
      Alert.alert('Bereits hinzugefügt', `${device.name} ist bereits verknüpft.`);
      return;
    }
    try {
      await insertDevice({
        id:          device.id,
        name:        device.name,
        room_id:     device.room,
        icon:        device.icon,
        energyClass: device.energyClass,
        watt:        device.watt,
        type:        device.category,
        pnc:         device.pnc,
      });
      setAddedDevices(prev => [...prev, device.id]);
      const roomLabels = { kueche: 'Küche', wohnzimmer: 'Wohnzimmer', bad: 'Bad', schlafzimmer: 'Schlafzimmer', hauswirtschaft: 'Hauswirtschaft' };
      Alert.alert('✓ Gerät verknüpft', `${device.name} wurde erfolgreich zu "${roomLabels[device.room] ?? device.room}" hinzugefügt.`);
    } catch (e) {
      Alert.alert('Fehler', 'Gerät konnte nicht gespeichert werden.');
    }
  };

  const addCustomDevice = async () => {
    if (!customName.trim()) {
      Alert.alert('Pflichtfeld', 'Bitte gib einen Gerätenamen ein.');
      return;
    }
    if (!customRoom) {
      Alert.alert('Pflichtfeld', 'Bitte wähle einen Raum aus.');
      return;
    }
    try {
      await insertDevice({
        id:          `custom_${Date.now()}`,
        name:        customName.trim(),
        room_id:     customRoom,
        icon:        'cube-outline',
        energyClass: customEnergyClass.trim() || null,
        watt:        parseInt(customWatt, 10) || 0,
        type:        customCategory.trim() || null,
      });
      setCustomModalVisible(false);
      setCustomName('');
      setCustomCategory('');
      setCustomWatt('');
      setCustomEnergyClass('');
      setCustomRoom('');
      Alert.alert('✓ Gerät hinzugefügt', `${customName.trim()} wurde zu "${ROOM_LABELS[customRoom]}" hinzugefügt.`);
    } catch (e) {
      Alert.alert('Fehler', 'Gerät konnte nicht gespeichert werden.');
    }
  };

  const handleScanPress = async () => {
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Kamera-Berechtigung', 'Bitte erlaube den Kamerazugriff in den Einstellungen, um Geräte zu scannen.');
        return;
      }
    }
    setScanned(false);
    setCameraVisible(true);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    setCameraVisible(false);
    // Simulate matching a PNC from barcode
    const matched = ALL_DEVICES.find(d => d.pnc.replace(/\s/g, '') === data.replace(/\s/g, ''));
    if (matched) {
      Alert.alert('Gerät erkannt!', `${matched.name} gefunden.\nEnergieklasse: ${matched.energyClass}`, [
        { text: 'Hinzufügen', onPress: () => addDevice(matched) },
        { text: 'Abbrechen' },
      ]);
    } else {
      // Show simulated result
      setMode('manual');
      setQuery(data.substring(0, 12));
      Alert.alert('Barcode gescannt', `Code: ${data}\n\nDu kannst das Gerät auch manuell suchen.`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      {/* ── Camera Modal ─────────────────────────────────────────────────── */}
      <Modal visible={cameraVisible} animationType="slide" onRequestClose={() => setCameraVisible(false)}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'code128', 'code39'] }}
          />
          {/* Overlay */}
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraHint}>Positioniere das Typschild im Rahmen</Text>
            <View style={styles.scanFrameBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Text style={styles.scanningLabel}>SCANNING...</Text>
            </View>
            <TouchableOpacity style={styles.closeCameraBtn} onPress={() => setCameraVisible(false)}>
              <Ionicons name="close-circle" size={48} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Custom Device Modal ──────────────────────────────────────────── */}
      <Modal visible={customModalVisible} animationType="slide" transparent onRequestClose={() => setCustomModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.customModalOverlay}>
          <View style={styles.customModalSheet}>
            <View style={styles.customModalHeader}>
              <Text style={styles.customModalTitle}>Eigenes Gerät erfassen</Text>
              <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.customLabel}>Gerätename *</Text>
              <View style={styles.customInput}>
                <TextInput
                  style={styles.customInputText}
                  placeholder="z.B. Dyson Staubsauger"
                  placeholderTextColor={colors.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />
              </View>

              <Text style={styles.customLabel}>Kategorie</Text>
              <View style={styles.customInput}>
                <TextInput
                  style={styles.customInputText}
                  placeholder="z.B. Staubsauger"
                  placeholderTextColor={colors.textMuted}
                  value={customCategory}
                  onChangeText={setCustomCategory}
                />
              </View>

              <View style={styles.customRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customLabel}>Verbrauch (Watt)</Text>
                  <View style={styles.customInput}>
                    <TextInput
                      style={styles.customInputText}
                      placeholder="z.B. 500"
                      placeholderTextColor={colors.textMuted}
                      value={customWatt}
                      onChangeText={setCustomWatt}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customLabel}>Energieklasse</Text>
                  <View style={styles.customInput}>
                    <TextInput
                      style={styles.customInputText}
                      placeholder="z.B. A+"
                      placeholderTextColor={colors.textMuted}
                      value={customEnergyClass}
                      onChangeText={setCustomEnergyClass}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.customLabel}>Raum *</Text>
              <View style={styles.customRoomGrid}>
                {ROOMS.map(r => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.customRoomBtn, customRoom === r.id ? styles.customRoomBtnActive : null]}
                    onPress={() => setCustomRoom(r.id)}
                  >
                    <Text style={[styles.customRoomBtnText, customRoom === r.id ? styles.customRoomBtnTextActive : null]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.customSubmitBtn} onPress={addCustomDevice}>
                <Ionicons name="add-circle-outline" size={18} color={colors.bg} style={{ marginRight: 8 }} />
                <Text style={styles.customSubmitText}>Gerät hinzufügen</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Mode Toggle ───────────────────────────────────────────────── */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'scan' ? styles.modeBtnActive : null]}
            onPress={() => setMode('scan')}
          >
            <Ionicons name="scan-outline" size={16} color={mode === 'scan' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.modeBtnText, mode === 'scan' ? styles.modeBtnTextActive : null]}>Scannen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'manual' ? styles.modeBtnActive : null]}
            onPress={() => setMode('manual')}
          >
            <Ionicons name="search-outline" size={16} color={mode === 'manual' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.modeBtnText, mode === 'manual' ? styles.modeBtnTextActive : null]}>Manuelle Suche</Text>
          </TouchableOpacity>
        </View>

        {mode === 'scan' ? (
          <View style={styles.scanCard}>
            <Text style={styles.scanHint}>
              Positioniere das Typschild deines Geräts im Rahmen, um es automatisch zu erfassen.
            </Text>
            <View style={styles.scanPreview}>
              <Ionicons name="barcode-outline" size={56} color={colors.accent} />
              <Text style={styles.scanPreviewText}>Kamera bereit</Text>
            </View>
            <TouchableOpacity style={styles.scanBtn} onPress={handleScanPress}>
              <Ionicons name="camera-outline" size={18} color={colors.bg} style={{ marginRight: 8 }} />
              <Text style={styles.scanBtnText}>Scan starten</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.manualBtn} onPress={() => setMode('manual')}>
              <Ionicons name="create-outline" size={18} color={colors.textPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.manualBtnText}>Manuelle Suche</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.manualCard}>
            <Text style={styles.manualTitle}>Gerät hinzufügen</Text>
            <Text style={styles.manualSub}>Suche und verbinde ein neues Gerät.</Text>

            {/* Search */}
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Gerätename suchen..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
              />
              {query.length > 0 ? (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ gap: 6, paddingRight: spacing.base }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, selectedCat === cat ? styles.catBtnActive : null]}
                  onPress={() => setSelectedCat(cat)}
                >
                  <Text style={[styles.catBtnText, selectedCat === cat ? styles.catBtnTextActive : null]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Results count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Geräte</Text>
              <Text style={styles.resultsCount}>{filtered.length} gefunden</Text>
            </View>

            {/* Device list */}
            {filtered.map(device => {
              const isAdded = addedDevices.includes(device.id);
              return (
                <View key={device.id} style={styles.resultCard}>
                  <View style={styles.resultIconWrap}>
                    <Ionicons name={device.icon} size={20} color={colors.accent} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{device.name}</Text>
                    <View style={styles.resultMeta}>
                      <View style={styles.classBadge}>
                        <Text style={styles.classBadgeValue}>{device.energyClass}</Text>
                      </View>
                      <Text style={styles.resultDesc}>{device.category} · {device.watt}W</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.addBtn, isAdded ? styles.addBtnDone : null]}
                    onPress={() => addDevice(device)}
                  >
                    <Ionicons name={isAdded ? 'checkmark' : 'add'} size={20} color={isAdded ? colors.success : colors.bg} />
                  </TouchableOpacity>
                </View>
              );
            })}

            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={36} color={colors.textMuted} />
                <Text style={styles.emptyText}>Keine Geräte gefunden</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.customDeviceBtn} onPress={() => setCustomModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={styles.customDeviceBtnText}>Gerät nicht gefunden? Manuell erfassen</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  cameraContainer: { flex: 1, backgroundColor: 'black' },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 50 },
  cameraHint: { color: 'white', fontSize: 16, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  scanFrameBox: { width: 260, height: 200, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.accent, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanningLabel: { color: colors.accent, fontWeight: '700', fontSize: 13, letterSpacing: 2 },
  closeCameraBtn: { opacity: 0.9 },

  modeRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.base, marginVertical: spacing.base },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  modeBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  modeBtnText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: '500' },
  modeBtnTextActive: { color: colors.accent },

  scanCard: { marginHorizontal: spacing.base, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  scanHint: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.base, lineHeight: 18 },
  scanPreview: { height: 160, backgroundColor: colors.bgCardLight, borderRadius: radius.lg, marginBottom: spacing.base, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  scanPreviewText: { color: colors.textSecondary, marginTop: 8, fontSize: typography.fontSizes.sm },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, marginBottom: spacing.sm },
  scanBtnText: { color: colors.bg, fontWeight: '700', fontSize: typography.fontSizes.md },
  manualBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCardLight, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  manualBtnText: { color: colors.textPrimary, fontWeight: '600', fontSize: typography.fontSizes.md },

  manualCard: { marginHorizontal: spacing.base, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  manualTitle: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginBottom: 4 },
  manualSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.base },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCardLight, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.fontSizes.sm },
  catScroll: { marginBottom: spacing.base },
  catBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCardLight },
  catBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  catBtnText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  catBtnTextActive: { color: colors.accent, fontWeight: '600' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  resultsTitle: { fontSize: typography.fontSizes.base, fontWeight: '600', color: colors.textPrimary },
  resultsCount: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, backgroundColor: colors.bgCardLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgCardLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  resultIconWrap: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.accentGlow, justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: typography.fontSizes.md, fontWeight: '600', color: colors.textPrimary },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  classBadge: { backgroundColor: colors.accentGlow, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 1, borderWidth: 1, borderColor: colors.accent },
  classBadgeValue: { fontSize: typography.fontSizes.xs, color: colors.accent, fontWeight: '700' },
  resultDesc: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, flex: 1 },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  addBtnDone: { backgroundColor: colors.bgCardLight, borderWidth: 1, borderColor: colors.success },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontSize: typography.fontSizes.lg, color: colors.textSecondary, marginTop: spacing.md },

  customDeviceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, borderStyle: 'dashed' },
  customDeviceBtnText: { fontSize: typography.fontSizes.sm, color: colors.accent, fontWeight: '500' },

  customModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  customModalSheet: { backgroundColor: colors.bgCard, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.base, paddingBottom: spacing.xxl, maxHeight: '90%' },
  customModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  customModalTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.textPrimary },

  customLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.xs, marginTop: spacing.md },
  customInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCardLight, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.borderLight },
  customInputText: { flex: 1, color: colors.textPrimary, fontSize: typography.fontSizes.sm },
  customRow: { flexDirection: 'row', gap: spacing.sm },
  customRoomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  customRoomBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCardLight },
  customRoomBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  customRoomBtnText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  customRoomBtnTextActive: { color: colors.accent, fontWeight: '600' },
  customSubmitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, marginTop: spacing.xl },
  customSubmitText: { color: colors.bg, fontWeight: '700', fontSize: typography.fontSizes.md },
});
