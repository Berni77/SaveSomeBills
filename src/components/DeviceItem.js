import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../data/theme';

export default function DeviceItem({ device, onPress }) {
  const isActive = device.status === 'active';
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(device)} activeOpacity={0.7}>
      <View style={[styles.iconWrap, isActive ? styles.iconWrapActive : null]}>
        <Ionicons name={device.icon} size={18} color={isActive ? colors.accent : colors.textSecondary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{device.name}</Text>
        {isActive ? <Text style={styles.watt}>{device.watt}W · aktiv</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconWrap: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.bgCardLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  iconWrapActive: { backgroundColor: colors.accentGlow },
  info: { flex: 1 },
  name: { fontSize: typography.fontSizes.md, color: colors.textPrimary, fontWeight: typography.fontWeights.medium },
  watt: { fontSize: typography.fontSizes.sm, color: colors.accent, marginTop: 2 },
});
