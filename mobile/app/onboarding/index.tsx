import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { ClipboardList, ShieldCheck, Truck, Users } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Fleet Manager',
    description: 'Manage your entire fleet efficiently from one central dashboard.',
    icon: <Truck size={100} color="#ffffff" />,
  },
  {
    id: '2',
    title: 'Track Vehicles',
    description: 'Keep track of all your vehicles, their status, and maintenance schedules.',
    icon: <ClipboardList size={100} color="#ffffff" />,
  },
  {
    id: '3',
    title: 'Manage Drivers',
    description: 'Assign drivers to vehicles and monitor their performance and schedules.',
    icon: <Users size={100} color="#ffffff" />,
  },
  {
    id: '4',
    title: 'Secure & Reliable',
    description: 'Your data is secure with us. Access your fleet information anytime, anywhere.',
    icon: <ShieldCheck size={100} color="#ffffff" />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/auth/phone-login' as Href);
    }
  };

  const skip = () => {
    router.push('/auth/phone-login' as Href);
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/fleet-background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
        <LinearGradient
          colors={['rgba(30, 58, 138, 0.7)', 'rgba(59, 130, 246, 0.5)', 'rgba(96, 165, 250, 0.3)']}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView className="flex-1">
            <View className="flex-1">
              <FlatList
                data={slides}
                renderItem={({ item }) => (
                  <View className="items-center justify-center" style={{ width }}>
                    <View className="flex-0.7 justify-center items-center mb-10">
                       <View className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center mb-8 shadow-lg border-2 border-white/30">
                          {item.icon}
                       </View>
                      <Text className="text-3xl font-bold text-center text-white mb-4 px-8 drop-shadow-lg">
                        {item.title}
                      </Text>
                      <Text className="text-lg text-center text-white/95 px-10 leading-6 drop-shadow">
                        {item.description}
                      </Text>
                    </View>
                  </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={32}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
              />

              <View className="flex-row justify-center h-16">
                {slides.map((_, i) => {
                  const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                  const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 20, 10],
                    extrapolate: 'clamp',
                  });
                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={i.toString()}
                      style={{ width: dotWidth, opacity }}
                      className="h-2.5 rounded-full bg-white mx-1 shadow-md"
                    />
                  );
                })}
              </View>

              <View className="px-6 pb-8 space-y-4">
                <TouchableOpacity onPress={scrollTo} className="w-full shadow-xl">
                  <LinearGradient
                    colors={['#ffffff', '#f0f9ff']}
                    className="w-full py-4 rounded-xl items-center"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text className="text-blue-600 font-bold text-lg tracking-wide">
                      {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {currentIndex < slides.length - 1 && (
                   <TouchableOpacity onPress={skip} className="w-full py-3 items-center">
                      <Text className="text-white/90 font-semibold text-base drop-shadow">Skip</Text>
                   </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </BlurView>
    </ImageBackground>
  );
}

