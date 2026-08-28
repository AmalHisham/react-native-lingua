import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/theme";

export default function OnboardingScreen() {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <StatusBar style="dark" />
      <View className="flex-1 px-10 pb-8 pt-6">
        <View className="flex-row items-center justify-center">
          <Image
            source={images.mascotLogo}
            contentFit="contain"
            style={{ height: 56, width: 56 }}
          />
          <Text className="onboarding-brand__name ml-3">lingua</Text>
        </View>

        <View className="mt-12">
          <Text className="onboarding-hero__title">
            Your AI language{"\n"}
            <Text className="onboarding-hero__title-accent">teacher</Text>.
          </Text>
          <Text className="onboarding-hero__copy mt-4">
            Real conversations, personalized{"\n"}lessons, anytime, anywhere.
          </Text>
        </View>

        <View className="relative mt-2 flex-1 items-center justify-end">
          <View className="onboarding-speech absolute left-0 top-10 bg-[#eef8ff] px-5 py-3">
            <Text className="onboarding-speech__text">Hello!</Text>
          </View>
          <View className="onboarding-speech absolute right-0 top-0 bg-[#f6f5ff] px-5 py-3">
            <Text className="onboarding-speech__text--purple">{"\u00a1Hola!"}</Text>
          </View>
          <View className="onboarding-speech absolute right-0 top-28 bg-[#fff3ef] px-5 py-3">
            <Text className="onboarding-speech__text--coral">{"\u4f60\u597d!"}</Text>
          </View>

          <Image
            source={images.mascotWelcome}
            contentFit="contain"
            style={{ height: 360, width: 360 }}
          />
        </View>

        <Link href="/sign-up" asChild>
          <TouchableOpacity
            activeOpacity={0.88}
            className="onboarding-cta mt-7 h-[72px] flex-row items-center justify-center px-7"
          >
            <Text className="onboarding-cta__label">Get Started</Text>
            <Feather
              name="chevron-right"
              size={34}
              color={colors.neutral.background}
              className="absolute right-7"
            />
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
