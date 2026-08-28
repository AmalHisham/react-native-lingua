import { fontFamilies } from "./fonts";

export const typography = {
  h1: {
    label: "Page / Screen Title",
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    lineHeight: 38.4,
  },
  h2: {
    label: "Section Title",
    fontFamily: fontFamilies.semiBold,
    fontSize: 24,
    lineHeight: 31.2,
  },
  h3: {
    label: "Card / Module Title",
    fontFamily: fontFamilies.semiBold,
    fontSize: 20,
    lineHeight: 26,
  },
  h4: {
    label: "Subheading",
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    lineHeight: 22.4,
  },
  bodyLarge: {
    label: "Important content",
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 25.6,
  },
  bodyMedium: {
    label: "Body text",
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 22.4,
  },
  bodySmall: {
    label: "Supporting text",
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 20.8,
  },
  caption: {
    label: "Labels, meta text",
    fontFamily: fontFamilies.regular,
    fontSize: 11,
    lineHeight: 15.4,
  },
} as const;

export type TypographyRole = keyof typeof typography;
