import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../data/theme';
import { user } from '../data/dummyData';
import AppHeader from '../components/AppHeader';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [peakAlert, setPeakAlert] = useState(false);
  const [goalKwh, setGoalKwh] = useState(user.monthlyGoalKwh);

  const goals = [100, 120, 150, 180, 200, 250];

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader showBack onBackPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ENERGIEZIEL</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monatliches Ziel</Text>
            <Text style={styles.cardSub}>Aktuell: {goalKwh} kWh ({(goalKwh * user.strompreis).toFixed(2)} €/Monat)</Text>
            <View style={styles.goalGrid}>
              {goals.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalBtn, goalKwh === g ? styles.goalBtnActive : null]}
                  onPress={() => setGoalKwh(g)}
                >
                  <Text style={[styles.goalBtnText, goalKwh === g ? styles.goalBtnTextActive : null]}>
                    {g} kWh
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BENACHRICHTIGUNGEN</Text>
          <View style={styles.card}>
            {[
              { label: 'Push-Benachrichtigungen', sub: 'Allgemeine App-Meldungen', value: notifications, setter: setNotifications },
              { label: 'Wochenbericht', sub: 'Jeden Montag dein Verbrauch der Vorwoche', value: weeklyReport, setter: setWeeklyReport },
              { label: 'Verbrauchswarnung', sub: 'Wenn du 80% deines Ziels erreichst', value: peakAlert, setter: setPeakAlert },
            ].map(item => (
              <View key={item.label} style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.setter}
                  trackColor={{ false: colors.bgCardLight, true: colors.accentGlow }}
                  thumbColor={item.value ? colors.accent : colors.textMuted}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TARIF</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stromanbieter</Text>
              <Text style={styles.infoValue}>Wien Energie</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Arbeitspreis</Text>
              <Text style={styles.infoValue}>{user.strompreis.toFixed(2)} €/kWh</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Smart Meter</Text>
              <Text style={[styles.infoValue, { color: colors.accent }]}>Verbunden ✓</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert('Tarif', 'Tarif-Änderungen werden direkt mit Wiener Netze synchronisiert.')}>
              <Text style={styles.editBtnText}>Tarif bearbeiten</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APP</Text>
          <View style={styles.card}>
            {[
              { icon: 'shield-checkmark-outline', label: 'Datenschutz & DSGVO' },
              { icon: 'document-text-outline',    label: 'Nutzungsbedingungen' },
              { icon: 'help-circle-outline',       label: 'Hilfe & Support' },
              { icon: 'information-circle-outline',label: 'Über saveSome v1.0.0' },
            ].map(item => (
              <TouchableOpacity key={item.label} style={styles.linkRow}
                onPress={() => Alert.alert(item.label)}
              >
                <Ionicons name={item.icon} size={18} color={colors.accent} />
                <Text style={styles.linkLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [{ text: 'Abbrechen' }, { text: 'Abmelden', style: 'destructive' }])}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Abmelden</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  section: { marginBottom: spacing.base },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, letterSpacing: 1, paddingHorizontal: spacing.base, marginBottom: spacing.sm, marginTop: spacing.base },
  card: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: typography.fontSizes.base, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.base },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCardLight },
  goalBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  goalBtnText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  goalBtnTextActive: { color: colors.accent, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: typography.fontSizes.md, color: colors.textPrimary, fontWeight: '500' },
  toggleSub: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, fontWeight: '500' },
  editBtn: { marginTop: spacing.md, backgroundColor: colors.accentGlow, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.accent },
  editBtnText: { color: colors.accent, fontWeight: '600', fontSize: typography.fontSizes.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  linkLabel: { flex: 1, fontSize: typography.fontSizes.md, color: colors.textPrimary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginHorizontal: spacing.base, backgroundColor: colors.bgCard, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.danger + '44' },
  logoutText: { color: colors.danger, fontWeight: '600', fontSize: typography.fontSizes.md },
});
