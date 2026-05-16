import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../data/theme';
import { rooms } from '../data/dummyData';
import { updateDevice, deleteDevice } from '../data/database';
import AppHeader from '../components/AppHeader';

const ENERGY_CLASSES = ['A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C'];

export default function DeviceDetailScreen({ route, navigation }) {
  const { device } = route.params;
  const [deviceData, setDeviceData] = useState(device);
  const [selectedRoom, setSelectedRoom] = useState(device.room_id);
  const [editVisible, setEditVisible] = useState(false);
  const [editForm, setEditForm] = useState({});

  const openEdit = () => {
    setEditForm({
      name:        deviceData.name,
      watt:        String(deviceData.watt),
      energyClass: deviceData.energyClass,
      status:      deviceData.status,
      start_time:  deviceData.start_time,
      end_time:    deviceData.end_time,
    });
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Fehler', 'Name darf nicht leer sein.');
      return;
    }
    const wattNum = parseInt(editForm.watt, 10);
    if (isNaN(wattNum) || wattNum <= 0) {
      Alert.alert('Fehler', 'Bitte gültige Wattzahl eingeben.');
      return;
    }
    const updated = {
      ...deviceData,
      name:        editForm.name.trim(),
      watt:        wattNum,
      energyClass: editForm.energyClass,
      status:      editForm.status,
      start_time:  editForm.start_time,
      end_time:    editForm.end_time,
    };
    setDeviceData(updated);
    setEditVisible(false);
    await updateDevice(updated);
  };

  const changeRoom = async (roomId) => {
    setSelectedRoom(roomId);
    await updateDevice({ ...deviceData, room_id: roomId });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        showBack
        onBackPress={() => navigation.goBack()}
        extraMenuItems={[
          { icon: 'create-outline', label: 'Gerät bearbeiten', onPress: openEdit },
          { icon: 'trash-outline',  label: 'Gerät entfernen',  danger: true,
            onPress: () => Alert.alert('Gerät entfernen', `${deviceData.name} aus der Liste entfernen?`, [
              { text: 'Abbrechen' },
              { text: 'Entfernen', style: 'destructive', onPress: async () => { await deleteDevice(deviceData.id); navigation.goBack(); } },
            ]),
          },
        ]}
      />

      {/* ── Bearbeiten-Modal ─────────────────────────────────────────────── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.editOverlay}>
          <SafeAreaView style={styles.editSheet}>
            <View style={styles.editHeader}>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.editHeaderBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.editTitle}>Gerät bearbeiten</Text>
              <TouchableOpacity onPress={saveEdit} style={styles.editHeaderBtn}>
                <Text style={styles.saveLabel}>Speichern</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editScroll}>

              <Text style={styles.fieldLabel}>GERÄTENAME</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.name}
                onChangeText={v => setEditForm(f => ({ ...f, name: v }))}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>LEISTUNG (WATT)</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.watt}
                onChangeText={v => setEditForm(f => ({ ...f, watt: v }))}
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>STATUS</Text>
              <View style={styles.segmentRow}>
                {[
                  { value: 'active', label: 'Aktiv',   icon: 'flash',        color: colors.accent },
                  { value: 'idle',   label: 'Standby', icon: 'moon-outline', color: colors.textMuted },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segmentBtn, editForm.status === opt.value && styles.segmentBtnActive]}
                    onPress={() => setEditForm(f => ({ ...f, status: opt.value }))}
                  >
                    <Ionicons name={opt.icon} size={15} color={editForm.status === opt.value ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.segmentBtnText, editForm.status === opt.value && styles.segmentBtnTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>NUTZUNGSZEIT</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeWrap}>
                  <Text style={styles.timeSub}>Von</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={editForm.start_time}
                    onChangeText={v => setEditForm(f => ({ ...f, start_time: v }))}
                    placeholder="07:00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.textMuted} style={styles.timeArrow} />
                <View style={styles.timeWrap}>
                  <Text style={styles.timeSub}>Bis</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={editForm.end_time}
                    onChangeText={v => setEditForm(f => ({ ...f, end_time: v }))}
                    placeholder="22:00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>ENERGIEKLASSE</Text>
              <View style={styles.classGrid}>
                {ENERGY_CLASSES.map(ec => (
                  <TouchableOpacity
                    key={ec}
                    style={[styles.classBtn, editForm.energyClass === ec && styles.classBtnActive]}
                    onPress={() => setEditForm(f => ({ ...f, energyClass: ec }))}
                  >
                    <Text style={[styles.classBtnText, editForm.energyClass === ec && styles.classBtnTextActive]}>
                      {ec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── Hauptinhalt ──────────────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name={deviceData.icon} size={36} color={colors.accent} />
          </View>
          <Text style={styles.brand}>{deviceData.model.split(' ')[0]}</Text>
          <Text style={styles.deviceName}>{deviceData.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{deviceData.energyClass}</Text>
            </View>
            <Text style={styles.wattText}>· Aktueller Verbrauch: {deviceData.watt}W</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{deviceData.kwh_per_day.toFixed(2)}</Text>
            <Text style={styles.statLabel}>kWh/Tag</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(deviceData.kwh_per_day * 30).toFixed(1)}</Text>
            <Text style={styles.statLabel}>kWh/Monat</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(deviceData.kwh_per_day * 30 * 0.30).toFixed(2)} €</Text>
            <Text style={styles.statLabel}>Kosten/Mo</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: deviceData.status === 'active' ? colors.accent : colors.textMuted }]} />
            <Text style={styles.statusText}>
              {deviceData.status === 'active' ? 'Aktiv' : 'Standby'} · {deviceData.start_time} – {deviceData.end_time}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nutzungsart</Text>
            <Text style={styles.infoValue}>{deviceData.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Seriennummer</Text>
            <Text style={styles.infoValue}>PNC: {deviceData.pnc}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Standort</Text>
          <Text style={styles.sectionSub}>Weisen Sie diesem Gerät einen Raum zu, um die Analyse zu verbessern.</Text>
          <View style={styles.roomGrid}>
            {rooms.map(room => (
              <TouchableOpacity
                key={room.id}
                style={[styles.roomBtn, selectedRoom === room.id ? styles.roomBtnActive : null]}
                onPress={() => changeRoom(room.id)}
              >
                <Ionicons
                  name={room.icon}
                  size={22}
                  color={selectedRoom === room.id ? colors.accent : colors.textSecondary}
                />
                <Text style={[styles.roomBtnLabel, selectedRoom === room.id ? styles.roomBtnLabelActive : null]}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },


  // Edit-Modal
  editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  editSheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '90%', borderWidth: 1, borderColor: colors.border },
  editHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  editHeaderBtn: { width: 72, alignItems: 'center' },
  editTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  saveLabel: { fontSize: typography.fontSizes.md, color: colors.accent, fontWeight: typography.fontWeights.bold },
  editScroll: { padding: spacing.base },

  fieldLabel: { fontSize: typography.fontSizes.xs, fontWeight: '600', color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.base },
  fieldInput: { backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.textPrimary, fontSize: typography.fontSizes.md },

  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  segmentBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  segmentBtnText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: '500' },
  segmentBtnTextActive: { color: colors.accent },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeWrap: { flex: 1 },
  timeSub: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginBottom: 4 },
  timeInput: { backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.textPrimary, fontSize: typography.fontSizes.md, textAlign: 'center' },
  timeArrow: { marginTop: spacing.lg },

  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  classBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  classBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  classBtnText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: '500' },
  classBtnTextActive: { color: colors.accent, fontWeight: '700' },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.base },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentGlow, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.base, borderWidth: 1, borderColor: colors.accent },
  brand: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
  deviceName: { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  badge: { backgroundColor: colors.accentGlow, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.accent },
  badgeText: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold, color: colors.accent },
  wattText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },

  // Stats
  statsRow: { flexDirection: 'row', backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.base, borderWidth: 1, borderColor: colors.border },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.accent },
  statLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },

  // Status & Info
  sectionCard: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.base, borderWidth: 1, borderColor: colors.border },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  infoLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, fontWeight: '500' },

  // Raum
  sectionTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.base, lineHeight: 18 },
  roomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  roomBtn: { width: '30%', alignItems: 'center', paddingVertical: spacing.md, backgroundColor: colors.bgCardLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  roomBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  roomBtnLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  roomBtnLabelActive: { color: colors.accent },
});
