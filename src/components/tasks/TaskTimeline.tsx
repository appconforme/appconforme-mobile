/**
 * Timeline visual de eventos da tarefa — pixel-perfect ao mockup
 * `Tarefa - Histórico.png`. Agrupa por dia (Hoje / Ontem / data) e
 * desenha bullets coloridos com linha conectora.
 */
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { TASK_EVENT_ACTION_LABEL, type TaskEvent } from '@/lib/tasks/types';

interface Props {
  events: TaskEvent[];
}

function actionVisual(action: string): { icon: IconName; tone: string; bg: string } {
  if (action.includes('started'))  return { icon: 'PlayCircle',    tone: theme.color.primary,    bg: theme.color.primarySoft };
  if (action.includes('submitted')) return { icon: 'Send',          tone: theme.color.warningFg,  bg: theme.color.warningBg };
  if (action.includes('approved'))  return { icon: 'CheckCircle2', tone: theme.color.successFg,  bg: theme.color.successBg };
  if (action.includes('rejected'))  return { icon: 'AlertCircle',  tone: theme.color.dangerFg,   bg: theme.color.dangerBg };
  if (action.includes('cancelled')) return { icon: 'XCircle',       tone: theme.color.neutralFg,  bg: theme.color.neutralBg };
  if (action.includes('assigned'))  return { icon: 'UserPlus',      tone: theme.color.accentFg,   bg: theme.color.accentBg };
  if (action.includes('created'))   return { icon: 'PlusCircle',    tone: theme.color.primary,    bg: theme.color.primarySoft };
  return { icon: 'Activity', tone: theme.color.textMuted, bg: theme.color.neutralBg };
}

function bucketKey(iso: string): string {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const dayMs = d.getTime() - new Date(today).setHours(0,0,0,0);
  if (dayMs >= 0)        return 'Hoje';
  if (dayMs >= -86400000) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function TaskTimeline({ events }: Props) {
  const sorted = [...events].sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt));
  // group
  const groups = new Map<string, TaskEvent[]>();
  for (const ev of sorted) {
    const k = bucketKey(ev.occurredAt);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(ev);
  }
  return (
    <View style={{ gap: theme.spacing[3] }}>
      {Array.from(groups.entries()).map(([day, items]) => (
        <View key={day} style={{ gap: 8 }}>
          <Text style={styles.dayLabel}>{day}</Text>
          <View style={styles.list}>
            {items.map((ev, i) => {
              const v = actionVisual(ev.action);
              const isLast = i === items.length - 1;
              return (
                <View key={ev.id} style={styles.row}>
                  <View style={styles.gutter}>
                    <View style={[styles.bullet, { backgroundColor: v.bg }]}>
                      <Icon name={v.icon} size={14} color={v.tone} strokeWidth={2.2} />
                    </View>
                    {!isLast ? <View style={styles.line} /> : null}
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.action}>{TASK_EVENT_ACTION_LABEL[ev.action] ?? ev.action}</Text>
                    <Text style={styles.meta}>
                      {ev.actor?.name ?? 'Sistema'} · {timeLabel(ev.occurredAt)}
                    </Text>
                    {ev.reason ? <Text style={styles.reason}>“{ev.reason}”</Text> : null}
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
  dayLabel: {
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.semibold,
    color: theme.color.textMuted,
  },
  list: { gap: 0 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  gutter: { width: 28, alignItems: 'center' },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.color.border,
    marginTop: 4,
  },
  body: { flex: 1, gap: 2, paddingBottom: 8 },
  action: { fontSize: theme.fontSize.md, fontFamily: theme.fontFamily.semibold, color: theme.color.text },
  meta:   { fontSize: theme.fontSize.sm, color: theme.color.textMuted, fontFamily: theme.fontFamily.regular },
  reason: { fontSize: theme.fontSize.base, color: theme.color.textBody, fontStyle: 'italic', marginTop: 2 },
});
