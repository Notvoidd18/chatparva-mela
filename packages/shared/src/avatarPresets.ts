import type { AvatarCustomizationType } from "./schemas/melaProtocol.js";

export interface AvatarPreset {
  id: "boy1" | "boy2" | "girl1" | "girl2";
  name: string;
  nepaliName: string;
  gender: "boy" | "girl";
  tagline: string;
  description: string;
  customization: AvatarCustomizationType;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "boy1",
    name: "Daura Suruwal",
    nepaliName: "भोजराज (Classic Boy)",
    gender: "boy",
    tagline: "Authentic Nepali Traditional",
    description: "Classic crimson Daura Suruwal, golden Patuka vest, and authentic Palpali Dhaka Topi.",
    customization: {
      color: "#C41E3A",
      dhakaTopiColor: "#8B0000",
      hasDhakaTopi: true,
      hasVest: true,
      vestColor: "#D97706",
      skinTone: "#E0AC69",
      hasTika: false,
      hasJamara: false,
      avatarType: "boy1",
    },
  },
  {
    id: "boy2",
    name: "Festive Kurta",
    nepaliName: "आयुष (Modern Boy)",
    gender: "boy",
    tagline: "Festive Modern Youth",
    description: "Royal sapphire blue festival Kurta with midnight velvet vest and modern styled hair.",
    customization: {
      color: "#1E40AF",
      dhakaTopiColor: "#8B0000",
      hasDhakaTopi: false,
      hasVest: true,
      vestColor: "#1F2937",
      skinTone: "#E0AC69",
      hasTika: false,
      hasJamara: false,
      avatarType: "boy2",
    },
  },
  {
    id: "girl1",
    name: "Gunyou Cholo",
    nepaliName: "सीता (Classic Girl)",
    gender: "girl",
    tagline: "Traditional Festive Sari",
    description: "Festive crimson red Gunyou Cholo with golden lace borders, traditional braid & golden jhumkas.",
    customization: {
      color: "#DC2626",
      dhakaTopiColor: "#8B0000",
      hasDhakaTopi: false,
      hasVest: true,
      vestColor: "#F59E0B",
      skinTone: "#E0AC69",
      hasTika: false,
      hasJamara: false,
      avatarType: "girl1",
    },
  },
  {
    id: "girl2",
    name: "Tihar Kurti",
    nepaliName: "अञ्जली (Modern Girl)",
    gender: "girl",
    tagline: "Vibrant Festival Elegance",
    description: "Peacock emerald green silk Kurti with sunset dupatta, flowing hair, bangles & hoop earrings.",
    customization: {
      color: "#0D9488",
      dhakaTopiColor: "#8B0000",
      hasDhakaTopi: false,
      hasVest: true,
      vestColor: "#EA580C",
      skinTone: "#E0AC69",
      hasTika: false,
      hasJamara: false,
      avatarType: "girl2",
    },
  },
];
