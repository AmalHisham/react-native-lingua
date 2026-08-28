import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors, fontFamilies } from "@/theme";

type AuthMode = "sign-up" | "sign-in";

type AuthScreenProps = {
  mode: AuthMode;
};

const authCopy = {
  "sign-up": {
    title: "Create your account",
    subtitle: "Start your language journey today",
    buttonLabel: "Sign Up",
    footerText: "Already have an account?",
    footerAction: "Log in",
    footerHref: "/sign-in",
  },
  "sign-in": {
    title: "Welcome back",
    subtitle: "Continue your language journey today",
    buttonLabel: "Sign In",
    footerText: "Don't have an account?",
    footerAction: "Sign up",
    footerHref: "/sign-up",
  },
} as const;

export function AuthScreen({ mode }: AuthScreenProps) {
  const navigation = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const copy = authCopy[mode];
  const showsPassword = mode === "sign-up";

  const openVerification = () => {
    setIsVerificationVisible(true);
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.back();
      return;
    }

    navigation.replace("/onboarding");
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 32,
          paddingHorizontal: 30,
          paddingTop: 26,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={goBack}
          className="h-12 w-12 items-start justify-center"
        >
          <Feather name="chevron-left" size={34} color={colors.neutral.textPrimary} />
        </TouchableOpacity>

        <View className="mt-12">
          <Text className="auth-hero__title">{copy.title}</Text>
          <Text className="auth-hero__subtitle mt-5">
            {copy.subtitle} <Text className="auth-hero__sparkle">{"\u2728"}</Text>
          </Text>
        </View>

        <View className="relative mt-7 h-[168px] items-center overflow-visible">
          <Text className="auth-sparkle auth-sparkle--orange absolute left-[74px] top-9">
            {"\u2726"}
          </Text>
          <Text className="auth-sparkle auth-sparkle--blue absolute right-[73px] top-11">
            {"\u2726"}
          </Text>
          <Text className="auth-sparkle auth-sparkle--yellow absolute right-[88px] top-[88px]">
            {"\u2726"}
          </Text>
          <Image
            source={images.mascotAuth}
            contentFit="contain"
            style={{ height: 186, width: 214 }}
          />
        </View>

        <View className={showsPassword ? "-mt-1 gap-4" : "mt-0 gap-4"}>
          <LabeledInput
            label="Email"
            placeholder="alex@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />

          {showsPassword ? (
            <LabeledInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={isPasswordHidden}
              textContentType="password"
              rightElement={
                <TouchableOpacity
                  activeOpacity={0.72}
                  onPress={() => setIsPasswordHidden((current) => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPasswordHidden ? "Show password" : "Hide password"
                  }
                  className="h-11 w-11 items-center justify-center"
                >
                  <Feather
                    name={isPasswordHidden ? "eye" : "eye-off"}
                    size={26}
                    color="#77819D"
                  />
                </TouchableOpacity>
              }
            />
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={openVerification}
          className="auth-primary-button mt-7 h-[66px] items-center justify-center"
        >
          <Text
            className="auth-primary-button__label"
            style={{
              textShadowColor: "rgba(13, 19, 43, 0.18)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 0,
            }}
          >
            {copy.buttonLabel}
          </Text>
        </TouchableOpacity>

        <View className="mt-9 flex-row items-center">
          <View className="h-px flex-1 bg-[#E8EAF2]" />
          <Text className="auth-divider__text px-5">or continue with</Text>
          <View className="h-px flex-1 bg-[#E8EAF2]" />
        </View>

        <View className="mt-5 gap-3">
          <SocialButton provider="Google" icon="google" />
          <SocialButton provider="Facebook" icon="facebook" />
          <SocialButton provider="Apple" icon="apple" />
        </View>

        <View className="flex-1" />

        <View className="mt-12 flex-row items-center justify-center">
          <Text className="auth-footer__text">{copy.footerText} </Text>
          <TouchableOpacity
            activeOpacity={0.72}
            onPress={() => navigation.replace(copy.footerHref)}
          >
            <Text className="auth-footer__link">{copy.footerAction}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <VerificationModal
        visible={isVerificationVisible}
        onClose={() => setIsVerificationVisible(false)}
      />
    </SafeAreaView>
  );
}

type LabeledInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  textContentType?: "emailAddress" | "password";
  rightElement?: ReactNode;
};

function LabeledInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
  textContentType,
  rightElement,
}: LabeledInputProps) {
  return (
    <View className="auth-input h-[82px] flex-row items-center px-5">
      <View className="flex-1 justify-center">
        <Text className="auth-input__label">{label}</Text>
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#A8B0C5"
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          textContentType={textContentType}
          underlineColorAndroid="transparent"
          style={{
            color: colors.neutral.textPrimary,
            fontFamily: fontFamilies.medium,
            fontSize: 18,
            lineHeight: 26,
            margin: 0,
            padding: 0,
          }}
        />
      </View>
      {rightElement}
    </View>
  );
}

type SocialButtonProps = {
  provider: "Google" | "Facebook" | "Apple";
  icon: "google" | "facebook" | "apple";
};

function SocialButton({ provider, icon }: SocialButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="auth-social-button h-[61px] flex-row items-center justify-center px-5"
    >
      <View className="h-9 w-9 items-center justify-center">
        {icon === "google" ? (
          <AntDesign name="google" size={28} color="#4285F4" />
        ) : null}
        {icon === "facebook" ? (
          <FontAwesome name="facebook" size={32} color="#1877F2" />
        ) : null}
        {icon === "apple" ? (
          <FontAwesome name="apple" size={32} color={colors.neutral.textPrimary} />
        ) : null}
      </View>
      <Text numberOfLines={1} className="auth-social-button__label ml-4">Continue with {provider}</Text>
    </TouchableOpacity>
  );
}

type VerificationModalProps = {
  visible: boolean;
  onClose: () => void;
};

function VerificationModal({ visible, onClose }: VerificationModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const digits = Array.from({ length: 6 }, (_, index) => code[index] ?? "");

  useEffect(() => {
    if (!visible) {
      setCode("");
      return;
    }

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 220);

    return () => clearTimeout(focusTimer);
  }, [visible]);

  const handleChangeCode = (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setCode(nextCode);

    if (nextCode.length === 6) {
      onClose();
      router.replace("/");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleChangeCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={6}
                caretHidden
                accessibilityLabel="Verification code"
                accessibilityHint="Enter the six digit code from your email"
                underlineColorAndroid="transparent"
                style={{
                  color: "transparent",
                  bottom: 0,
                  left: 0,
                  opacity: 0,
                  position: "absolute",
                  right: 0,
                  top: 0,
                }}
              />
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleChangeCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={6}
                caretHidden
                underlineColorAndroid="transparent"
                style={{
                  color: "transparent",
                  height: 1,
                  opacity: 0,
                  position: "absolute",
                  width: 1,
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.76}
              onPress={onClose}
              className="mt-6 h-12 items-center justify-center"
            >
              <Text className="auth-modal__cancel">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
