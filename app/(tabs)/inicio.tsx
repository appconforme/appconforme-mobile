/**
 * Tela "Início" (Dashboard) — pixel-perfect ao mockup `Tela Principal.png`
 * com fallback automático para o mockup `Tela principal sem dados.png`
 * quando o operador não tem nenhum dado ainda.
 */
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppConformeLogo } from '@/components/brand/AppConformeLogo';
import { GreetingBanner } from '@/components/dashboard/GreetingBanner';
import { QuickShortcut } from '@/components/dashboard/QuickShortcut';
import { TaskMiniRow } from '@/components/dashboard/TaskMiniRow';
import { Avatar } from '@/components/ui/avatar';
import { Banner } from '@/components/ui/banner';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { KpiCard } from '@/components/ui/kpi-card';
import { Screen } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { useAuthStore } from '@/lib/auth/store';
import { dashboardApi } from '@/lib/dashboard/api';
import { useFabStore } from '@/lib/ui/fab-store';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';

export default function InicioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const me = useAuthStore((s) => s.user);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const openFab = useFabStore((s) => s.setOpen);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['dashboard', activeCompanyId, me?.id],
    queryFn: () => dashboardApi.getOverview(me?.name ?? null),
    enabled: !!activeCompanyId,
  });

  const isEmpty =
    !!data &&
    data.kpis.tarefasConcluidasMes === 0 &&
    data.kpis.tarefasPendentes === 0 &&
    data.kpis.inspecoesConcluidasMes === 0 &&
    data.kpis.acoesEmAndamento === 0 &&
    data.recentTasks.length === 0 &&
    data.recentInspections.length === 0;

  return (
    <Screen bg="app" edges={['top']}>
      {/* Header com logo, bell, avatar */}
      <View style={[styles.topBar, { paddingTop: 4 }]}>
        <AppConformeLogo size={22} variant="horizontal" />
        <View style={styles.topRight}>
          <Pressable hitSlop={8} onPress={() => soon('Notificações')} style={styles.iconBtn}>
            <View>
              <Icon name="Bell" size={22} color={theme.color.text} />
              <View style={styles.badge} />
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/mais' as never)} hitSlop={6}>
            <Avatar name={me?.name} size={36} ring />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 88 }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={theme.color.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!data && isLoading ? null : (
          <GreetingBanner
            name={data?.greeting.name ?? 'colaborador'}
            pendingTasks={data?.kpis.tarefasPendentes ?? 0}
            conformidadePct={data?.kpis.conformidadePct ?? 0}
            onPressViewTasks={() => router.push('/(tabs)/tarefas')}
            emptyVariant={isEmpty}
          />
        )}

        {/* Resumo da unidade */}
        <Section
          title="Resumo da unidade"
          action={{ label: 'Ver detalhes', onPress: () => router.push('/(tabs)/relatorios' as never) }}
        >
          <View style={styles.kpiGrid}>
            <KpiCard
              icon="ClipboardCheck"
              value={data?.kpis.tarefasConcluidasMes ?? 0}
              label="Tarefas concluídas"
              tone="primary"
            />
            <KpiCard
              icon="Clock"
              value={data?.kpis.tarefasPendentes ?? 0}
              label="Tarefas pendentes"
              tone="orange"
            />
            <KpiCard
              icon="CheckCircle2"
              value={data?.kpis.inspecoesConcluidasMes ?? 0}
              label="Inspeções hoje"
              tone="success"
            />
            <KpiCard
              icon="AlertTriangle"
              value={data?.kpis.naoConformidadesAbertas ?? 0}
              label="Não conformidade"
              tone="danger"
            />
          </View>
        </Section>

        {/* Minhas tarefas */}
        <Section
          title="Minhas tarefas"
          action={{ label: 'Ver todas', onPress: () => router.push('/(tabs)/tarefas') }}
        >
          {isEmpty ? (
            <Card padded={false}>
              <EmptyState
                icon="ClipboardList"
                title="Você ainda não tem tarefas"
                description="Quando novas tarefas atribuídas a você aparecerem, elas mostrarão aqui."
                compact
                action={{
                  label: 'Ver todas as tarefas',
                  onPress: () => router.push('/(tabs)/tarefas'),
                  variant: 'outline',
                }}
              />
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {(data?.recentTasks ?? []).slice(0, 4).map((t) => (
                <TaskMiniRow
                  key={t.id}
                  title={t.title}
                  area={null}
                  status={statusLabel(t.status)}
                  tone={statusTone(t.status)}
                  icon={iconForStatus(t.status)}
                  iconTone={iconToneForStatus(t.status)}
                  onPress={() => router.push({ pathname: '/(tabs)/tarefas/[id]', params: { id: t.id } })}
                />
              ))}
            </View>
          )}
        </Section>

        {/* Atalhos rápidos */}
        <Section title="Atalhos rápidos">
          <View style={styles.shortcutsGrid}>
            <QuickShortcut icon="ClipboardCheck" label="Nova inspeção"  tone="primary" onPress={() => openFab(true)} />
            <QuickShortcut icon="Camera"         label="Enviar evidência" tone="accent" onPress={() => soon('Captura rápida de evidência')} />
            <QuickShortcut icon="PenLine"        label="Assinatura"     tone="orange"  onPress={() => soon('Assinatura digital')} />
            <QuickShortcut icon="QrCode"         label="Ler QR Code"    tone="success" onPress={() => soon('Scanner QR Code')} />
          </View>
        </Section>

        {/* Atividades / Dica do dia (variante vazia) */}
        {isEmpty ? (
          <>
            <Section title="Atividades recentes">
              <Card padded={false}>
                <EmptyState
                  icon="History"
                  title="Nenhuma atividade recente"
                  description="Suas ações realizadas aparecerão aqui."
                  compact
                />
              </Card>
            </Section>
            <Banner
              tone="tip"
              title="Dica do dia"
              message="Registre inconsistências e inspeções para contribuir com a melhoria contínua dos nossos processos."
            />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

// — helpers locais para mapear status de Task em tone visual —
import type { TaskStatus } from '@/lib/tasks/types';

function statusLabel(s: TaskStatus): string {
  return ({
    open: 'Pendente',
    assigned: 'Pendente',
    in_progress: 'Em andamento',
    waiting_approval: 'Aguardando',
    approved: 'Concluída',
    rejected: 'Reaberta',
    cancelled: 'Cancelada',
  } as const)[s];
}

function statusTone(s: TaskStatus): 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'orange' {
  return ({
    open: 'warning',
    assigned: 'warning',
    in_progress: 'info',
    waiting_approval: 'orange',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'neutral',
  } as const)[s];
}

function iconForStatus(s: TaskStatus): 'ClipboardList' | 'ClipboardCheck' | 'ClipboardX' {
  if (s === 'approved') return 'ClipboardCheck';
  if (s === 'cancelled' || s === 'rejected') return 'ClipboardX';
  return 'ClipboardList';
}

function iconToneForStatus(s: TaskStatus): 'primary' | 'success' | 'warning' | 'danger' | 'orange' | 'accent' {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'danger';
  if (s === 'cancelled') return 'orange';
  if (s === 'waiting_approval') return 'accent';
  if (s === 'in_progress') return 'primary';
  return 'warning';
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.color.bg,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  iconBtn: { padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.color.dangerFg,
    borderWidth: 1,
    borderColor: theme.color.bg,
  },
  scroll: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    gap: theme.spacing[5],
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  shortcutsGrid: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
});
