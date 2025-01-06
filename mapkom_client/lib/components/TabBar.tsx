import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import React from 'react';
import { Pressable } from 'react-native';
import { BottomNavigation, TouchableRipple } from 'react-native-paper';

export default function TabBar(props: BottomTabBarProps) {
  return (
    <BottomNavigation.Bar
      shifting
      navigationState={props.state}
      safeAreaInsets={props.insets}
      onTabPress={({ route, preventDefault }) => {
        const event = props.navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        } else {
          props.navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: props.state.key,
          });
        }
      }}
      renderIcon={({ route, focused, color }) => {
        const { options } = props.descriptors[route.key];
        if (options.tabBarIcon) {
          return options.tabBarIcon({ focused, color, size: 24 });
        }

        return null;
      }}
      // fix for https://github.com/callstack/react-native-paper/issues/4401
      renderTouchable={({ key, ...props }) =>
        TouchableRipple.supported ? (
          <TouchableRipple key={key} {...props} />
        ) : (
          <Pressable key={key} {...(props as any)} />
        )
      }
      getLabelText={({ route }) => {
        const { options } = props.descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        return typeof label === 'string' ? label : undefined;
      }}
    />
  );
}
