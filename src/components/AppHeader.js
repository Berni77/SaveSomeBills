import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../data/theme';

// Einheitlicher App-Header mit internem Menü-Modal.
// extraMenuItems: screen-spezifische Menüpunkte (z.B. Bearbeiten/Löschen in DeviceDetail)
// onScanPress: zeigt "Stromrechnung scannen" als ersten Menüpunkt (nur HomeScreen)
// showBack: ersetzt das Flash-Icon durch einen Zurück-Button
export default function AppHeader({ title = 'saveSomeBills', onBackPress, showBack = false, onScanPress, extraMenuItems = [] }) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn}>
            <Ionicons name="flash" size={20} color={colors.accent} />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            {extraMenuItems.map((item, i) => (
              <React.Fragment key={i}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); item.onPress(); }}>
                  <Ionicons name={item.icon} size={18} color={item.danger ? colors.danger : colors.accent} />
                  <Text style={[styles.menuText, item.danger ? { color: colors.danger } : null]}>{item.label}</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
              </React.Fragment>
            ))}
            {onScanPress ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); onScanPress(); }}>
                  <Ionicons name="scan-outline" size={18} color={colors.accent} />
                  <Text style={styles.menuText}>Stromrechnung scannen</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
              </>
            ) : null}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); Alert.alert('Räume', 'Räume können manuell hinzugefügt oder per API verbunden werden.'); }}>
              <Ionicons name="home-outline" size={18} color={colors.accent} />
              <Text style={styles.menuText}>Räume verwalten</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); Alert.alert('Ziele', 'Energiesparziele können in den Einstellungen angepasst werden.'); }}>
              <Ionicons name="flag-outline" size={18} color={colors.accent} />
              <Text style={styles.menuText}>Energiesparziele anpassen</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  menuCard: { backgroundColor: colors.bgCard, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.base, gap: spacing.md },
  menuText: { fontSize: typography.fontSizes.md, color: colors.textPrimary, fontWeight: typography.fontWeights.medium },
  menuDivider: { height: 1, backgroundColor: colors.border },
});
