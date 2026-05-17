import type { AnswerInput } from '@/lib/inspections/api';
import type { InspectionItem } from '@/lib/inspections/types';

export type { AnswerInput };

/**
 * Contrato comum a todos os renderers de item (yes_no, text, photo, ...).
 *
 * O renderer NÃO mantém estado próprio — só renderiza o `value` corrente do
 * buffer e devolve mudanças via `onChange`. O parent (AnswerForm/[id]) guarda
 * o `Map<itemId, AnswerInput>` e dispara o save batch.
 */
export interface ItemRendererProps {
  item: InspectionItem;
  value: AnswerInput | null;
  onChange: (next: AnswerInput | null) => void;
  disabled: boolean;
}
