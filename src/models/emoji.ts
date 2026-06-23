export interface Emoji {
    i: string;            // The emoji character
    n: string[];          // Names or aliases for the emoji
    r: string;            // Unicode representation with skin tone
    t: "neutral" | "light" | "medium-light" | "medium" | "medium-dark" | "dark"; // Skin tone (can expand based on tones needed)
    u: string;            // Unicode representation without skin tone
  }