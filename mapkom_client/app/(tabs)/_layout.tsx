import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '@/lib/components/TabBar';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                tabBarHideOnKeyboard: true,
                headerShown: false,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.index'),
                    tabBarIcon: ({ focused, ...props }) => (
                        <MaterialCommunityIcons
                            name={focused ? 'map' : 'map-outline'}
                            focused={focused}
                            {...props}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: t('tabs.about'),
                    tabBarIcon: ({ focused, ...props }) => (
                        <MaterialCommunityIcons
                            name={
                                focused ? 'information' : 'information-outline'
                            }
                            focused={focused}
                            {...props}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
