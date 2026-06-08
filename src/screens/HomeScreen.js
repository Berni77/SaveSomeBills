import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../data/theme';
import { rooms, user, currentMonth, billScanResult, energyTips } from '../data/dummyData';
import { getAllDevices, getSettings, saveSetting } from '../data/database';
import AppHeader from '../components/AppHeader';
import DeviceItem from '../components/DeviceItem';

export default function HomeScreen({ navigation }) {
  const [devices, setDevices]   = useState([]);
  const [settings, setSettings] = useState({ monthlyGoalKwh: 180, strompreis: 0.30 });
  const [search, setSearch]     = useState('');
  const [billVisible, setBillVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('alle');
  const [goalVisible, setGoalVisible] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const GOAL_PRESETS = [100, 120, 150, 180, 200, 250];

  const saveGoal = async (kwh) => {
    const next = { ...settings, monthlyGoalKwh: kwh };
    setSettings(next);
    setGoalVisible(false);
    await saveSetting('monthlyGoalKwh', kwh);
  };

  // Lädt Geräte und Einstellungen neu, sobald der Screen fokussiert wird
  useFocusEffect(useCallback(() => {
    getAllDevices().then(setDevices);
    getSettings().then(setSettings);
  }, []));

  // Filtert Geräte nach dem Suchbegriff
  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // Gruppiert gefilterte Geräte nach Raum; leere Räume und nicht gewählte Räume werden ausgeblendet
  const devicesByRoom = rooms
    .filter(room => selectedRoom === 'alle' || room.id === selectedRoom)
    .map(room => ({
      ...room,
      devices: filtered.filter(d => d.room_id === room.id),
    })).filter(r => r.devices.length > 0);

  // Navigiert zur Detailansicht des gewählten Geräts
  const goToDevice = (device) => {
    navigation.navigate('DeviceDetail', { device });
  };

  // Berechnet den Fortschritt in % und wählt Farbe (grün/gelb/rot)
  const progressPct   = Math.min(Math.round((currentMonth.kwh / settings.monthlyGoalKwh) * 100), 100);
  const progressColor = progressPct > 85 ? colors.danger : progressPct > 65 ? colors.warning : colors.accent;
  const goalEur       = (settings.monthlyGoalKwh * settings.strompreis).toFixed(2);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader onScanPress={() => setBillVisible(true)} />

      <Modal visible={billVisible} transparent animationType="slide" onRequestClose={() => setBillVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.billCard}>
            <View style={styles.billHeader}>
              <Text style={styles.billTitle}>Stromrechnung scannen</Text>
              <TouchableOpacity onPress={() => setBillVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.scanFrame}>
              <Ionicons name="scan" size={60} color={colors.accent} />
              <Text style={styles.scanText}>Positioniere das Dokument im Rahmen</Text>
            </View>
            <View style={styles.billResult}>
              <Text style={styles.billResultTitle}>{billScanResult.anbieter}</Text>
              <Text style={styles.billResultSub}>{billScanResult.zeitraum}</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Gesamtverbrauch</Text>
                <Text style={styles.billValue}>{billScanResult.gesamtVerbrauch_kwh} kWh</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Gesamtkosten</Text>
                <Text style={styles.billValue}>{billScanResult.gesamtKosten_eur.toFixed(2)} €</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Zählerstand</Text>
                <Text style={styles.billValue}>{billScanResult.zaehlerstand_von} → {billScanResult.zaehlerstand_bis}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.billBtn} onPress={() => setBillVisible(false)}>
              <Text style={styles.billBtnText}>Daten übernehmen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={goalVisible} transparent animationType="slide" onRequestClose={() => setGoalVisible(false)}>
        <TouchableOpacity style={styles.goalOverlay} activeOpacity={1} onPress={() => setGoalVisible(false)}>
          <View style={styles.goalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.goalSheetHandle} />
            <Text style={styles.goalSheetTitle}>Monatliches Energieziel</Text>
            <Text style={styles.goalSheetSub}>Aktuell: {settings.monthlyGoalKwh} kWh</Text>
            <View style={styles.goalPresetGrid}>
              {GOAL_PRESETS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalPresetBtn, settings.monthlyGoalKwh === g && styles.goalPresetBtnActive]}
                  onPress={() => saveGoal(g)}
                >
                  <Text style={[styles.goalPresetText, settings.monthlyGoalKwh === g && styles.goalPresetTextActive]}>
                    {g} kWh
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 32 }} />
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeText}>Willkommen zu Hause</Text>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Geräte suchen..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomFilterScroll} contentContainerStyle={styles.roomFilterContent}>
          {[{ id: 'alle', name: 'Alle Räume' }, ...rooms].map(room => (
            <TouchableOpacity
              key={room.id}
              style={[styles.roomChip, selectedRoom === room.id ? styles.roomChipActive : null]}
              onPress={() => setSelectedRoom(room.id)}
            >
              <Text style={[styles.roomChipText, selectedRoom === room.id ? styles.roomChipTextActive : null]}>{room.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.costCard}>
          <Text style={styles.costLabel}>Geschätzte monatliche Kosten</Text>
          <Text style={styles.costValue}>{currentMonth.eur.toFixed(2)} €</Text>
        </View>

        <TouchableOpacity style={styles.goalCard} onPress={() => setGoalVisible(true)} activeOpacity={0.8}>
          <View style={styles.goalCardHeader}>
            <Text style={styles.goalLabel}>Monatliches Ziel</Text>
            <Ionicons name="create-outline" size={16} color={colors.accent} />
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: progressColor }]} />
          </View>
          <Text style={styles.goalSub}>
            {currentMonth.kwh} kWh ({currentMonth.eur.toFixed(2)} €){'\n'}
            von {settings.monthlyGoalKwh} kWh ({goalEur} €)
          </Text>
        </TouchableOpacity>

        {devicesByRoom.map(room => (
          <View key={room.id} style={styles.roomSection}>
            <Text style={styles.roomTitle}>{room.name}</Text>
            <View style={styles.roomCard}>
              {room.devices.map((device) => (
                <DeviceItem key={device.id} device={device} onPress={goToDevice} />
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.tipsCard} onPress={() => setShowTips(!showTips)} activeOpacity={0.8}>
          <View style={styles.tipsCardHeader}>
            <View style={styles.tipsIconWrap}>
              <Ionicons name="leaf-outline" size={18} color={colors.accent} />
            </View>
            <Text style={styles.tipsCardTitle}>Energiespartipps</Text>
            <Ionicons name={showTips ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
          </View>
          {showTips ? energyTips.map(tip => (
            <View key={tip.id} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <View style={styles.tipContent}>
                <Text style={styles.tipDevice}>{tip.device}</Text>
                <Text style={styles.tipText}>{tip.tip}</Text>
                <Text style={styles.tipSaving}>~{tip.saving_kwh_month} kWh/Mo · {tip.saving_eur_month.toFixed(2)} € Ersparnis</Text>
              </View>
            </View>
          )) : null}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, marginTop: spacing.sm, marginBottom: spacing.md },
  welcomeText: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  settingsBtn: { padding: 4 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.base, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.fontSizes.md },
  roomFilterScroll: { marginBottom: spacing.base },
  roomFilterContent: { paddingHorizontal: spacing.base, gap: 8 },
  roomChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  roomChipActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  roomChipText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  roomChipTextActive: { color: colors.accent, fontWeight: '600' },
  costCard: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  costLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
  costValue: { fontSize: typography.fontSizes.xxxl, fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  goalCard: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.base, borderWidth: 1, borderColor: colors.border },
  goalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  goalLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: typography.fontWeights.medium },
  progressBar: { height: 6, backgroundColor: colors.bgCardLight, borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: '100%', borderRadius: radius.full },
  goalSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, lineHeight: 18 },
  roomSection: { marginBottom: spacing.base },
  roomTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  roomCard: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  billCard: { backgroundColor: colors.bgCard, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  billHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  billTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  scanFrame: { backgroundColor: colors.bgCardLight, borderRadius: radius.lg, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.base, borderWidth: 2, borderColor: colors.accent, borderStyle: 'dashed' },
  scanText: { color: colors.textSecondary, fontSize: typography.fontSizes.sm, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  billResult: { backgroundColor: colors.bgCardLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.base },
  billResultTitle: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginBottom: 2 },
  billResultSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  billValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, fontWeight: '500' },
  billBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  billBtnText: { color: colors.bg, fontWeight: typography.fontWeights.bold, fontSize: typography.fontSizes.md },

  tipsCard: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  tipsCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tipsIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentGlow, justifyContent: 'center', alignItems: 'center' },
  tipsCardTitle: { flex: 1, fontSize: typography.fontSizes.base, fontWeight: '600', color: colors.textPrimary },
  tipRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 5 },
  tipContent: { flex: 1 },
  tipDevice: { fontSize: typography.fontSizes.sm, fontWeight: '600', color: colors.accent, marginBottom: 2 },
  tipText: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, lineHeight: 18 },
  tipSaving: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 4 },
  goalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  goalSheet: { backgroundColor: colors.bgCard, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  goalSheetHandle: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.base },
  goalSheetTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginBottom: 4 },
  goalSheetSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.base },
  goalPresetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  goalPresetBtn: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCardLight },
  goalPresetBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  goalPresetText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: '500' },
  goalPresetTextActive: { color: colors.accent, fontWeight: '700' },
});
