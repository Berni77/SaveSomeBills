import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../data/theme';
import { weeklyData, monthlyData, yearlyData, energyTips } from '../data/dummyData';
import { getAllDevices, getSettings } from '../data/database';
import AppHeader from '../components/AppHeader';

// ─── Bar Chart ───────────────────────────────────────────────────────────────
// Zeichnet ein einfaches Balkendiagramm; der Balken am accentIndex wird farblich hervorgehoben
function BarChart({ data, valueKey, labelKey, accentIndex }) {
  const maxVal = Math.max(...data.map(d => d[valueKey]));
  return (
    <View style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 }}>
        {data.map((item, i) => {
          const h = Math.max(4, (item[valueKey] / maxVal) * 90);
          const isAccent = i === accentIndex;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={styles.barTopLabel}>{item[valueKey]}</Text>
              <View style={[styles.bar, { height: h, backgroundColor: isAccent ? colors.accent : colors.bgCardLight }]} />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6, gap: 4 }}>
        {data.map((item, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.barLabel}>{item[labelKey]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Zeichnet ein Liniendiagramm mit Punkten und verbindenden Linien (pure RN, kein SVG)
function LineChart({ data, valueKey, labelKey, accentIndex }) {
  const [chartWidth, setChartWidth] = useState(0);
  const maxVal = Math.max(...data.map(d => d[valueKey]));
  const HEIGHT = 100;
  const PAD = 10;

  const points = chartWidth > 0 ? data.map((item, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * (chartWidth - PAD * 2) + PAD : chartWidth / 2,
    y: HEIGHT - PAD - ((item[valueKey] / maxVal) * (HEIGHT - PAD * 2)),
    value: item[valueKey],
  })) : [];

  return (
    <View style={{ marginTop: spacing.md }} onLayout={e => setChartWidth(e.nativeEvent.layout.width)}>
      <View style={{ height: HEIGHT, position: 'relative' }}>
        {points.slice(0, -1).map((p, i) => {
          const next = points[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const cx = (p.x + next.x) / 2;
          const cy = (p.y + next.y) / 2;
          return (
            <View key={i} style={{
              position: 'absolute',
              left: cx - length / 2,
              top: cy - 1,
              width: length,
              height: 2,
              backgroundColor: colors.accent,
              opacity: 0.6,
              transform: [{ rotate: `${angle}deg` }],
            }} />
          );
        })}
        {points.map((p, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: p.x - 5,
            top: p.y - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: i === accentIndex ? colors.accent : colors.bgCard,
            borderWidth: 2,
            borderColor: colors.accent,
          }}>
            {i === accentIndex ? (
              <Text style={{ position: 'absolute', top: -16, left: -8, fontSize: 9, color: colors.accent, fontWeight: '700', width: 26, textAlign: 'center' }}>{p.value}</Text>
            ) : null}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6, gap: 4 }}>
        {data.map((item, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.barLabel}>{item[labelKey]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Gibt eine Ampelfarbe zurück: der größte Verbraucher (Index 0) ist rot, der kleinste grün
function ampelColor(index, total) {
  const t = index / Math.max(total - 1, 1); // 0.0 (red) → 1.0 (green)
  if (t < 0.33) return '#e74c3c';
  if (t < 0.66) return '#f39c12';
  return '#2ecc71';
}

const PERIODS = ['Woche', 'Monat', 'Jahr'];

export default function AnalyseScreen() {
  const [period, setPeriod]         = useState('Woche');
  const [chartType, setChartType]   = useState('bar');
  const [dbDevices, setDbDevices]   = useState([]);
  const [settings, setSettings]     = useState({ strompreis: 0.30 });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showTips, setShowTips]     = useState(false);
  const [infoDevice, setInfoDevice] = useState(null);
  const [calcResult, setCalcResult] = useState(null);

  // Lädt Geräte und Einstellungen neu wenn der Tab fokussiert wird
  useFocusEffect(useCallback(() => {
    getAllDevices().then(setDbDevices);
    getSettings().then(setSettings);
  }, []));

  // ── Top Verbraucher aus DB ────────────────────────────────────────────────
  // Berechnet monatlichen Gesamtverbrauch und sortiert Geräte nach Verbrauch absteigend
  const totalKwhMonth = dbDevices.reduce((sum, d) => sum + d.kwh_per_day * 30, 0);
  const sortedByKwh   = [...dbDevices].sort((a, b) => (b.kwh_per_day * 30) - (a.kwh_per_day * 30));
  const top5          = sortedByKwh.slice(0, 5);
  const rest          = sortedByKwh.slice(5);
  const restKwh       = rest.reduce((sum, d) => sum + d.kwh_per_day * 30, 0);

  const computedTopConsumers = [
    ...top5.map(d => ({
      device_id: d.id,
      name:      d.name,
      kwh_month: d.kwh_per_day * 30,
      percent:   totalKwhMonth > 0 ? Math.round((d.kwh_per_day * 30 / totalKwhMonth) * 100) : 0,
    })),
    ...(rest.length > 0 ? [{
      device_id: 'other',
      name:      'Sonstige',
      kwh_month: restKwh,
      percent:   totalKwhMonth > 0 ? Math.round((restKwh / totalKwhMonth) * 100) : 0,
    }] : []),
  ];

  const sortedConsumers = computedTopConsumers.sort((a, b) => b.kwh_month - a.kwh_month);

  // ── Amortisationsrechner aus DB ───────────────────────────────────────────
  // Erstellt Vergleichsdaten: Neugerät hat pauschal 25% weniger Verbrauch als aktuelles Gerät
  const computedAmortizationDevices = dbDevices.map(d => ({
    id:         d.id,
    name:       d.name,
    currentKwh: d.watt,
    newKwh:     Math.round(d.watt * 0.75),
    newPrice:   699,
  }));

  const effectiveDevice = selectedDevice
    ? (computedAmortizationDevices.find(d => d.id === selectedDevice.id) ?? computedAmortizationDevices[0])
    : computedAmortizationDevices[0];

  // Berechnet jährliche Einsparung und Amortisationszeit für das gewählte Gerät
  const runCalculation = () => {
    const dev = effectiveDevice;
    if (!dev) return;
    const savingWatt = dev.currentKwh - dev.newKwh;
    const savingKwh  = (savingWatt / 1000) * 24 * 365;
    const savingEur  = savingKwh * settings.strompreis;
    const years      = savingEur > 0 ? (dev.newPrice / savingEur).toFixed(1) : '∞';
    setCalcResult({ savingKwh: savingKwh.toFixed(0), savingEur: savingEur.toFixed(0), newPrice: dev.newPrice, years });
  };

  // Wählt die passenden Diagrammdaten je nach gewähltem Zeitraum
  const chartData = period === 'Woche'
    ? weeklyData.map(d => ({ label: d.day,   value: d.kwh }))
    : period === 'Monat'
    ? monthlyData.map(d => ({ label: d.label, value: d.kwh }))
    : yearlyData.map(d => ({ label: d.label,  value: d.kwh }));

  // Ermittelt den Index des höchsten Balkens für die Akzentfarbe im Diagramm
  const maxIdx = chartData.reduce((mi, d, i, arr) => d.value > arr[mi].value ? i : mi, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      {/* ── Info Modal ─────────────────────────────────────────────────────── */}
      <Modal
        visible={infoDevice !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoDevice(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setInfoDevice(null)}>
          <View style={styles.infoCard}>
            {infoDevice && (
              <>
                <View style={styles.infoHeader}>
                  <View style={[styles.infoDot, { backgroundColor: infoDevice.color }]} />
                  <Text style={styles.infoTitle}>{infoDevice.name}</Text>
                  <TouchableOpacity onPress={() => setInfoDevice(null)}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Monatsverbrauch</Text>
                  <Text style={styles.infoValue}>{infoDevice.kwh_month.toFixed(1)} kWh</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Anteil am Haushalt</Text>
                  <Text style={styles.infoValue}>{infoDevice.percent}%</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kosten/Monat</Text>
                  <Text style={styles.infoValue}>{(infoDevice.kwh_month * 0.30).toFixed(2)} €</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kosten/Jahr</Text>
                  <Text style={styles.infoValue}>{(infoDevice.kwh_month * 0.30 * 12).toFixed(2)} €</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Bewertung</Text>
                  <Text style={[styles.infoValue, { color: infoDevice.color }]}>
                    {infoDevice.percent > 20 ? '⚠ Hoch' : infoDevice.percent > 8 ? '~ Mittel' : '✓ Niedrig'}
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Period Selector ─────────────────────────────────────────────── */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p ? styles.periodBtnActive : null]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p ? styles.periodTextActive : null]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Chart ───────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.cardTitle}>
                {period === 'Woche' ? 'Wochenverbrauch' : period === 'Monat' ? 'Monatsverbrauch' : 'Jahresverbrauch'}
              </Text>
              <Text style={styles.cardSub}>
                {period === 'Woche' ? 'Letzte 7 Tage in kWh' : period === 'Monat' ? '2025 in kWh' : 'Vergleich in kWh'}
              </Text>
            </View>
            <View style={styles.chartToggle}>
              <TouchableOpacity
                style={[styles.chartToggleBtn, chartType === 'bar' && styles.chartToggleBtnActive]}
                onPress={() => setChartType('bar')}
              >
                <Ionicons name="bar-chart-outline" size={15} color={chartType === 'bar' ? colors.accent : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chartToggleBtn, chartType === 'line' && styles.chartToggleBtnActive]}
                onPress={() => setChartType('line')}
              >
                <Ionicons name="trending-up-outline" size={15} color={chartType === 'line' ? colors.accent : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          {period === 'Woche' ? (
            <View style={styles.vorjahrRow}>
              <View style={styles.vorjahrLine} />
              <Text style={styles.vorjahrText}>Ø VORJAHR</Text>
            </View>
          ) : null}
          {chartType === 'bar'
            ? <BarChart data={chartData} valueKey="value" labelKey="label" accentIndex={maxIdx} />
            : <LineChart data={chartData} valueKey="value" labelKey="label" accentIndex={maxIdx} />
          }
        </View>

        {/* ── Top Verbraucher — Ampelsystem ───────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Verbraucher</Text>
          <Text style={styles.cardSub}>Ampelbewertung nach Verbrauch</Text>

          {/* Ampel legend */}
          <View style={styles.ampelLegend}>
            <View style={styles.ampelLegendItem}>
              <View style={[styles.ampelDot, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.ampelLegendText}>Hoch</Text>
            </View>
            <View style={styles.ampelLegendItem}>
              <View style={[styles.ampelDot, { backgroundColor: '#f39c12' }]} />
              <Text style={styles.ampelLegendText}>Mittel</Text>
            </View>
            <View style={styles.ampelLegendItem}>
              <View style={[styles.ampelDot, { backgroundColor: '#2ecc71' }]} />
              <Text style={styles.ampelLegendText}>Niedrig</Text>
            </View>
          </View>

          {sortedConsumers.filter(c => c.device_id !== 'other').map((item, i, arr) => {
            const aColor = ampelColor(i, arr.length);
            const maxKwh = arr[0].kwh_month;
            const barWidth = (item.kwh_month / maxKwh) * 100;
            return (
              <View key={item.device_id} style={styles.ampelRow}>
                {/* Left: colored indicator */}
                <View style={[styles.ampelIndicator, { backgroundColor: aColor }]} />
                {/* Center: name + bar */}
                <View style={styles.ampelCenter}>
                  <View style={styles.ampelNameRow}>
                    <Text style={styles.ampelName}>{item.name}</Text>
                    <Text style={styles.ampelKwh}>{item.kwh_month.toFixed(1)} kWh</Text>
                  </View>
                  <View style={styles.ampelBarBg}>
                    <View style={[styles.ampelBarFill, { width: `${barWidth}%`, backgroundColor: aColor }]} />
                  </View>
                </View>
                {/* Right: info button */}
                <TouchableOpacity
                  style={styles.infoBtn}
                  onPress={() => setInfoDevice({ ...item, color: aColor })}
                >
                  <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ── Energiespartipps ────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.card} onPress={() => setShowTips(!showTips)} activeOpacity={0.8}>
          <View style={styles.tipsHeader}>
            <Text style={styles.cardTitle}>Personalisierte Energiespartipps</Text>
            <Ionicons name={showTips ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
          </View>
          {showTips ? energyTips.map(tip => (
            <View key={tip.id} style={styles.tipRow}>
              <View style={styles.tipIconWrap}>
                <Ionicons name="leaf-outline" size={16} color={colors.accent} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipDevice}>{tip.device}</Text>
                <Text style={styles.tipText}>{tip.tip}</Text>
                <Text style={styles.tipSaving}>Einsparung: ~{tip.saving_kwh_month} kWh/Mo ({tip.saving_eur_month.toFixed(2)} €)</Text>
              </View>
            </View>
          )) : null}
        </TouchableOpacity>

        {/* ── Amortisationsrechner ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Amortisationsrechner</Text>
          <Text style={styles.cardSub}>Lohnt sich ein Neugerät?</Text>

          <Text style={styles.inputLabel}>GERÄT WÄHLEN</Text>
          <View style={styles.devicePicker}>
            {computedAmortizationDevices.map(d => (
              <TouchableOpacity
                key={d.id}
                style={[styles.pickerOption, effectiveDevice?.id === d.id ? styles.pickerOptionActive : null]}
                onPress={() => { setSelectedDevice(d); setCalcResult(null); }}
              >
                <Text style={[styles.pickerText, effectiveDevice?.id === d.id ? styles.pickerTextActive : null]}>
                  {d.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {effectiveDevice ? (
            <View style={styles.currentStats}>
              <Text style={styles.currentStatsTitle}>Aktuelles Gerät</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Leistung</Text>
                <Text style={styles.infoValue}>{effectiveDevice.currentKwh} W</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Neues Gerät (Richtwert, −25%)</Text>
                <Text style={[styles.infoValue, { color: colors.accent }]}>{effectiveDevice.newKwh} W</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity style={styles.calcBtn} onPress={runCalculation}>
            <Ionicons name="calculator-outline" size={16} color={colors.bg} style={{ marginRight: 8 }} />
            <Text style={styles.calcBtnText}>Rechner starten</Text>
          </TouchableOpacity>

          {calcResult ? (
            <View style={styles.calcResult}>
              <Text style={styles.calcResultTitle}>Ergebnis</Text>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Stromersparnis/Jahr</Text>
                <Text style={styles.calcValue}>{calcResult.savingKwh} kWh ({calcResult.savingEur} €)</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Richtwert Neugerät</Text>
                <Text style={styles.calcValue}>{calcResult.newPrice} €</Text>
              </View>
              <View style={[styles.calcRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                <Text style={styles.calcLabelBig}>Amortisiert in</Text>
                <Text style={styles.calcValueBig}>{calcResult.years} Jahren</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  infoCard: { backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.base },
  infoDot: { width: 12, height: 12, borderRadius: 6 },
  infoTitle: { flex: 1, fontSize: typography.fontSizes.lg, fontWeight: '700', color: colors.textPrimary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, fontWeight: '500' },

  periodRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.base, marginVertical: spacing.base },
  periodBtn: { paddingVertical: 6, paddingHorizontal: spacing.base, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  periodBtnActive: { backgroundColor: colors.accentGlow, borderColor: colors.accent },
  periodText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  periodTextActive: { color: colors.accent, fontWeight: '600' },

  card: { backgroundColor: colors.bgCard, marginHorizontal: spacing.base, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginBottom: 2 },
  cardSub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chartToggle: { flexDirection: 'row', backgroundColor: colors.bgCardLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  chartToggleBtn: { padding: 7 },
  chartToggleBtnActive: { backgroundColor: colors.accentGlow },
  vorjahrRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  vorjahrLine: { width: 20, height: 1, backgroundColor: colors.textMuted },
  vorjahrText: { fontSize: typography.fontSizes.xs, color: colors.textMuted },
  bar: { width: '100%', borderRadius: 3 },
  barTopLabel: { fontSize: 9, color: colors.textSecondary, marginBottom: 2 },
  barLabel: { fontSize: 9, color: colors.textSecondary },

  // Ampel
  ampelLegend: { flexDirection: 'row', gap: spacing.base, marginTop: spacing.sm, marginBottom: spacing.base },
  ampelLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ampelDot: { width: 8, height: 8, borderRadius: 4 },
  ampelLegendText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  ampelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  ampelIndicator: { width: 4, height: 44, borderRadius: 2 },
  ampelCenter: { flex: 1 },
  ampelNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  ampelName: { fontSize: typography.fontSizes.md, color: colors.textPrimary, fontWeight: '500' },
  ampelKwh: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  ampelBarBg: { height: 6, backgroundColor: colors.bgCardLight, borderRadius: radius.full, overflow: 'hidden' },
  ampelBarFill: { height: '100%', borderRadius: radius.full },
  infoBtn: { padding: 4 },

  tipsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  tipIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentGlow, justifyContent: 'center', alignItems: 'center' },
  tipContent: { flex: 1 },
  tipDevice: { fontSize: typography.fontSizes.sm, fontWeight: '600', color: colors.accent, marginBottom: 2 },
  tipText: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, lineHeight: 18 },
  tipSaving: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 4 },

  inputLabel: { fontSize: typography.fontSizes.xs, color: colors.textMuted, fontWeight: '600', letterSpacing: 1, marginTop: spacing.base, marginBottom: 6 },
  devicePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.base },
  pickerOption: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCardLight },
  pickerOptionActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  pickerText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  pickerTextActive: { color: colors.accent, fontWeight: '600' },
  currentStats: { backgroundColor: colors.bgCardLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.base },
  currentStatsTitle: { fontSize: typography.fontSizes.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, marginBottom: spacing.base },
  calcBtnText: { color: colors.bg, fontWeight: '700', fontSize: typography.fontSizes.md },
  calcResult: { backgroundColor: colors.bgCardLight, borderRadius: radius.md, padding: spacing.md },
  calcResultTitle: { fontSize: typography.fontSizes.sm, fontWeight: '700', color: colors.accent, marginBottom: spacing.sm, letterSpacing: 0.5 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.border },
  calcLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  calcValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary },
  calcLabelBig: { fontSize: typography.fontSizes.md, color: colors.textPrimary, fontWeight: '600' },
  calcValueBig: { fontSize: typography.fontSizes.md, color: colors.accent, fontWeight: '700' },
});
