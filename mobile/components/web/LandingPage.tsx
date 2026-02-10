import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import {
  ChevronRight,
  ClipboardList,
  Download,
  LayoutDashboard,
  Shield,
  Smartphone,
  Truck,
  Users
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function LandingPage() {
    const router = useRouter();
    const { isDark } = useTheme();

    const features = [
        {
            icon: LayoutDashboard,
            title: "Performance Optimisée",
            description: "Un tableau de bord intelligent qui centralise toutes vos données clés pour une prise de décision rapide.",
            color: "#3B82F6"
        },
        {
            icon: Truck,
            title: "Gestion de Flotte",
            description: "Suivez chaque véhicule, gérez la maintenance et optimisez la consommation de carburant en temps réel.",
            color: "#10B981"
        },
        {
            icon: Users,
            title: "Suivi des Chauffeurs",
            description: "Gérez les profils, les licences et les affectations de vos chauffeurs de manière fluide et intuitive.",
            color: "#F59E0B"
        },
        {
            icon: ClipboardList,
            title: "Rapports Détaillés",
            description: "Générez des rapports complets en un clic pour une transparence totale sur vos activités.",
            color: "#6366F1"
        },
        {
            icon: Shield,
            title: "Sécurité & Conformité",
            description: "Assurez la conformité réglementaire et la sécurité de vos données avec nos protocoles avancés.",
            color: "#EF4444"
        }
    ];

    const stats = [
        { value: "500+", label: "Véhicules Gérés" },
        { value: "98%", label: "Taux de Satisfaction" },
        { value: "24/7", label: "Support Dédié" },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Navbar */}
                <BlurView intensity={isDark ? 50 : 80} className="w-full px-6 lg:px-20 py-5 flex-row justify-between items-center absolute top-0 z-50">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/30">
                            <Truck size={24} color="white" />
                        </View>
                        <Text className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Fleet<Text className="text-blue-600">Manager</Text>
                        </Text>
                    </View>
                    <View className="flex-row gap-6 items-center">
                        <TouchableOpacity onPress={() => router.push('/auth/login' as Href)}>
                            <Text className="font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Connexion</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => router.push('/auth/register' as Href)}
                            className="bg-blue-600 px-7 py-2.5 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                        >
                            <Text className="font-bold text-white">S'inscrire</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>

                {/* Hero Section */}
                <View className="pt-40 pb-20 px-6 lg:px-20 items-center overflow-hidden">
                    {/* Background Gradients */}
                    <View className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-10 pointer-events-none">
                         <LinearGradient
                            colors={['#3B82F6', '#60A5FA', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ position: 'absolute', width: 800, height: 800, top: -200, left: -200, borderRadius: 400 }}
                         />
                    </View>

                    <View className="max-w-4xl w-full items-center z-10">
                        <View className="bg-blue-100 dark:bg-blue-900/30 px-5 py-1.5 rounded-full mb-8">
                            <Text className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">Logiciel de gestion de flotte v2.0</Text>
                        </View>

                        <Text className="text-5xl lg:text-8xl font-black text-gray-900 dark:text-white text-center leading-[1.1] mb-8 tracking-tighter">
                            Gérez votre flotte avec <Text className="text-blue-600">intelligence.</Text>
                        </Text>
                        
                        <Text className="text-xl text-gray-500 dark:text-gray-400 text-center mb-12 max-w-2xl leading-relaxed font-medium">
                            La plateforme moderne pour optimiser vos opérations, suivre vos actifs en temps réel et booster votre rentabilité.
                        </Text>

                        <View className="flex-row flex-wrap gap-4 justify-center">
                            <TouchableOpacity 
                                onPress={() => router.push('/auth/register' as Href)}
                                className="bg-blue-600 px-10 py-5 rounded-3xl shadow-2xl shadow-blue-500/40 flex-row items-center gap-3 active:scale-95 transition-all"
                            >
                                <Text className="text-white font-black text-lg">Commencer Gratuitement</Text>
                                <ChevronRight size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {}}
                                className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 px-10 py-5 rounded-3xl flex-row items-center gap-3 active:scale-95 transition-all"
                            >
                                <Download size={22} color={isDark ? "white" : "#1F2937"} />
                                <Text className="text-gray-900 dark:text-white font-black text-lg">Télécharger l'App</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View className="max-w-6xl mx-auto w-full mb-32 px-6">
                    <View className="flex-row flex-wrap justify-between bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 gap-10">
                        {stats.map((stat, idx) => (
                            <View key={idx} className="flex-1 min-w-[200px] items-center">
                                <Text className="text-5xl font-black text-blue-600 mb-2 tracking-tighter">{stat.value}</Text>
                                <Text className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Detailed Features Section */}
                <View className="py-24 px-6 lg:px-20 bg-gray-50/50 dark:bg-gray-900/50">
                    <View className="max-w-7xl mx-auto">
                        <View className="items-center mb-24">
                            <Text className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Pourquoi nous choisir ?</Text>
                            <Text className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white text-center tracking-tighter">Conçu pour la croissance</Text>
                        </View>

                        <View className="flex-row flex-wrap gap-10 justify-center">
                            {features.map((feature, idx) => {
                                const Icon = feature.icon;
                                return (
                                    <View key={idx} className="w-full md:w-[380px] bg-white dark:bg-gray-950 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all">
                                        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-8" style={{ backgroundColor: feature.color + '20' }}>
                                           <Icon size={32} color={feature.color} />
                                        </View>
                                        <Text className="text-2xl font-black text-gray-950 dark:text-white mb-4 tracking-tight">{feature.title}</Text>
                                        <Text className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-lg">{feature.description}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </View>

                {/* Download App Section */}
                <View className="py-32 px-6 lg:px-20 bg-white dark:bg-gray-950">
                    <View className="max-w-7xl mx-auto bg-gray-950 dark:bg-gray-900 rounded-[50px] p-12 lg:p-24 overflow-hidden relative">
                        <View className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <View className="lg:flex-row items-center gap-20 z-10">
                            <View className="flex-1">
                                <View className="bg-blue-600/20 self-start px-4 py-1.5 rounded-full mb-8">
                                    <Text className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Connectivité Totale</Text>
                                </View>
                                <Text className="text-4xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
                                    Emportez votre flotte <Text className="text-blue-500">dans votre poche.</Text>
                                </Text>
                                <Text className="text-gray-400 text-xl mb-12 leading-relaxed">
                                    Restez informé où que vous soyez. Recevez des alertes instantanées, validez des rapports et communiquez avec vos chauffeurs en temps réel.
                                </Text>

                                <View className="flex-row flex-wrap gap-5">
                                    <TouchableOpacity className="bg-white px-8 py-4 rounded-2xl flex-row items-center gap-3 active:scale-95 transition-all">
                                        <Smartphone size={24} color="#000" />
                                        <View>
                                            <Text className="text-[10px] font-bold text-gray-500 uppercase">Disponible sur</Text>
                                            <Text className="text-lg font-black text-gray-950">App Store</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="bg-gray-800 border border-gray-700 px-8 py-4 rounded-2xl flex-row items-center gap-3 active:scale-95 transition-all">
                                        <Smartphone size={24} color="#FFF" />
                                        <View>
                                            <Text className="text-[10px] font-bold text-gray-400 uppercase">Disponible sur</Text>
                                            <Text className="text-lg font-black text-white">Google Play</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-1 items-center justify-center relative mt-20 lg:mt-0">
                                <View className="w-[280px] h-[580px] bg-gray-900 border-[10px] border-gray-800 rounded-[50px] shadow-2xl overflow-hidden">
                                     {/* Mobile App Mockup Content */}
                                     <View className="flex-1 bg-gray-950 p-6 pt-12">
                                         <View className="flex-row justify-between items-center mb-8">
                                             <View>
                                                 <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Résumé</Text>
                                                 <Text className="text-white text-2xl font-black">Tableau</Text>
                                             </View>
                                             <View className="w-12 h-12 rounded-full bg-blue-600/30 items-center justify-center">
                                                 <Truck size={20} color="#3B82F6" />
                                             </View>
                                         </View>
                                         <View className="h-40 bg-gray-800/50 rounded-3xl mb-4 border border-white/5 p-4 justify-end">
                                             <View className="h-2 w-3/4 bg-blue-600 rounded-full mb-2" />
                                             <View className="h-2 w-1/2 bg-gray-700 rounded-full" />
                                         </View>
                                         <View className="flex-row gap-4 mb-4">
                                             <View className="flex-1 h-32 bg-gray-800/50 rounded-3xl border border-white/5" />
                                             <View className="flex-1 h-32 bg-gray-800/50 rounded-3xl border border-white/5" />
                                         </View>
                                         <View className="h-20 bg-blue-600/20 rounded-3xl border border-blue-500/20" />
                                     </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View className="py-24 px-6 lg:px-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
                    <View className="max-w-7xl mx-auto">
                        <View className="flex-col lg:flex-row justify-between items-start gap-16 mb-20">
                            <View className="max-w-xs">
                                <View className="flex-row items-center gap-3 mb-6">
                                    <View className="w-8 h-8 rounded-xl bg-blue-600 items-center justify-center">
                                        <Truck size={18} color="white" />
                                    </View>
                                    <Text className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                        Fleet<Text className="text-blue-600">Manager</Text>
                                    </Text>
                                </View>
                                <Text className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                    La solution leader pour la gestion de flotte simplifiée et intelligente.
                                </Text>
                            </View>

                            <View className="flex-row flex-wrap gap-20">
                                <View>
                                    <Text className="text-gray-900 dark:text-white font-black uppercase text-xs tracking-widest mb-8">Produit</Text>
                                    {['Fonctionnalités', 'Tarifs', 'Sécurité', 'Mobile'].map((item, i) => (
                                        <Text key={i} className="text-gray-500 dark:text-gray-400 font-bold mb-4 hover:text-blue-600 cursor-pointer">{item}</Text>
                                    ))}
                                </View>
                                <View>
                                    <Text className="text-gray-900 dark:text-white font-black uppercase text-xs tracking-widest mb-8">Compagnie</Text>
                                    {['À Propos', 'Blog', 'Carrières', 'Contact'].map((item, i) => (
                                        <Text key={i} className="text-gray-500 dark:text-gray-400 font-bold mb-4 hover:text-blue-600 cursor-pointer">{item}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                        
                        <View className="flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-100 dark:border-gray-900 gap-6">
                            <Text className="text-gray-400 dark:text-gray-600 font-bold">© 2025 FleetManager. Tous droits réservés.</Text>
                            <View className="flex-row gap-8">
                                {['Confidentialité', 'Conditions', 'Cookies'].map((item, i) => (
                                    <Text key={i} className="text-gray-400 dark:text-gray-600 font-bold hover:text-blue-600 cursor-pointer">{item}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
