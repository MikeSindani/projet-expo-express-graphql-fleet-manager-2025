import Header from '@/components/Header';
import SideBar from '@/components/SideBar';
import React, { ReactNode } from 'react';
import { Platform, View } from 'react-native';

interface WebLayoutProps {
  children: ReactNode;
}

/**
 * WebLayout - Layout wrapper for web platform
 * 
 * On web: Displays Header + Sidebar + Content
 * On mobile: Transparent wrapper (children only)
 */
export default function WebLayout({ children }: WebLayoutProps) {
  // On mobile, just return children without any wrapper
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // On web, show full layout with header and sidebar
  return (
    <View className="flex-1 flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <View className="flex-1 flex-row overflow-hidden">
        <SideBar />
        <View className="flex-1 overflow-y-auto">
          {children}
        </View>
      </View>
    </View>
  );
}
