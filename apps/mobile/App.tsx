import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { APP_NAME } from '@jlt/constants';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {APP_NAME} Mobile App!</Text>
      <Text style={styles.subtitle}>Powered by Expo React Native in a PNPM Monorepo</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
