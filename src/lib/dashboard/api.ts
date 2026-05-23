/**
 * Mock-layer do Dashboard. Hoje deriva KPIs a partir de tasks/inspections
 * reais e usa fixtures para o que não existe (não-conformidades, evidências
 * recentes detalhadas). Trocar por endpoint real `GET /dashboard` quando
 * disponível — manter a assinatura.
 */
import { inspectionsApi } from '@/lib/inspections/api';
import { tasksApi } from '@/lib/tasks/api';
import { isShowcase, sc } from '@/theme/showcase';
import { EMPTY_KPIS, SHOWCASE_DASHBOARD, SHOWCASE_KPIS } from './fixtures';
import type { DashboardData } from './types';

function greetingFor(name: string | null | undefined, dateNow = new Date()): DashboardData['greeting'] {
  const hour = dateNow.getHours();
  const word = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const display = (name?.trim().split(/\s+/)[0]) || 'colaborador';
  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(dateNow);
  return {
    name: display,
    subtitle: 'Vamos manter tudo em conformidade hoje.',
    dateLabel: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1),
  };
}

export const dashboardApi = {
  async getOverview(userName: string | null): Promise<DashboardData> {
    const showcase = isShowcase();

    // Tasks: tentamos só as últimas atribuídas a mim.
    const [tasksPage, inspectionsPage] = await Promise.allSettled([
      tasksApi.list({ assignedTo: 'me', perPage: 5, sortBy: 'updatedAt', sortOrder: 'desc' }),
      inspectionsApi.list({ assignedTo: 'me', perPage: 5, sortBy: 'updatedAt', sortOrder: 'desc' }),
    ]);

    const recentTasks = tasksPage.status === 'fulfilled' ? tasksPage.value.items : [];
    const recentInspections = inspectionsPage.status === 'fulfilled' ? inspectionsPage.value.items : [];

    const pending = recentTasks.filter((t) =>
      t.status === 'open' || t.status === 'assigned' || t.status === 'rejected',
    ).length;

    // Derivações best-effort + fallback pra showcase ou zero.
    const kpis = showcase
      ? SHOWCASE_KPIS
      : {
          ...EMPTY_KPIS,
          tarefasPendentes: pending,
        };

    return {
      greeting: greetingFor(showcase ? 'João Silva' : userName),
      kpis,
      recentTasks,
      recentInspections,
      lastEvidences: sc(SHOWCASE_DASHBOARD.lastEvidences, []),
      openNonConformities: sc(SHOWCASE_DASHBOARD.openNonConformities, []),
    };
  },
};
