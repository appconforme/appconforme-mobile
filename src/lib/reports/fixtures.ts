import type { ReportsOverview } from './types';
import { theme } from '@/theme';

export const SHOWCASE_REPORTS: ReportsOverview = {
  totalOcorrencias: 128,
  totalNaoConformidades: 23,
  taxaConcluidasPct: 0.94,
  tempoMedioResolucaoHoras: 42,
  statusBreakdown: [
    { key: 'open',        label: 'Abertas',     count: 57, color: theme.color.primary },
    { key: 'in_progress', label: 'Em andamento', count: 32, color: theme.color.warningFg },
    { key: 'completed',   label: 'Concluídas',   count: 26, color: theme.color.successFg },
    { key: 'closed',      label: 'Encerradas',   count: 13, color: theme.color.textMuted },
  ],
  byArea: [
    { area: 'Produção',    count: 48, pct: 0.85 },
    { area: 'Planejamento', count: 32, pct: 0.6 },
    { area: 'Qualidade',    count: 22, pct: 0.42 },
    { area: 'Logística',    count: 17, pct: 0.32 },
    { area: 'Utilidades',   count: 13, pct: 0.25 },
  ],
  trend: [
    { x: '01/05', y: 12 }, { x: '08/05', y: 18 }, { x: '15/05', y: 14 },
    { x: '22/05', y: 22 }, { x: '29/05', y: 16 }, { x: '05/06', y: 21 },
  ],
  topTypes: [
    { type: 'Vazamento',           count: 28, tone: 'primary' },
    { type: 'Falha de equipamento', count: 22, tone: 'orange' },
    { type: 'Segurança',            count: 18, tone: 'danger' },
    { type: 'Higiene',              count: 14, tone: 'success' },
    { type: 'Queda de material',    count: 11, tone: 'accent' },
  ],
};

export const EMPTY_REPORTS: ReportsOverview = {
  totalOcorrencias: 0,
  totalNaoConformidades: 0,
  taxaConcluidasPct: 0,
  tempoMedioResolucaoHoras: 0,
  statusBreakdown: [
    { key: 'open',        label: 'Abertas',     count: 0, color: theme.color.primary },
    { key: 'in_progress', label: 'Em andamento', count: 0, color: theme.color.warningFg },
    { key: 'completed',   label: 'Concluídas',   count: 0, color: theme.color.successFg },
    { key: 'closed',      label: 'Encerradas',   count: 0, color: theme.color.textMuted },
  ],
  byArea: [],
  trend: [],
  topTypes: [],
};
