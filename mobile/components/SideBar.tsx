import { darkTheme, lightTheme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname, useRouter } from "expo-router";
import {
    BarChart3,
    Car,
    ChevronDown,
    FileText,
    FolderOpen,
    LogOut,
    Plus,
    UserCircle,
    Users
} from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  hidden?: boolean;
}

interface NavGroup {
  name: string;
  icon: any;
  items: NavItem[];
  hidden?: boolean;
}

export default function SideBar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { isDark } = useTheme();
  const user = auth?.user;
  const role = user?.role?.trim().toUpperCase();
  const isChauffeur = role === "CHAUFFEUR";
  const router = useRouter();

  const activeColors = isDark ? darkTheme : lightTheme;

  // State for collapsible groups
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    gestion: true,
    actions: false,
  });

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Single navigation items (not in groups)
  const singleNavItems: NavItem[] = [
    { name: "Tableau de bord", path: "/(tabs)", icon: BarChart3 },
  ];

  // Grouped navigation items
  const navGroups: NavGroup[] = [
    {
      name: "Gestion",
      icon: FolderOpen,
      items: [
        { name: "Chauffeurs", path: "/(tabs)/drivers", icon: Users, hidden: isChauffeur },
        { name: "Véhicules", path: "/(tabs)/vehicles", icon: Car },
        { name: "Rapports", path: "/(tabs)/rapports", icon: FileText },
      ],
    },
    ...(Platform.OS === 'web' ? [{
      name: "Actions Rapides",
      icon: Plus,
      items: [
        { name: "Ajouter Chauffeur", path: "/add-driver", icon: Users, hidden: isChauffeur },
        { name: "Ajouter Véhicule", path: "/add-vehicle", icon: Car, hidden: isChauffeur },
        { name: "Nouveau Rapport", path: "/add-report", icon: FileText },
      ],
    }] : []),
  ];

  // Bottom navigation items
  const bottomNavItems: NavItem[] = [
    { name: "Profil", path: "/(tabs)/profile", icon: UserCircle },
  ];

  const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
    if (item.hidden) return null;

    const isActive = pathname === item.path || (item.path === "/(tabs)" && pathname === "/");
    const Icon = item.icon;

    return (
      <TouchableOpacity
        key={item.path}
        onPress={() => router.push(item.path as any)}
        className={`flex-row items-center gap-3 rounded-xl transition-all ${
          isSubItem ? 'pl-11 pr-3 py-2.5' : 'p-3'
        } ${
          isActive 
            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600" 
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`}
      >
        <Icon 
          size={isSubItem ? 18 : 20} 
          color={isActive ? "#3b82f6" : activeColors.text.primary} 
        />
        <Text 
          className={`font-semibold text-sm ${
            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderNavGroup = (group: NavGroup, groupKey: string) => {
    if (group.hidden) return null;

    const visibleItems = group.items.filter(item => !item.hidden);
    if (visibleItems.length === 0) return null;

    const isExpanded = expandedGroups[groupKey];
    const GroupIcon = group.icon;

    return (
      <View key={groupKey} className="mb-1">
        <TouchableOpacity
          onPress={() => toggleGroup(groupKey)}
          className="flex-row items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
        >
          <View className="flex-row items-center gap-3">
            <GroupIcon size={20} color={activeColors.text.primary} />
            <Text className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              {group.name}
            </Text>
          </View>
          <ChevronDown 
            size={16} 
            color={activeColors.text.secondary}
            style={{ 
              transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }],
              transition: 'transform 0.2s'
            }}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="mt-1 space-y-0.5">
            {visibleItems.map(item => renderNavItem(item, true))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="hidden md:flex w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col">
      {/* Header */}
      <View className="p-6 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 items-center justify-center shadow-lg shadow-blue-500/30">
            <Text className="text-white font-bold text-xl">F</Text>
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Fleet Manager</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Pro Edition</Text>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View className="flex-1 p-4 overflow-y-auto">
        {/* Single items */}
        <View className="mb-6 space-y-1">
          {singleNavItems.map(item => renderNavItem(item))}
        </View>

        {/* Grouped items */}
        <View className="mb-6">
          {navGroups.map((group, index) => 
            renderNavGroup(group, Object.keys(expandedGroups)[index])
          )}
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

        {/* Bottom items */}
        <View className="space-y-1">
          {bottomNavItems.map(item => renderNavItem(item))}
        </View>
      </View>

      {/* Logout */}
      <View className="p-4 border-t border-gray-100 dark:border-gray-800">
        <TouchableOpacity 
          onPress={() => auth?.signOut()}
          className="flex-row items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20 border border-red-100 dark:border-red-900/20 active:scale-95 transition-all shadow-sm"
        >
          <View className="w-9 h-9 rounded-xl bg-red-600 items-center justify-center shadow-md shadow-red-500/30">
            <LogOut size={18} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-red-700 dark:text-red-400 font-bold text-sm">Déconnexion</Text>
            <Text className="text-red-600/70 dark:text-red-400/70 text-xs">{user?.name}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
