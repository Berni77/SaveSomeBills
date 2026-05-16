import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../data/theme';
import { rooms, user, currentMonth, billScanResult } from '../data/dummyData';
import { getAllDevices, getSettings } from '../data/database';
import AppHeader from '../components/AppHeader';
import DeviceItem from '../components/DeviceItem';

export default function HomeScreen({ navigation }) {
  const [devices, setDevices]   = useState([]);
  const [settings, setSettings] = useState({ monthlyGoalKwh: 180, strompreis: 0.30 });
  const [search, setSearch]     = useState('');
  const [billVisible, setBillVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    getAllDevices().then(setDevices);
    getSettings().then(setSettings);
  }, []));

  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const devicesByRoom = rooms.map(room => ({
    ...room,
    devices: filtered.filter(d => d.room_id === room.id),
  })).filter(r => r.devices.length > 0);

  const goToDevice = (device) => {
    navigation.navigate('DeviceDetail', { device });
  };

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

        <View style={styles.costCard}>
          <Text style={styles.costLabel}>Geschätzte monatliche Kosten</Text>
          <Text style={styles.costValue}>{currentMonth.eur.toFixed(2)} €</Text>
        </View>

        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>Monatliches Ziel</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: progressColor }]} />
          </View>
          <Text style={styles.goalSub}>
            {currentMonth.kwh} kWh ({currentMonth.eur.toFixed(2)} €){'\n'}
            von {settings.monthlyGoalKwh} kWh ({goalEur} €)
          </Text>
        </View>

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
  costCard: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  costLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
  costValue: { fontSize: typography.fontSizes.xxxl, fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  goalCard: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.base, borderWidth: 1, borderColor: colors.border },
  goalLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: typography.fontWeights.medium },
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
});
