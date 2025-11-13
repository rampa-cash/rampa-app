export enum TextVariant {
    // Headers
    H1 = 'h1', // 32 / 100% / Medium
    H2 = 'h2', // 24 / 100% / Regular

    // Body
    BodyMedium = 'bodyMedium', // 16 / 114% / Medium
    Body = 'body', // 16 / 114% / Regular

    // Secondary / Helper
    SecondaryMedium = 'secondaryMedium', // 14 / 140% / Medium
    Secondary = 'secondary', // 14 / 140% / Regular
    Caption = 'caption', // 12 / 140% / Regular

    // Numeric display
    NumH1 = 'numH1', // 52 / 100% / Medium
    NumBody = 'numBody', // 16 / 140% / Regular
    NumSecondary = 'numSecondary', // 14 / 140% / Regular
    NumH2 = 'numH2', // 28 / 140% / Regular
    NumH3 = 'numH3', // 24 / 100% / Regular
}

export type TextVariantKeys = `${TextVariant}`;

