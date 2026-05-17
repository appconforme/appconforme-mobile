import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EvidenceList } from '@/components/inspections/evidence/EvidenceList';
import { EvidenceUploader } from '@/components/inspections/evidence/EvidenceUploader';
import type { EvidenceTarget } from '@/lib/evidences/types';
import type { AnswerInput, ItemRendererProps } from './types';

/**
 * Renderer pra itens do tipo `photo`. Não armazena nada localmente — a
 * "resposta" é a presença de evidências (n>=1) anexadas a este item.
 *
 * Handshake com o buffer do parent:
 *   - count > 0  → onChange({ value: 'attached', count })
 *   - count == 0 → onChange(null)
 *
 * `inspectionAnswerId` é preferido como target porque amarra a evidência
 * exatamente a esta resposta; se ainda não houver answer persistida, cai
 * pra `inspectionId` (a API aceita qualquer um dos dois).
 */
export function PhotoRenderer({
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

  // Evita disparar onChange em loop quando o count não mudou de fato.
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
        <EvidenceUploader target={target} defaultType="photo" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  lockText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
});
