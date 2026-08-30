import { useAuth, useClerk } from "@clerk/expo";
import { Link, Redirect } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="lingua-screen items-center justify-center px-6">
      <Text className="lingua-text--h1 text-center text-lingua-deep-purple">
        Lingua
      </Text>
      <Text className="lingua-text--body-medium mt-3 text-center text-lingua-text-secondary">
        Learn languages with playful AI lessons.
      </Text>
      <Link href="/onboarding" asChild>
        <TouchableOpacity
          activeOpacity={0.86}
          className="mt-8 h-14 min-w-56 items-center justify-center rounded-lingua-lg bg-lingua-deep-purple px-8"
        >
          <Text className="lingua-text--h4 text-white">Open onboarding</Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => signOut()}
        className="mt-4 h-14 min-w-56 items-center justify-center rounded-lingua-lg border border-lingua-border bg-white px-8"
      >
        <Text className="lingua-text--h4 text-lingua-text-primary">Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
