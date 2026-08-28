import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="lingua-screen items-center justify-center px-6">
      <Text className="lingua-text--h1 text-center text-lingua-deep-purple">
        Lingua
      </Text>
      <Text className="lingua-text--body-medium mt-3 text-center text-lingua-text-secondary">
        Learn languages with playful AI lessons.
      </Text>
    </View>
  );
}