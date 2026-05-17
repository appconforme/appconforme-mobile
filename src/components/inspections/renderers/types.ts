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
  /**
   * UUID da inspeção corrente. Usado por renderers que ancoram evidências
   * (photo / signature / file). Os demais renderers podem ignorar.
   */
  inspectionId: string;
  /**
   * UUID da resposta persistida (`InspectionAnswer.id`), se já existir.
   * Preferido como `target` no upload — quando ausente, o renderer cai
   * pra `inspectionId` (a API aceita qualquer um dos dois).
   */
  inspectionAnswerId?: string | null;
}
