/**
 * Timeline pixel-perfect ao mockup `Tarefa - Histórico.png`.
 * Eventos agrupados por dia ("Hoje", "Ontem", "DD/MM/YYYY").
 */
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { type TaskEvent, TASK_EVENT_ACTION_LABEL } from '@/lib/tasks/types';

interface Props {
  events: ReadonlyArray<TaskEvent>;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, today)) return `Hoje · ${d.toLocaleDateString('pt-BR')}`;
  if (same(d, yesterday)) return `Ontem · ${d.toLocaleDateString('pt-BR')}`;
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function hourLabel(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function eventIcon(action: string): { icon: IconName; tone: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral' } {
  if (action.includes('approved'))  return { icon: 'CheckCircle2', tone: 'success' };
  if (action.includes('rejected'))  return { icon: 'XCircle',       tone: 'danger' };
  if (action.includes('started'))   return { icon: 'PlayCircle',    tone: 'primary' };
  if (action.includes('submitted')) return { icon: 'Send',          tone: 'accent' };
  if (action.includes('cancelled')) return { icon: 'Ban',           tone: 'neutral' };
  if (action.includes('created'))   return { icon: 'Plus',          tone: 'primary' };
  if (action.includes('assigned'))  return { icon: 'UserCheck',     tone: 'accent' };
  if (action.includes('updated'))   return { icon: 'Pencil',        tone: 'warning' };
  return { icon: 'Circle', tone: 'neutral' };
}

const TONE_BG = {
  primary: { bg: theme.color.primarySoft, fg: theme.color.primary },
  success: { bg: theme.color.successBg,  fg: theme.color.successFg },
  warning: { bg: theme.color.warningBg,  fg: theme.color.warningFg },
  danger:  { bg: theme.color.dangerBg,   fg: theme.color.dangerFg },
  accent:  { bg: theme.color.accentBg,   fg: theme.color.accentFg },
  neutral: { bg: theme.color.neutralBg,  fg: theme.color.neutralFg },
} as const;

export function TaskHistoryTimeline({ events }: Props) {
  // Agrupa por dia preservando ordem original (que já vem do mais novo).
  const groups = new Map<string, TaskEvent[]>();
  for (const ev of events) {
    const key = dayLabel(ev.occurredAt);
    const arr = groups.get(key) ?? [];
    arr.push(ev);
    groups.set(key, arr);
  }

  return (
    <View style={{ gap: 16 }}>
      {Array.from(groups.entries()).map(([day, items]) => (
        <View key={day} style={{ gap: 8 }}>
          <Text style={styles.dayHeader}>{day}</Text>
          <View style={styles.list}>
            {items.map((ev, i) => {
              const { icon, tone } = eventIcon(ev.action);
              const t = TONE_BG[tone];
              const label = TASK_EVENT_ACTION_LABEL[ev.action] ?? ev.action;
              const last = i === items.length - 1;
              return (
                <View key={ev.id} style={styles.row}>
                  <View style={styles.gutter}>
                    <View style={[styles.dot, { backgroundColor: t.bg }]}>
                      <Icon name={icon} size={14} color={t.fg} strokeWidth={2.4} />
                    </View>
                    {!last ? <View style={styles.line} /> : null}
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.action}>{label}</Text>
                    <Text style={styles.meta}>
                      {ev.actor?.name ?? 'Sistema'} · {hourLabel(ev.occurredAt)}
                    </Text>
                    {ev.reason ? (
                      <Text style={styles.reason}>“{ev.reason}”</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dayHeader: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semibold,
    color: theme.color.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: { gap: 0 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  gutter: { width: 26, alignItems: 'center' },
  dot: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  line: {
    flex: 1, minHeight: 18,
    width: 2, backgroundColor: theme.color.border, marginTop: 2,
  },
  body: { flex: 1, paddingBottom: 14, gap: 2 },
  action: { fontSize: theme.fontSize.md, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  meta:   { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.regular },
  reason: {
    fontSize: theme.fontSize.base, color: theme.color.textBody,
    fontStyle: 'italic', marginTop: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: theme.color.bgSubtle, borderRadius: theme.radius.sm,
  },
});
