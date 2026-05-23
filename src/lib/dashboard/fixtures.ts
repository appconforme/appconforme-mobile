/**
 * Fixtures do Dashboard — usadas quando SHOWCASE está ligado OU quando
 * o backend ainda não devolve os KPIs (estado normal hoje).
 * Os números aqui batem com o mockup `Tela Principal.png`.
 */
import type { DashboardData, DashboardKpis } from './types';

export const SHOWCASE_KPIS: DashboardKpis = {
  conformidadePct: 0.85,
  tarefasPendentes: 6,
  tarefasConcluidasMes: 24,
  inspecoesConcluidasMes: 6,
  acoesEmAndamento: 3,
  naoConformidadesAbertas: 1,
};

export const EMPTY_KPIS: DashboardKpis = {
  conformidadePct: 0,
  tarefasPendentes: 0,
  tarefasConcluidasMes: 0,
  inspecoesConcluidasMes: 0,
  acoesEmAndamento: 0,
  naoConformidadesAbertas: 0,
};

export const SHOWCASE_TASKS_MOCK = [
  { id: 't1', title: 'Check-list de abertura', area: 'Produção',  status: 'Atrasada',  tone: 'danger' as const,  due: 'Atrasada 10/05/2026 · 08:00' },
  { id: 't2', title: 'Controle de temperatura', area: 'Câmara fria', status: 'Pendente', tone: 'warning' as const, due: 'Hoje 14:00' },
  { id: 't3', title: 'Higienização de equipamentos', area: 'Produção', status: 'Pendente', tone: 'warning' as const, due: 'Hoje 16:00' },
  { id: 't4', title: 'Check-list de fechamento', area: 'Produção', status: 'Concluída', tone: 'success' as const, due: 'Concluída ontem' },
] as const;

export const SHOWCASE_EVIDENCES = [
  { id: 'e1', title: 'Máquina 02',     kind: 'photo' as const,    when: 'Hoje · 14:21' },
  { id: 'e2', title: 'Painel de controle', kind: 'photo' as const, when: 'Hoje · 11:02' },
  { id: 'e3', title: 'Ronda noturna',   kind: 'video' as const,    when: 'Ontem · 22:08' },
];

export const SHOWCASE_NONCONF = [
  {
    id: 'nc1', code: 'NC-2026-075', title: 'Tubulação em vazamento na tubulação',
    area: 'Câmara fria · Produção', severity: 'high' as const, openedAt: 'Hoje · 09:41',
  },
];

export const SHOWCASE_DASHBOARD: Pick<DashboardData, 'lastEvidences' | 'openNonConformities'> = {
  lastEvidences: SHOWCASE_EVIDENCES,
  openNonConformities: SHOWCASE_NONCONF,
};
