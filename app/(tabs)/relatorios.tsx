/**
 * Tela "Relatórios" — pixel-perfect ao mockup `Relatórios.png`.
 * Donut + barras + linha + lista de tipos, com filtros de período e área.
 * Dados via mock-layer (`reportsApi`) — trocar pelo endpoint real quando
 * disponível, mantendo o `ReportsOverview` shape.
 */
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Dimensions, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { Avatar } from '@/components/ui/avatar';
import { Banner } from '@/components/ui/banner';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { KpiCard } from '@/components/ui/kpi-card';
import { Screen } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { AppConformeLogo } from '@/components/brand/AppConformeLogo';
import { useAuthStore } from '@/lib/auth/store';
import { reportsApi } from '@/lib/reports/api';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';

const W = Dimensions.get('window').width;

export default function RelatoriosScreen() {
  const me = useAuthStore((s) => s.user);
  const [period, setPeriod] = useState<string>('01/05/2026 - 31/05/2026');
  const [area, setArea] = useState<string>('Todas as áreas');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['reports-overview', period, area],
    queryFn: () => reportsApi.getOverview({}),
  });

  return (
    <Screen bg="app" edges={['top']}>
      <View style={styles.topBar}>
        <AppConformeLogo size={22} variant="horizontal" />
        <View style={styles.topRight}>
          <Pressable hitSlop={8} onPress={() => soon('Notificações')} style={styles.iconBtn}>
            <Icon name="Bell" size={22} color={theme.color.text} />
          </Pressable>
          <Avatar name={me?.name} size={36} ring />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={theme.color.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Relatórios</Text>
          <Pressable onPress={() => soon('Exportar relatório')} style={styles.exportBtn}>
            <Icon name="Download" size={16} color={theme.color.primary} />
            <Text style={styles.exportText}>Exportar</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Acompanhe indicadores e desempenho dos processos</Text>

        <View style={styles.filterRow}>
          <FilterPill icon="Calendar" label={period} onPress={() => soon('Seletor de período')} />
          <FilterPill icon="Filter"   label={area}   onPress={() => soon('Filtro por área')} />
        </View>

        {isLoading || !data ? null : (
          <>
            <Section title="Visão geral do período">
              <View style={styles.kpiGrid}>
                <KpiCard icon="AlertTriangle" value={data.totalOcorrencias}     label="Ocorrências"        tone="primary" />
                <KpiCard icon="ShieldAlert"   value={data.totalNaoConformidades} label="Não conformidades"  tone="danger" />
                <KpiCard icon="CheckCircle2"  value={`${Math.round(data.taxaConcluidasPct * 100)}%`} label="Taxa de concluídas" tone="success" />
                <KpiCard icon="Timer"         value={`${data.tempoMedioResolucaoHoras}h`} label="Tempo médio resolução" tone="accent" />
              </View>
            </Section>

            <Section title="Ocorrências por status" action={{ label: 'Este mês', onPress: () => soon('Filtro por mês') }}>
              <Card>
                <View style={styles.donutRow}>
                  <View style={styles.donutWrap}>
                    <PieChart
                      donut
                      radius={70}
                      innerRadius={50}
                      data={data.statusBreakdown.map((s) => ({ value: s.count, color: s.color }))}
                      centerLabelComponent={() => (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={styles.donutCenterValue}>{data.totalOcorrencias}</Text>
                          <Text style={styles.donutCenterLabel}>Total</Text>
                        </View>
                      )}
                    />
                  </View>
                  <View style={styles.donutLegend}>
                    {data.statusBreakdown.map((s) => (
                      <View key={s.key} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                        <Text style={styles.legendLabel}>{s.label}</Text>
                        <Text style={styles.legendValue}>{s.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Card>
            </Section>

            <Section title="Ocorrências por área" action={{ label: 'Este mês', onPress: () => soon('Filtro por mês') }}>
              <Card>
                <View style={{ gap: 12 }}>
                  {data.byArea.map((row) => (
                    <View key={row.area} style={{ gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.barLabel}>{row.area}</Text>
                        <Text style={styles.barValue}>{row.count}</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${row.pct * 100}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            </Section>

            <Section title="Tendência de ocorrências">
              <Card>
                <LineChart
                  data={data.trend.map((p) => ({ value: p.y, label: p.x }))}
                  width={W - 96}
                  height={140}
                  thickness={3}
                  color={theme.color.primary}
                  startFillColor={theme.color.primarySoft}
                  endFillColor={theme.color.surface}
                  startOpacity={0.8}
                  endOpacity={0.1}
                  areaChart
                  isAnimated
                  yAxisColor="transparent"
                  xAxisColor={theme.color.border}
                  hideRules
                  yAxisTextStyle={{ color: theme.color.textMuted, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: theme.color.textMuted, fontSize: 10 }}
                  initialSpacing={12}
                  endSpacing={12}
                  dataPointsColor={theme.color.primary}
                  dataPointsRadius={4}
                />
              </Card>
            </Section>

            <Section title="Principais tipos de ocorrência" action={{ label: 'Ver lista', onPress: () => soon('Lista completa') }}>
              <Card padded="sm">
                {data.topTypes.map((t, i) => (
                  <View key={t.type} style={[styles.typeRow, i > 0 && styles.typeDivider]}>
                    <Text style={styles.typeIdx}>{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeName}>{t.type}</Text>
                      <Text style={styles.typeMeta}>{Math.round((t.count / data.totalOcorrencias) * 100)}% do total</Text>
                    </View>
                    <Text style={styles.typeCount}>{t.count}</Text>
                  </View>
                ))}
              </Card>
            </Section>

            <Banner
              tone="tip"
              title="Dica"
              message="Os relatórios são atualizados em tempo real conforme as ocorrências e inspeções são registradas."
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function FilterPill({ icon, label, onPress }: { icon: 'Calendar' | 'Filter'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.filterPill}>
      <Icon name={icon} size={14} color={theme.color.text} />
      <Text style={styles.filterPillText} numberOfLines={1}>{label}</Text>
      <Icon name="ChevronDown" size={14} color={theme.color.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  iconBtn: { padding: 4 },
  content: { paddingHorizontal: theme.spacing[4], paddingBottom: 120, gap: theme.spacing[4] },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: theme.fontSize['3xl'], color: theme.color.text, fontFamily: theme.fontFamily.bold },
  subtitle: { marginTop: -8, fontSize: theme.fontSize.base, color: theme.color.textMuted },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: theme.color.primarySoft,
    borderRadius: theme.radius.full,
  },
  exportText: { fontSize: theme.fontSize.base, color: theme.color.primary, fontFamily: theme.fontFamily.semibold },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: theme.color.surface,
    borderWidth: 1, borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    flex: 1,
  },
  filterPillText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.color.text, fontFamily: theme.fontFamily.medium },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  donutCenterValue: { fontSize: theme.fontSize.xl, fontFamily: theme.fontFamily.bold, color: theme.color.text },
  donutCenterLabel: { fontSize: theme.fontSize.sm, color: theme.color.textMuted },
  donutLegend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: theme.fontSize.base, color: theme.color.text, fontFamily: theme.fontFamily.regular },
  legendValue: { fontSize: theme.fontSize.base, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  barLabel: { fontSize: theme.fontSize.base, color: theme.color.text, fontFamily: theme.fontFamily.medium },
  barValue: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.semibold },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: theme.color.bgSubtle, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.color.primary, borderRadius: 4 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  typeDivider: { borderTopWidth: 1, borderTopColor: theme.color.border },
  typeIdx: { width: 20, fontSize: theme.fontSize.base, color: theme.color.textMuted, fontFamily: theme.fontFamily.bold, textAlign: 'center' },
  typeName: { fontSize: theme.fontSize.md, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  typeMeta: { fontSize: theme.fontSize.sm, color: theme.color.textMuted },
  typeCount: { fontSize: theme.fontSize.lg, color: theme.color.primary, fontFamily: theme.fontFamily.bold },
});

// Avoid unused-import warning for BarChart (kept available for future).
void BarChart;
