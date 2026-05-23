/**
 * Wizard "Registrar ocorrência" — 4 steps, pixel-perfect aos mockups
 * `Nova Ocorrência - {Informações, Evidências, Análise, Revisão}.png`.
 *
 * Persiste rascunho local via `occurrenceDrafts` (SecureStore).
 * "Finalizar registro" hoje só marca submittedAt no rascunho e mostra alert —
 * quando o backend `POST /occurrences` existir, basta trocar `submitDraft`
 * por uma chamada real ao endpoint.
 */
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatusPill } from '@/components/ui/status-pill';
import { TextField } from '@/components/ui/text-field';
import { OccurrenceStepper } from '@/components/occurrences/Stepper';
import { SeveritySelector } from '@/components/occurrences/SeveritySelector';
import {
  COMMON_CONTRIBUTING_CAUSES,
  COMMON_IMPACTS,
  OCCURRENCE_TYPES,
  SEVERITY_LABEL,
  type OccurrenceDraft,
  type OccurrenceEvidenceRef,
} from '@/lib/occurrences/types';
import { newDraft, occurrenceDrafts } from '@/lib/occurrences/draft';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';

const STEPS = [
  { id: 1, label: 'Informações' },
  { id: 2, label: 'Evidências' },
  { id: 3, label: 'Análise' },
  { id: 4, label: 'Revisão' },
] as const;

export default function RegistrarOcorrenciaScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState<OccurrenceDraft>(() => newDraft());
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Auto-save quando o draft muda (debounced simples).
    const t = setTimeout(() => { void occurrenceDrafts.save(draft); }, 1200);
    return () => clearTimeout(t);
  }, [draft]);

  const completed = useMemo<number[]>(() => {
    const done: number[] = [];
    if (draft.title && draft.occurredAt && draft.severity) done.push(1);
    if (draft.evidences.length > 0) done.push(2);
    if (draft.rootCause && draft.immediateActions) done.push(3);
    return done;
  }, [draft]);

  async function onSaveDraft() {
    setSaving(true);
    try {
      const saved = await occurrenceDrafts.save(draft);
      setDraft(saved);
      Alert.alert('Rascunho salvo', 'Você pode voltar e continuar mais tarde.');
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit() {
    setSubmitting(true);
    try {
      const final: OccurrenceDraft = { ...draft, submittedAt: new Date().toISOString() };
      await occurrenceDrafts.save(final);
      Alert.alert('Ocorrência registrada', 'Ela ficou disponível para acompanhamento e ações corretivas.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance = () => {
    if (step === 1) return !!(draft.title && draft.severity);
    if (step === 2) return true;
    if (step === 3) return !!(draft.rootCause && draft.immediateActions);
    return true;
  };

  return (
    <Screen bg="app" edges={['top']}>
      <ScreenHeader
        back
        title="Registrar ocorrência"
        subtitle="Nova ocorrência"
        rightActions={[{
          label: 'Salvar rascunho',
          onPress: () => void onSaveDraft(),
          tone: 'primary',
        }]}
      />

      <View style={styles.stepperWrap}>
        <OccurrenceStepper
          steps={STEPS}
          active={step}
          completed={completed}
          onSelect={(id) => setStep(id as 1 | 2 | 3 | 4)}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? <Step1Info draft={draft} setDraft={setDraft} /> :
           step === 2 ? <Step2Evidence draft={draft} setDraft={setDraft} /> :
           step === 3 ? <Step3Analysis draft={draft} setDraft={setDraft} /> :
                       <Step4Review draft={draft} onEditStep={(s) => setStep(s as 1 | 2 | 3 | 4)} />}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 ? (
            <Button label="Anterior" variant="secondary" leftIcon="ChevronLeft" onPress={() => setStep((s) => (s - 1) as 1 | 2 | 3)} style={{ flex: 1 }} />
          ) : null}
          {step < 4 ? (
            <Button
              label="Próximo"
              rightIcon="ChevronRight"
              onPress={() => {
                if (!canAdvance()) {
                  Alert.alert('Faltam campos obrigatórios', 'Preencha os campos sinalizados antes de avançar.');
                  return;
                }
                setStep((s) => (s + 1) as 2 | 3 | 4);
              }}
              style={{ flex: step > 1 ? 1.4 : 1 }}
            />
          ) : (
            <Button
              label="Finalizar registro"
              leftIcon="Check"
              loading={submitting || saving}
              onPress={() => void onSubmit()}
              style={{ flex: step > 1 ? 1.4 : 1 }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// =====================================================================
// Step 1 — Informações
// =====================================================================

function Step1Info({ draft, setDraft }: { draft: OccurrenceDraft; setDraft: (d: OccurrenceDraft) => void }) {
  return (
    <>
      <Banner
        tone="info"
        title="Informações da ocorrência"
        message="Preencha os dados gerais da ocorrência."
      />

      <TextField
        label="Título da ocorrência"
        required
        placeholder="Ex: Vazamento na tubulação de água gelada"
        value={draft.title}
        onChangeText={(v) => setDraft({ ...draft, title: v })}
      />

      <View style={styles.twoCol}>
        <TextField
          containerStyle={{ flex: 1 }}
          label="Data e hora"
          leftIcon="Calendar"
          value={formatDateTimeInput(draft.occurredAt)}
          onChangeText={(v) => setDraft({ ...draft, occurredAt: parseDateTimeInput(v) ?? draft.occurredAt })}
          placeholder="AAAA-MM-DD HH:MM"
        />
        <Pressable
          style={{ flex: 1 }}
          onPress={() => soon('Seletor de local')}
        >
          <TextField
            label="Local / Área"
            leftIcon="MapPin"
            rightIcon="ChevronDown"
            editable={false}
            value={draft.locationName ?? ''}
            placeholder="Selecione o local"
          />
        </Pressable>
      </View>

      <SelectField
        label="Tipo de ocorrência"
        value={draft.typeLabel ?? null}
        placeholder="Selecione o tipo"
        leftIcon="Tag"
        onSelect={(opt) => setDraft({ ...draft, type: opt.id, typeLabel: opt.label })}
        options={OCCURRENCE_TYPES}
      />

      <View>
        <Text style={styles.fieldLabel}>Nível de criticidade <Text style={{ color: theme.color.dangerFg }}>*</Text></Text>
        <SeveritySelector
          value={draft.severity}
          onChange={(s) => setDraft({ ...draft, severity: s })}
        />
      </View>

      <TextField
        label="Descrição detalhada"
        placeholder="Descreva o que aconteceu, causas aparentes e impactos..."
        value={draft.description}
        onChangeText={(v) => setDraft({ ...draft, description: v })}
        multiline
        numberOfLines={4}
        hint={`${draft.description.length}/500 caracteres`}
        maxLength={500}
      />

      <ChipPickerField
        label="Pessoas envolvidas (opcional)"
        placeholder="Buscar e selecionar"
        leftIcon="Users"
        items={draft.involvedPeople.map((p) => p.name)}
        onAdd={() => soon('Selecionar pessoas')}
        onRemove={(idx) => setDraft({
          ...draft,
          involvedPeople: draft.involvedPeople.filter((_, i) => i !== idx),
        })}
      />

      <ChipPickerField
        label="Etiquetas (opcional)"
        placeholder="Adicionar etiquetas"
        leftIcon="Bookmark"
        items={[...draft.tags]}
        onAdd={() => soon('Editor de etiquetas')}
        onRemove={(idx) => setDraft({ ...draft, tags: draft.tags.filter((_, i) => i !== idx) })}
      />
    </>
  );
}

// =====================================================================
// Step 2 — Evidências
// =====================================================================

function Step2Evidence({ draft, setDraft }: { draft: OccurrenceDraft; setDraft: (d: OccurrenceDraft) => void }) {
  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permissão necessária', 'Conceda acesso à câmera.'); return; }
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (r.canceled) return;
    addAsset(r.assets[0]);
  }
  async function pickFromGallery() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.85 });
    if (r.canceled) return;
    addAsset(r.assets[0]);
  }
  function addAsset(asset: ImagePicker.ImagePickerAsset | undefined) {
    if (!asset) return;
    const kind: OccurrenceEvidenceRef['kind'] = asset.type === 'video' ? 'video' : 'photo';
    const ev: OccurrenceEvidenceRef = {
      id: String(Date.now()),
      kind,
      uri: asset.uri,
      filename: asset.fileName ?? `${kind}-${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
      sizeBytes: asset.fileSize ?? undefined,
      durationSec: asset.duration ?? undefined,
      takenAt: new Date().toISOString(),
    };
    setDraft({ ...draft, evidences: [...draft.evidences, ev] });
  }

  function removeEvidence(id: string) {
    setDraft({ ...draft, evidences: draft.evidences.filter((e) => e.id !== id) });
  }

  return (
    <>
      <Banner
        tone="info"
        title="Evidências"
        message="Adicione fotos, vídeos, áudios ou documentos que comprovem a ocorrência."
      />

      <View style={styles.evidenceButtonsGrid}>
        <EvBtn icon="Camera"  label="Tirar foto"    onPress={() => void pickFromCamera()} />
        <EvBtn icon="Image"   label="Galeria"       onPress={() => void pickFromGallery()} />
        <EvBtn icon="Video"   label="Gravar vídeo"  onPress={() => soon('Gravação de vídeo')} />
        <EvBtn icon="Mic"     label="Gravar áudio"  onPress={() => soon('Gravação de áudio')} />
        <EvBtn icon="Paperclip" label="Anexar arquivo" onPress={() => soon('Anexar arquivo')} />
      </View>

      <Text style={styles.sectionTitle}>
        Evidências adicionadas ({draft.evidences.length})
      </Text>

      {draft.evidences.length === 0 ? (
        <Card padded>
          <Text style={styles.muted}>Nenhuma evidência adicionada ainda.</Text>
        </Card>
      ) : (
        <View style={{ gap: 8 }}>
          {draft.evidences.map((ev) => (
            <EvidenceRow key={ev.id} ev={ev} onRemove={() => removeEvidence(ev.id)} />
          ))}
        </View>
      )}

      <Banner
        tone="tip"
        title="Dica"
        message="Quanto mais detalhadas as evidências, melhor será a análise da ocorrência."
      />
    </>
  );
}

// =====================================================================
// Step 3 — Análise
// =====================================================================

function Step3Analysis({ draft, setDraft }: { draft: OccurrenceDraft; setDraft: (d: OccurrenceDraft) => void }) {
  function toggleCause(c: string) {
    const has = draft.contributingCauses.includes(c);
    setDraft({
      ...draft,
      contributingCauses: has
        ? draft.contributingCauses.filter((x) => x !== c)
        : [...draft.contributingCauses, c],
    });
  }
  function toggleImpact(i: string) {
    const has = draft.impacts.includes(i);
    setDraft({
      ...draft,
      impacts: has ? draft.impacts.filter((x) => x !== i) : [...draft.impacts, i],
    });
  }

  return (
    <>
      <Banner
        tone="info"
        title="Análise da ocorrência"
        message="Identifique causas, impactos e defina ações para resolver o problema."
      />

      <TextField
        label="Causa raiz"
        required
        placeholder="Ex: Falha de vedação na conexão da tubulação"
        value={draft.rootCause}
        onChangeText={(v) => setDraft({ ...draft, rootCause: v })}
        multiline
        numberOfLines={3}
      />

      <View>
        <Text style={styles.fieldLabel}>Causas contribuintes (opcional)</Text>
        <View style={styles.checkboxList}>
          {COMMON_CONTRIBUTING_CAUSES.map((c) => (
            <CheckboxRow key={c} label={c} checked={draft.contributingCauses.includes(c)} onToggle={() => toggleCause(c)} />
          ))}
        </View>
        <Pressable onPress={() => soon('Adicionar causa personalizada')}>
          <Text style={styles.addLink}>+ Adicionar outra causa</Text>
        </Pressable>
      </View>

      <View>
        <Text style={styles.fieldLabel}>Impactos identificados</Text>
        <View style={styles.checkboxList}>
          {COMMON_IMPACTS.map((i) => (
            <CheckboxRow key={i} label={i} checked={draft.impacts.includes(i)} onToggle={() => toggleImpact(i)} />
          ))}
        </View>
      </View>

      <TextField
        label="Ações imediatas tomadas"
        required
        placeholder="Ex: Isolamento da tubulação, contenção do vazamento e acionamento da manutenção"
        value={draft.immediateActions}
        onChangeText={(v) => setDraft({ ...draft, immediateActions: v })}
        multiline
        numberOfLines={3}
        hint={`${draft.immediateActions.length}/300 caracteres`}
        maxLength={300}
      />

      <View>
        <Text style={styles.fieldLabel}>Nível de risco (após ações imediatas)</Text>
        <SeveritySelector
          value={draft.riskLevel}
          onChange={(s) => setDraft({ ...draft, riskLevel: s })}
        />
      </View>

      <Pressable onPress={() => soon('Selecionar responsável')}>
        <TextField
          label="Responsável pela análise"
          leftIcon="User"
          rightIcon="ChevronDown"
          editable={false}
          value={draft.responsibleName ?? ''}
          placeholder="Selecione"
        />
      </Pressable>
    </>
  );
}

// =====================================================================
// Step 4 — Revisão
// =====================================================================

function Step4Review({ draft, onEditStep }: { draft: OccurrenceDraft; onEditStep: (s: number) => void }) {
  return (
    <>
      <Banner
        tone="info"
        title="Revisão e confirmação"
        message="Revise todas as informações antes de finalizar e registrar a ocorrência."
      />

      <ReviewSection title="Resumo da ocorrência" onEdit={() => onEditStep(1)}>
        <ReviewRow label="Título" value={draft.title || '—'} />
        <ReviewRow label="Data e hora" value={formatDateTimeInput(draft.occurredAt)} />
        <ReviewRow label="Local / Área" value={draft.locationName ?? '—'} />
        <ReviewRow label="Tipo" value={draft.typeLabel ?? '—'} />
        <ReviewRow label="Nível" value={draft.severity ? SEVERITY_LABEL[draft.severity] : '—'} highlight />
      </ReviewSection>

      <ReviewSection title="Descrição" onEdit={() => onEditStep(1)}>
        <Text style={styles.reviewBody}>{draft.description || '—'}</Text>
      </ReviewSection>

      <ReviewSection
        title={`Evidências adicionadas (${draft.evidences.length})`}
        rightLabel={draft.evidences.length > 0 ? 'Ver todas' : undefined}
        onRightPress={() => onEditStep(2)}
        onEdit={() => onEditStep(2)}
      >
        {draft.evidences.length === 0 ? (
          <Text style={styles.muted}>Nenhuma evidência adicionada.</Text>
        ) : (
          <View style={styles.evidenceThumbs}>
            {draft.evidences.slice(0, 4).map((ev) => (
              <View key={ev.id} style={styles.thumb}>
                <Icon
                  name={ev.kind === 'video' ? 'PlayCircle' : ev.kind === 'audio' ? 'Mic' : ev.kind === 'document' ? 'FileText' : 'Image'}
                  size={24}
                  color={theme.color.primary}
                />
              </View>
            ))}
          </View>
        )}
      </ReviewSection>

      <ReviewSection title="Análise" onEdit={() => onEditStep(3)}>
        <ReviewRow label="Causa raiz" value={draft.rootCause || '—'} />
        <ReviewRow label="Causas contribuintes" value={draft.contributingCauses.join(', ') || '—'} />
        <ReviewRow label="Impactos" value={draft.impacts.join(', ') || '—'} />
        <ReviewRow label="Ações imediatas" value={draft.immediateActions || '—'} />
        <ReviewRow label="Nível de risco" value={draft.riskLevel ? SEVERITY_LABEL[draft.riskLevel] : '—'} highlight />
        <ReviewRow label="Responsável pela análise" value={draft.responsibleName ?? '—'} />
      </ReviewSection>

      <Card>
        <Text style={styles.nextStepsTitle}>Próximos passos</Text>
        <Text style={styles.muted}>Após confirmar, a ocorrência será enviada para análise e fluxo de ações corretivas.</Text>
        <View style={styles.nextStepsGrid}>
          <NextStep done label="Todas as informações preenchidas" />
          <NextStep done={draft.evidences.length > 0} label="Evidências anexadas" />
          <NextStep done={!!(draft.rootCause && draft.immediateActions)} label="Análise realizada" />
          <NextStep done={false} label="Pronto para finalizar" />
        </View>
      </Card>
    </>
  );
}

// =====================================================================
// Pequenos helpers de UI
// =====================================================================

function SelectField({
  label,
  value,
  placeholder,
  leftIcon,
  options,
  onSelect,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  leftIcon: 'Tag' | 'MapPin' | 'User';
  options: ReadonlyArray<{ id: string; label: string }>;
  onSelect: (opt: { id: string; label: string }) => void;
}) {
  return (
    <Pressable
      onPress={() => Alert.alert(label, undefined, [
        { text: 'Cancelar', style: 'cancel' },
        ...options.map((opt) => ({ text: opt.label, onPress: () => onSelect(opt) })),
      ])}
    >
      <TextField
        label={label}
        leftIcon={leftIcon}
        rightIcon="ChevronDown"
        editable={false}
        value={value ?? ''}
        placeholder={placeholder}
      />
    </Pressable>
  );
}

function ChipPickerField({
  label,
  placeholder,
  leftIcon,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  leftIcon: 'Users' | 'Bookmark';
  items: string[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipPickerField}>
        <Icon name={leftIcon} size={16} color={theme.color.textMuted} />
        <View style={styles.chipPickerChips}>
          {items.length === 0 ? (
            <Text style={styles.chipPickerPlaceholder}>{placeholder}</Text>
          ) : (
            items.map((it, idx) => (
              <View key={idx} style={styles.chipItem}>
                <Text style={styles.chipItemText}>{it}</Text>
                <Pressable onPress={() => onRemove(idx)} hitSlop={6}>
                  <Icon name="X" size={12} color={theme.color.textMuted} />
                </Pressable>
              </View>
            ))
          )}
        </View>
        <Pressable onPress={onAdd} hitSlop={6}>
          <Icon name="Plus" size={16} color={theme.color.primary} />
        </Pressable>
      </View>
    </View>
  );
}

function EvBtn({ icon, label, onPress }: { icon: 'Camera' | 'Image' | 'Video' | 'Mic' | 'Paperclip'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.evBtn}>
      <View style={styles.evBtnIcon}>
        <Icon name={icon} size={20} color={theme.color.primary} />
      </View>
      <Text style={styles.evBtnLabel} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function EvidenceRow({ ev, onRemove }: { ev: OccurrenceEvidenceRef; onRemove: () => void }) {
  const kindLabel = ev.kind === 'video' ? 'Vídeo' : ev.kind === 'audio' ? 'Áudio' : ev.kind === 'document' ? 'Documento' : 'Foto';
  const kindTone = ev.kind === 'video' ? 'accent' : ev.kind === 'audio' ? 'orange' : ev.kind === 'document' ? 'warning' : 'success';
  return (
    <View style={styles.evRow}>
      <View style={[styles.evThumb]}>
        <Icon
          name={ev.kind === 'video' ? 'PlayCircle' : ev.kind === 'audio' ? 'Mic' : ev.kind === 'document' ? 'FileText' : 'Image'}
          size={26}
          color={theme.color.primary}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.evName} numberOfLines={1}>{ev.filename}</Text>
          <StatusPill label={kindLabel} tone={kindTone} />
        </View>
        <Text style={styles.evMeta}>{new Date(ev.takenAt).toLocaleString('pt-BR')}</Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={6}>
        <Icon name="Trash2" size={18} color={theme.color.dangerFg} />
      </Pressable>
    </View>
  );
}

function CheckboxRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.cbRow}>
      <View style={[styles.cbBox, checked && styles.cbBoxOn]}>
        {checked ? <Icon name="Check" size={14} color={theme.color.textOnPrimary} strokeWidth={3} /> : null}
      </View>
      <Text style={styles.cbLabel}>{label}</Text>
    </Pressable>
  );
}

function ReviewSection({
  title,
  children,
  onEdit,
  rightLabel,
  onRightPress,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
}) {
  return (
    <Card>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {rightLabel && onRightPress ? (
            <Pressable onPress={onRightPress} hitSlop={6}>
              <Text style={styles.reviewLink}>{rightLabel}</Text>
            </Pressable>
          ) : null}
          {onEdit ? (
            <Pressable onPress={onEdit} hitSlop={6}>
              <Text style={styles.reviewLink}>Editar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={{ marginTop: 6, gap: 4 }}>{children}</View>
    </Card>
  );
}

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text
        style={[styles.reviewValue, highlight && { color: theme.color.dangerFg, fontFamily: theme.fontFamily.semibold }]}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

function NextStep({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={styles.nsRow}>
      <Icon
        name={done ? 'CheckCircle2' : 'Circle'}
        size={18}
        color={done ? theme.color.successFg : theme.color.textSubtle}
      />
      <Text style={[styles.nsLabel, done && { color: theme.color.text }]}>{label}</Text>
    </View>
  );
}

// =====================================================================
// helpers data
// =====================================================================

function formatDateTimeInput(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ''; }
}

function parseDateTimeInput(v: string): string | null {
  const m = v.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const styles = StyleSheet.create({
  stepperWrap: {
    paddingVertical: 14,
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  content: { padding: theme.spacing[4], gap: theme.spacing[4], paddingBottom: theme.spacing[10] },
  twoCol: { flexDirection: 'row', gap: 10 },
  fieldLabel: {
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.color.text,
    marginBottom: 8,
  },
  muted: { fontSize: theme.fontSize.base, color: theme.color.textMuted, fontFamily: theme.fontFamily.regular },
  sectionTitle: { fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.semibold, color: theme.color.text, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  chipPickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
    minHeight: 48,
  },
  chipPickerChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipPickerPlaceholder: { color: theme.color.textSubtle, fontSize: theme.fontSize.md },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.primarySoft,
  },
  chipItemText: { fontSize: theme.fontSize.sm, color: theme.color.primary, fontFamily: theme.fontFamily.medium },
  evidenceButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evBtn: {
    width: '30%',
    flexGrow: 1,
    padding: 12,
    gap: 6,
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  evBtnIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.color.primarySoft, alignItems: 'center', justifyContent: 'center' },
  evBtnLabel: { fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.medium, color: theme.color.text, textAlign: 'center' },
  evRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  evThumb: {
    width: 56, height: 56,
    backgroundColor: theme.color.primarySoft,
    borderRadius: theme.radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  evName: { fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.semibold, color: theme.color.text },
  evMeta: { fontSize: theme.fontSize.sm, color: theme.color.textMuted },
  checkboxList: { gap: 10 },
  cbRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cbBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: theme.color.borderStrong, backgroundColor: theme.color.surface, alignItems: 'center', justifyContent: 'center' },
  cbBoxOn: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  cbLabel: { flex: 1, fontSize: theme.fontSize.md, color: theme.color.text, fontFamily: theme.fontFamily.regular },
  addLink: { marginTop: 8, fontSize: theme.fontSize.base, color: theme.color.primary, fontFamily: theme.fontFamily.semibold },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewTitle: { fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.semibold, color: theme.color.text },
  reviewLink: { fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.semibold, color: theme.color.primary },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  reviewLabel: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.medium, width: 120 },
  reviewValue: { flex: 1, fontSize: theme.fontSize.base, color: theme.color.text, fontFamily: theme.fontFamily.regular, textAlign: 'right' },
  reviewBody: { fontSize: theme.fontSize.base, color: theme.color.textBody, lineHeight: theme.lineHeight.base },
  evidenceThumbs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  thumb: { width: 60, height: 60, borderRadius: theme.radius.md, backgroundColor: theme.color.primarySoft, alignItems: 'center', justifyContent: 'center' },
  nextStepsTitle: { fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.semibold, color: theme.color.text },
  nextStepsGrid: { marginTop: 8, gap: 8 },
  nsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nsLabel: { fontSize: theme.fontSize.base, color: theme.color.textMuted, fontFamily: theme.fontFamily.regular },
});
