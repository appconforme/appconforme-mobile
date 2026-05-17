import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EvidenceList } from '@/components/inspections/evidence/EvidenceList';
import { EvidenceUploader } from '@/components/inspections/evidence/EvidenceUploader';
import type { EvidenceType } from '@/lib/checklists/types';
import type { EvidenceTarget } from '@/lib/evidences/types';
import type { AnswerInput, ItemRendererProps } from './types';

/**
 * Renderer genérico pra itens que carregam evidência mas não são foto pura
 * (signature, file). Comportamento idêntico ao PhotoRenderer — só muda o
 * `defaultType` do upload.
 *
 * Assinatura digital de verdade (canvas) está fora do MVP mobile; aqui
 * tratamos como upload de imagem/arquivo, igual ao web.
 */
export function FallbackRenderer({
  item,
  value,
  onChange,
  disabled,
  inspectionId,
  inspectionAnswerId,
}: ItemRendererProps) {
  const target: EvidenceTarget = inspectionAnswerId
    ? { inspectionAnswerId }
    : { inspectionId };

  const defaultType: EvidenceType =
    item.evidenceType ??
    (item.type === 'signature'
      ? 'signature'
      : item.type === 'photo'
        ? 'photo'
        : 'document');

  const lastCountRef = useRef<number | null>(null);

  const handleCount = useCallback(
    (count: number) => {
      if (lastCountRef.current === count) return;
      lastCountRef.current = count;
      if (count > 0) {
        const next: AnswerInput = {
          checklistItemId: item.id,
          answerType: item.type,
          answerValue: { value: 'attached', count },
        };
        onChange(next);
      } else if (value !== null) {
        onChange(null);
      }
    },
    [item.id, item.type, onChange, value],
  );

  return (
    <View style={styles.wrap}>
      <EvidenceList
        inspectionId={inspectionId}
        inspectionAnswerId={inspectionAnswerId ?? null}
        onCountChange={handleCount}
        disabled={disabled}
      />
      {disabled ? (
        <Text style={styles.lockText}>
          Esta inspeção não aceita novos uploads no momento.
        </Text>
      ) : (
        <EvidenceUploader target={target} defaultType={defaultType} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  lockText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
});
