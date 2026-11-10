import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme';

const icon =
  (name) =>
  ({ color, size, focused }) => <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />;

// Abas principais do painel.
export default function TabsLayout() {
  const { state, activeAlerts } = useApp();
  const decided = new Set(state.decisions.map((d) => d.alertId));
  const pending = activeAlerts.filter((a) => !decided.has(a.id)).length;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Território Vivo', tabBarLabel: 'Painel', tabBarIcon: icon('grid') }}
      />
      <Tabs.Screen name="tendencias" options={{ title: 'Tendências', tabBarIcon: icon('bar-chart') }} />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas preditivos',
          tabBarLabel: 'Alertas',
          tabBarIcon: icon('notifications'),
          tabBarBadge: activeAlerts.length || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.riskHigh },
          tabBarAccessibilityLabel: `Alertas, ${activeAlerts.length} ativo(s)`,
        }}
      />
      <Tabs.Screen
        name="decisoes"
        options={{
          title: 'Decisões',
          tabBarIcon: icon('people'),
          tabBarBadge: pending || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent },
          tabBarAccessibilityLabel: `Decisões, ${pending} aguardando`,
        }}
      />
      <Tabs.Screen name="ajustes" options={{ title: 'Ajustes', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
