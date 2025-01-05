import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MapFabStackProps {
  children: React.ReactNode;
}

export default function MapFabStack({ children }: MapFabStackProps) {
  return <View style={styles.fabStack}>{children}</View>;
}

const styles = StyleSheet.create({
  fabStack: {
    gap: 16,
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
