import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../data/theme';
import { user, friendsComparison, currentMonth } from '../data/dummyData';
import { getSettings, saveSetting } from '../data/database';
import AppHeader from '../components/AppHeader';

const friends = [
  { id: 'f1', name: 'Maria S.',   kwh: 158, avatar: 'MS' },
  { id: 'f2', name: 'Thomas K.',  kwh: 172, avatar: 'TK' },
  { id: 'f3', name: 'Julia W.',   kwh: 149, avatar: 'JW' },
  { id: 'f4', name: 'Ben N.',     kwh: 195, avatar: 'BN' },
];

const GOAL_PRESETS = [100, 120, 150, 180, 200, 250];

export default function ProfileScreen() {
  const [inviteSent, setInviteSent] = useState(false);
  const [settings, setSettings]     = useState({ monthlyGoalKwh: 180, strompreis: 0.30, notifications: true });
  const [editSetting, setEditSetting] = useState(null); // 'goal' | 'price' | null
  const [tempValue, setTempValue]   = useState('');

  const maxKwh = Math.max(friendsComparison.userKwh, friendsComparison.friendsAvgKwh, 200);

  useFocusEffect(useCallback(() => {
    getSettings().then(setSettings);
  }, []));

  const openGoal  = () => setEditSetting('goal');
  const openPrice = () => { setTempValue(String(settings.strompreis)); setEditSetting('price'); };

  const saveGoal = async (kwh) => {
    const next = { ...settings, monthlyGoalKwh: kwh };
    setSettings(next);
    setEditSetting(null);
    await saveSetting('monthlyGoalKwh', kwh);
  };

  const savePrice = async () => {
    const price = parseFloat(tempValue.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Ungültiger Wert', 'Bitte einen gültigen Preis eingeben.');
      return;
    }
    const next = { ...settings, strompreis: price };
    setSettings(next);
    setEditSetting(null);
    await saveSetting('strompreis', price);
  };

  const toggleNotifications = async () => {
    const next = { ...settings, notifications: !settings.notifications };
    setSettings(next);
    await saveSetting('notifications', next.notifications);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      {/* ── Einstellungen bearbeiten ────────────────────────────────────── */}
      <Modal visible={editSetting !== null} transparent animationType="slide" onRequestClose={() => setEditSetting(null)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.editOverlay} activeOpacity={1} onPress={() => setEditSetting(null)}>
            <View style={styles.editSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            {editSetting === 'goal' && (
              <>
                <Text style={styles.sheetTitle}>Monatliches Energieziel</Text>
                <Text style={styles.sheetSub}>Aktuell: {settings.monthlyGoalKwh} kWh</Text>
                <View style={styles.goalGrid}>
                  {GOAL_PRESETS.map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.goalBtn, settings.monthlyGoalKwh === g && styles.goalBtnActive]}
                      onPress={() => saveGoal(g)}
                    >
                      <Text style={[styles.goalBtnText, settings.monthlyGoalKwh === g && styles.goalBtnTextActive]}>
                        {g} kWh
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {editSetting === 'price' && (
              <>
                <Text style={styles.sheetTitle}>Strompreis</Text>
                <Text style={styles.sheetSub}>Aktuell gespeichert: {settings.strompreis.toFixed(2)} €/kWh</Text>

                {/* Große Live-Anzeige des eingetippten Werts */}
                <View style={styles.priceDisplay}>
                  <Text style={styles.priceDisplayVal}>
                    {tempValue || '0'}
                  </Text>
                  <Text style={styles.priceDisplayUnit}>€/kWh</Text>
                </View>

                {/* Live-Vorschau Monatskosten */}
                <Text style={styles.pricePreview}>
                  ≈ {((parseFloat(tempValue.replace(',', '.')) || 0) * 120).toFixed(2)} € / Monat bei 120 kWh
                </Text>

                <TextInput
                  style={styles.priceInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="decimal-pad"
                  placeholder="0.30"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                />
                <TouchableOpacity style={styles.saveBtn} onPress={savePrice}>
                  <Text style={styles.saveBtnText}>Speichern</Text>
                </TouchableOpacity>
              </>
            )}

              <View style={{ height: 32 }} />
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.profileHero}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AM</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userSub}>{user.friends} Freunde</Text>
        </View>

        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => { setInviteSent(true); Alert.alert('Einladung gesendet!', 'Deine Freunde wurden eingeladen.'); }}
        >
          <Ionicons name="person-add-outline" size={18} color={inviteSent ? colors.success : colors.textPrimary} />
          <Text style={[styles.inviteBtnText, inviteSent ? { color: colors.success } : null]}>
            {inviteSent ? 'Einladung gesendet ✓' : 'Freunde & Familie einladen'}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>MEIN VERBRAUCH</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{friendsComparison.userKwh}</Text>
              <Text style={styles.statUnit}>kWh</Text>
              <Text style={styles.statLabel}>dieser Monat</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.success }]}>{currentMonth.vsLastMonth}%</Text>
              <Text style={styles.statUnit}>Vormonat</Text>
              <Text style={styles.statLabel}>Verbesserung</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.success }]}>{currentMonth.vsVorjahr}%</Text>
              <Text style={styles.statUnit}>Vorjahr</Text>
              <Text style={styles.statLabel}>langfristig</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.sectionLabel}>VERGLEICH MIT FREUNDEN</Text>
          </View>
          <Text style={styles.comparisonHeadline}>
            Du verbrauchst {friendsComparison.percentBetter}% weniger
          </Text>
          <View style={styles.compRow}>
            <Text style={styles.compName}>Du</Text>
            <View style={styles.compBarWrap}>
              <View style={[styles.compBar, { width: `${(friendsComparison.userKwh / maxKwh) * 100}%`, backgroundColor: colors.accent }]} />
            </View>
            <Text style={styles.compValue}>{friendsComparison.userKwh} kWh</Text>
          </View>
          <View style={styles.compRow}>
            <Text style={styles.compName}>Freunde (Ø)</Text>
            <View style={styles.compBarWrap}>
              <View style={[styles.compBar, { width: `${(friendsComparison.friendsAvgKwh / maxKwh) * 100}%`, backgroundColor: colors.textMuted }]} />
            </View>
            <Text style={styles.compValue}>{friendsComparison.friendsAvgKwh} kWh</Text>
          </View>
          <View style={styles.friendList}>
            {friends.map(f => (
              <View key={f.id} style={styles.friendRow}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>{f.avatar}</Text>
                </View>
                <Text style={styles.friendName}>{f.name}</Text>
                <View style={styles.friendBarWrap}>
                  <View style={[styles.friendBar, {
                    width: `${(f.kwh / maxKwh) * 100}%`,
                    backgroundColor: f.kwh < friendsComparison.userKwh ? colors.success : colors.textMuted,
                  }]} />
                </View>
                <Text style={styles.friendKwh}>{f.kwh} kWh</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.sectionLabel}>GLOBALER DURCHSCHNITT</Text>
          </View>
          <Text style={styles.comparisonHeadline}>Du liegst im grünen Bereich</Text>
          <View style={styles.circleWrap}>
            <View style={styles.rankCircle}>
              <Ionicons name="leaf-outline" size={28} color={colors.accent} />
              <Text style={styles.rankText}>Top 20%</Text>
            </View>
          </View>
          <Text style={styles.globalSub}>Ähnliche Haushalte: ~{friendsComparison.globalAvgKwh} kWh</Text>
          <Text style={styles.globalSub2}>Du bist sparsamer als {100 - friendsComparison.globalPercentile}% aller Haushalte</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>EINSTELLUNGEN</Text>
          {[
            { icon: 'flag-outline',             label: 'Monatliches Energieziel', value: `${settings.monthlyGoalKwh} kWh`,              onPress: openGoal },
            { icon: 'flash-outline',            label: 'Strompreis',              value: `${settings.strompreis.toFixed(2)} €/kWh`,     onPress: openPrice },
            { icon: 'notifications-outline',    label: 'Benachrichtigungen',      value: settings.notifications ? 'An' : 'Aus',         onPress: toggleNotifications },
            { icon: 'shield-checkmark-outline', label: 'Datenschutz',             value: '',                                            onPress: () => Alert.alert('Datenschutz', 'Alle Daten werden ausschließlich lokal auf diesem Gerät gespeichert.') },
          ].map(item => (
            <TouchableOpacity key={item.label} style={styles.settingRow} onPress={item.onPress}>
              <Ionicons name={item.icon} size={18} color={colors.accent} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingValue}>{item.value}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  profileHero: { alignItems: 'center', paddingVertical: spacing.xl },
  avatarWrap: { position: 'relative', marginBottom: spacing.md },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.accentGlow, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.accent },
  avatarText: { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.bold, color: colors.accent },
  onlineDot: { position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.success, borderWidth: 2, borderColor: colors.bg },
  userName: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  userSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.base },
  inviteBtnText: { fontSize: typography.fontSizes.md, color: colors.textPrimary, fontWeight: '500' },
  card: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  statsGrid: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: typography.fontSizes.xl, fontWeight: '700', color: colors.textPrimary },
  statUnit: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  statLabel: { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  comparisonHeadline: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginBottom: spacing.base },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  compName: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, width: 80 },
  compBarWrap: { flex: 1, height: 8, backgroundColor: colors.bgCardLight, borderRadius: radius.full, overflow: 'hidden' },
  compBar: { height: '100%', borderRadius: radius.full },
  compValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, width: 56, textAlign: 'right' },
  friendList: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  friendAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgCardLight, justifyContent: 'center', alignItems: 'center' },
  friendAvatarText: { fontSize: 9, fontWeight: '600', color: colors.textSecondary },
  friendName: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, width: 64 },
  friendBarWrap: { flex: 1, height: 6, backgroundColor: colors.bgCardLight, borderRadius: radius.full, overflow: 'hidden' },
  friendBar: { height: '100%', borderRadius: radius.full },
  friendKwh: { fontSize: typography.fontSizes.xs, color: colors.textMuted, width: 48, textAlign: 'right' },
  circleWrap: { alignItems: 'center', paddingVertical: spacing.base },
  rankCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 10, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgCard },
  rankText: { fontSize: typography.fontSizes.lg, fontWeight: '700', color: colors.accent, marginTop: 4 },
  globalSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  globalSub2: { fontSize: typography.fontSizes.xs, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  settingLabel: { flex: 1, fontSize: typography.fontSizes.md, color: colors.textPrimary },
  settingValue: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginRight: 4 },

  // Edit-Modal
  editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  editSheet: { backgroundColor: colors.bgCard, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  sheetHandle: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.base },
  sheetTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginBottom: 4 },
  sheetSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.base },

  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  goalBtn: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCardLight },
  goalBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  goalBtnText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: '500' },
  goalBtnTextActive: { color: colors.accent, fontWeight: '700' },

  priceDisplay: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  priceDisplayVal: { fontSize: 48, fontWeight: '700', color: colors.accent, letterSpacing: 1 },
  priceDisplayUnit: { fontSize: typography.fontSizes.lg, color: colors.textSecondary, marginBottom: 8 },
  pricePreview: { textAlign: 'center', fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.base },
  priceInput: { backgroundColor: colors.bgCardLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.textPrimary, fontSize: typography.fontSizes.md, textAlign: 'center', marginBottom: spacing.base },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  saveBtnText: { color: colors.bg, fontWeight: typography.fontWeights.bold, fontSize: typography.fontSizes.md },
});
