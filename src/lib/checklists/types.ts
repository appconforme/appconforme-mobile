/**
 * Enums e labels do módulo Checklists/ChecklistItems — espelho do
 * `appconforme-web-admin/src/lib/checklists/types.ts`. No mobile MVP só
 * precisamos do que é consumido por Inspeções (tipo de item + evidência);
 * o resto (Checklist/ChecklistItem completos) fica fora até precisar.
 */

export type ChecklistItemType =
  | 'yes_no'
  | 'conform_not_conform'
  | 'text'
  | 'number'
  | 'single_choice'
  | 'multiple_choice'
  | 'date'
  | 'photo'
  | 'signature'
  | 'file';

export type EvidenceType =
  | 'photo'
  | 'video'
  | 'audio'
  | 'document'
  | 'signature'
  | 'annotated_image'
  | 'text_note';

export const CHECKLIST_ITEM_TYPE_LABEL: Record<ChecklistItemType, string> = {
  yes_no: 'Sim / Não',
  conform_not_conform: 'Conforme / Não conforme',
  text: 'Texto',
  number: 'Número',
  single_choice: 'Escolha única',
  multiple_choice: 'Múltipla escolha',
  date: 'Data',
  photo: 'Foto',
  signature: 'Assinatura',
  file: 'Arquivo',
};

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  photo: 'Foto',
  video: 'Vídeo',
  audio: 'Áudio',
  document: 'Documento',
  signature: 'Assinatura',
  annotated_image: 'Imagem anotada',
  text_note: 'Observação textual',
};
