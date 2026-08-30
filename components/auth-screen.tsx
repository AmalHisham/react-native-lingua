import { useSignIn, useSignUp } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Alert,
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

type SocialProvider = "Google" | "Facebook" | "Apple";
type SocialIcon = "google" | "facebook" | "apple";
type SocialStrategy = "oauth_google" | "oauth_facebook" | "oauth_apple";

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

const socialStrategies: Record<SocialProvider, SocialStrategy> = {
  Apple: "oauth_apple",
  Facebook: "oauth_facebook",
  Google: "oauth_google",
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const navigation = useRouter();
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const copy = authCopy[mode];
  const showsPassword = mode === "sign-up";
  const isFetching =
    isSubmitting ||
    signInFetchStatus === "fetching" ||
    signUpFetchStatus === "fetching";

  const showError = (title: string, error: unknown, fallback: string) => {
    Alert.alert(title, getAuthErrorMessage(error, fallback));
  };

  const goHome = () => {
    router.replace("/");
  };

  const handleSubmit = async () => {
    const emailAddress = email.trim();

    if (!emailAddress) {
      Alert.alert("Email required", "Enter your email address to continue.");
      return;
    }

    if (mode === "sign-up" && !password) {
      Alert.alert("Password required", "Enter a password to create your account.");
      return;
    }

    if (mode === "sign-up" && password.length < 8) {
      Alert.alert(
        "Password too short",
        "Use at least 8 characters for your password."
      );
      return;
    }

    setIsSubmitting(true);
    setVerificationError(null);

    if (mode === "sign-up") {
      const { error } = await signUp.password({ emailAddress, password });

      if (error) {
        setIsSubmitting(false);
        showError("Sign up failed", error, "We could not create your account.");
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();

      setIsSubmitting(false);

      if (sendError) {
        showError(
          "Verification failed",
          sendError,
          "We could not send a verification code."
        );
        return;
      }

      setIsVerificationVisible(true);
      return;
    }

    const { error } = await signIn.emailCode.sendCode({ emailAddress });

    setIsSubmitting(false);

    if (error) {
      showError("Sign in failed", error, "We could not send a sign-in code.");
      return;
    }

    setIsVerificationVisible(true);
  };

  const handleVerifyCode = async (code: string) => {
    setVerificationError(null);

    if (mode === "sign-up") {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        const message = getAuthErrorMessage(
          error,
          "That verification code did not work."
        );
        setVerificationError(message);
        return false;
      }

      const { error: finalizeError } = await signUp.finalize();

      if (finalizeError) {
        const message = getAuthErrorMessage(
          finalizeError,
          "We could not finish signing you up."
        );
        setVerificationError(message);
        return false;
      }

      setIsVerificationVisible(false);
      goHome();
      return true;
    }

    const { error } = await signIn.emailCode.verifyCode({ code });

    if (error) {
      const message = getAuthErrorMessage(error, "That sign-in code did not work.");
      setVerificationError(message);
      return false;
    }

    if (signIn.status !== "complete") {
      setVerificationError("This account needs another verification step.");
      return false;
    }

    const { error: finalizeError } = await signIn.finalize();

    if (finalizeError) {
      const message = getAuthErrorMessage(
        finalizeError,
        "We could not finish signing you in."
      );
      setVerificationError(message);
      return false;
    }

    setIsVerificationVisible(false);
    goHome();
    return true;
  };

  const handleResendCode = async () => {
    setVerificationError(null);

    if (mode === "sign-up") {
      const { error } = await signUp.verifications.sendEmailCode();

      if (error) {
        setVerificationError(
          getAuthErrorMessage(error, "We could not resend the verification code.")
        );
      }

      return;
    }

    const { error } = await signIn.emailCode.sendCode();

    if (error) {
      setVerificationError(
        getAuthErrorMessage(error, "We could not resend the sign-in code.")
      );
    }
  };

  const closeVerification = () => {
    setIsVerificationVisible(false);
    setVerificationError(null);

    if (mode === "sign-up") {
      void signUp.reset();
      return;
    }

    void signIn.reset();
  };

  const handleSocialAuth = async (provider: SocialProvider) => {
    setIsSubmitting(true);

    try {
      const { createdSessionId, signUp: ssoSignUp } = await startSSOFlow({
        strategy: socialStrategies[provider],
      });

      if (createdSessionId) {
        goHome();
        return;
      }

      if (ssoSignUp?.status === "missing_requirements") {
        Alert.alert(
          "More details needed",
          "This social account needs extra details before it can be used."
        );
      }
    } catch (error) {
      showError(
        `${provider} sign in failed`,
        error,
        `${provider} sign in is not available right now.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryError =
    mode === "sign-up"
      ? signUpErrors.fields.emailAddress ??
        signUpErrors.fields.password ??
        signUpErrors.fields.captcha
      : signInErrors.fields.identifier ?? signInErrors.fields.code;

  useEffect(() => {
    if (primaryError) {
      Alert.alert("Check your details", primaryError.message);
    }
  }, [primaryError]);

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

        {mode === "sign-up" ? <View nativeID="clerk-captcha" /> : null}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleSubmit}
          disabled={isFetching}
          accessibilityState={{ disabled: isFetching }}
          className="auth-primary-button mt-7 h-[66px] items-center justify-center"
          style={{ opacity: isFetching ? 0.72 : 1 }}
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
          <SocialButton
            provider="Google"
            icon="google"
            disabled={isFetching}
            onPress={() => handleSocialAuth("Google")}
          />
          <SocialButton
            provider="Facebook"
            icon="facebook"
            disabled={isFetching}
            onPress={() => handleSocialAuth("Facebook")}
          />
          <SocialButton
            provider="Apple"
            icon="apple"
            disabled={isFetching}
            onPress={() => handleSocialAuth("Apple")}
          />
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
        email={email.trim()}
        errorMessage={verificationError}
        isLoading={isFetching}
        visible={isVerificationVisible}
        onClose={closeVerification}
        onResendCode={handleResendCode}
        onVerifyCode={handleVerifyCode}
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
  provider: SocialProvider;
  icon: SocialIcon;
  disabled: boolean;
  onPress: () => void;
};

function SocialButton({ provider, icon, disabled, onPress }: SocialButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      accessibilityState={{ disabled }}
      className="auth-social-button h-[61px] flex-row items-center justify-center px-5"
      style={{ opacity: disabled ? 0.72 : 1 }}
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
      <Text numberOfLines={1} className="auth-social-button__label ml-4">
        Continue with {provider}
      </Text>
    </TouchableOpacity>
  );
}

type VerificationModalProps = {
  email: string;
  errorMessage: string | null;
  isLoading: boolean;
  visible: boolean;
  onClose: () => void;
  onResendCode: () => Promise<void>;
  onVerifyCode: (code: string) => Promise<boolean>;
};

function VerificationModal({
  email,
  errorMessage,
  isLoading,
  visible,
  onClose,
  onResendCode,
  onVerifyCode,
}: VerificationModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const digits = Array.from({ length: 6 }, (_, index) => code[index] ?? "");
  const isBusy = isLoading || isVerifying;

  useEffect(() => {
    if (!visible) {
      setCode("");
      setIsVerifying(false);
      return;
    }

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 220);

    return () => clearTimeout(focusTimer);
  }, [visible]);

  const handleChangeCode = async (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setCode(nextCode);

    if (nextCode.length !== 6 || isBusy) {
      return;
    }

    setIsVerifying(true);
    const verified = await onVerifyCode(nextCode);
    setIsVerifying(false);

    if (!verified) {
      setCode("");
      inputRef.current?.focus();
    }
  };

  const handleResend = async () => {
    if (isBusy) {
      return;
    }

    await onResendCode();
    setCode("");
    inputRef.current?.focus();
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
          className="flex-1 justify-end bg-black/30 px-6 pb-8"
        >
          <View className="auth-modal px-6 pb-7 pt-8">
            <Text className="auth-modal__title text-center">Verify your email</Text>
            <Text className="auth-modal__copy mt-3 text-center">
              Enter the 6-digit code sent to {email || "your email"}.
            </Text>

            <View className="relative mt-7">
              <View className="flex-row justify-between">
                {digits.map((digit, index) => (
                  <View
                    key={`verification-code-${index}`}
                    className="auth-code-box h-[52px] w-[45px] items-center justify-center"
                  >
                    <Text className="auth-code-box__digit">{digit}</Text>
                  </View>
                ))}
              </View>

              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleChangeCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={6}
                editable={!isBusy}
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
            </View>

            {errorMessage ? (
              <Text className="lingua-text--body-small mt-4 text-center text-lingua-error">
                {errorMessage}
              </Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.76}
              disabled={isBusy}
              onPress={handleResend}
              className="mt-5 h-12 items-center justify-center"
              style={{ opacity: isBusy ? 0.62 : 1 }}
            >
              <Text className="auth-modal__cancel">Resend code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.76}
              disabled={isBusy}
              onPress={onClose}
              className="h-12 items-center justify-center"
              style={{ opacity: isBusy ? 0.62 : 1 }}
            >
              <Text className="auth-modal__cancel">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const clerkError = error as { longMessage?: string; message?: string };
    return clerkError.longMessage ?? clerkError.message ?? fallback;
  }

  return fallback;
}

