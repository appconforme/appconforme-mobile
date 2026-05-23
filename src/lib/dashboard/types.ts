/**
 * Tipos do painel Início (Dashboard). Não vêm da API hoje — agregados
 * client-side a partir de listas existentes (tasks/inspections), mais
 * fixtures de showcase para KPIs que ainda não têm endpoint.
 */

import type { Task } from '@/lib/tasks/types';
import type { Inspection } from '@/lib/inspections/types';

export interface DashboardKpis {
  conformidadePct: number;          // 0..1 — donut do banner
  tarefasPendentes: number;
  tarefasConcluidasMes: number;
  inspecoesConcluidasMes: number;
  acoesEmAndamento: number;
  naoConformidadesAbertas: number;
}

export interface DashboardData {
  greeting: { name: string; subtitle: string; dateLabel: string };
  kpis: DashboardKpis;
  recentTasks: Task[];
  recentInspections: Inspection[];
  lastEvidences: ReadonlyArray<{
    id: string;
    title: string;
    kind: 'photo' | 'video' | 'audio' | 'document';
    when: string;
    thumbUri?: string;
  }>;
  openNonConformities: ReadonlyArray<{
    id: string;
    code: string;
    title: string;
    area: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    openedAt: string;
  }>;
}
