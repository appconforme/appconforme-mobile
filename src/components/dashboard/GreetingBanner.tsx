import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Button } from '@/components/ui/button';
import { RingProgress } from '@/components/ui/ring-progress';

interface Props {
  name: string;
  pendingTasks: number;
  conformidadePct: number;     // 0..1
  onPressViewTasks: () => void;
  emptyVariant?: boolean;       // sem KPIs (tela sem dados)
}

export function GreetingBanner({
  name,
  pendingTasks,
  conformidadePct,
  onPressViewTasks,
  emptyVariant,
}: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <LinearGradient
      colors={[theme.raw.blue700, theme.raw.blue600]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.left}>
        <Text style={styles.greet}>
          {greeting}, {name}! <Text style={{ fontSize: theme.fontSize.xl }}>👋</Text>
        </Text>
        {emptyVariant ? (
          <Text style={styles.sub}>Vamos manter tudo em conformidade hoje.</Text>
        ) : (
          <>
            <Text style={styles.headline}>Tudo certo para hoje?</Text>
            <Text style={styles.sub}>
              Você tem {pendingTasks} {pendingTasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'}.
            </Text>
            <View style={{ marginTop: theme.spacing[3] }}>
              <Button
                label="Ver minhas tarefas"
                variant="secondary"
                size="sm"
                leftIcon="ListChecks"
                onPress={onPressViewTasks}
                style={styles.cta}
              />
            </View>
          </>
        )}
      </View>

      {!emptyVariant ? (
        <View style={styles.right}>
          <RingProgress
            value={conformidadePct}
            size={92}
            strokeWidth={9}
            color={theme.color.surface}
            trackColor="rgba(255,255,255,0.22)"
          />
          <Text style={styles.ringCaption} numberOfLines={2}>
            Conformidade{'\n'}geral da unidade
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  left: { flex: 1, gap: 2 },
  right: { alignItems: 'center', gap: 6, maxWidth: 110 },
  greet: {
    fontSize: theme.fontSize.lg,
    color: theme.color.textOnPrimary,
    fontFamily: theme.fontFamily.semibold,
  },
  headline: {
    marginTop: 2,
    fontSize: theme.fontSize['2xl'],
    color: theme.color.textOnPrimary,
    fontFamily: theme.fontFamily.bold,
    lineHeight: theme.lineHeight['2xl'],
  },
  sub: {
    marginTop: 2,
    fontSize: theme.fontSize.base,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: theme.fontFamily.regular,
  },
  cta: {
    alignSelf: 'flex-start',
  },
  ringCaption: {
    fontSize: theme.fontSize.xs,
    color: theme.color.textOnPrimary,
    fontFamily: theme.fontFamily.medium,
    textAlign: 'center',
    opacity: 0.95,
  },
});
