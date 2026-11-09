import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme';

const icon =
  (name) =>
  ({ color, size, focused }) => <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />;

// Abas principais do painel.
export default function TabsLayout() {
  const { activeAlerts } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Território Vivo', tabBarLabel: 'Painel', tabBarIcon: icon('grid') }}
      />
      <Tabs.Screen
        name="tendencias"
        options={{ title: 'Tendências', tabBarIcon: icon('bar-chart') }}
      />
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
    </Tabs>
  );
}
