export interface ReportsPeriodFilter {
  fromIso: string;
  toIso: string;
  label: string; // ex: "01/05/2026 - 31/05/2026"
}

export interface ReportsOverview {
  totalOcorrencias: number;
  totalNaoConformidades: number;
  taxaConcluidasPct: number;       // 0..1
  tempoMedioResolucaoHoras: number;
  statusBreakdown: ReadonlyArray<{ key: 'open' | 'in_progress' | 'completed' | 'closed'; label: string; count: number; color: string }>;
  byArea: ReadonlyArray<{ area: string; count: number; pct: number }>;
  trend: ReadonlyArray<{ x: string; y: number }>;
  topTypes: ReadonlyArray<{ type: string; count: number; tone: 'primary' | 'orange' | 'danger' | 'success' | 'accent' | 'neutral' }>;
}
