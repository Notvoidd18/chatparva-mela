import { z } from "zod";
import {
  Position3DSchema,
  PlayerInputSchema as LegacyPlayerInputSchema,
  PlayerStateSchema as LegacyPlayerStateSchema,
  ChatMessageSchema as LegacyChatMessageSchema,
} from "./schemas/player.js";
import {
  Vector3Type,
  AnimationStateType,
  EmoteType,
  AvatarCustomizationType,
  PlayerInputType,
  PlayerNetworkStateType,
  ChatMessageType,
  LangurSymbolType,
  LangurBetType,
  LangurGameStateType,
  PingSwingStateType,
  DiyaStateType,
} from "./schemas/melaProtocol.js";

// Legacy types preserved for backward compatibility
export type Position3D = z.infer<typeof Position3DSchema>;
export type LegacyPlayerInput = z.infer<typeof LegacyPlayerInputSchema>;
export type LegacyPlayerState = z.infer<typeof LegacyPlayerStateSchema>;
export type LegacyChatMessage = z.infer<typeof LegacyChatMessageSchema>;

// Aliases
export type Vector3 = Vector3Type;
export type AnimationState = AnimationStateType;
export type AvatarCustomization = AvatarCustomizationType;
export type PlayerInput = PlayerInputType;
export type PlayerNetworkState = PlayerNetworkStateType;
export type ChatMessage = ChatMessageType;
export type LangurSymbol = LangurSymbolType;
export type LangurBet = LangurBetType;
export type LangurGameState = LangurGameStateType;
export type PingSwingState = PingSwingStateType;
export type DiyaState = DiyaStateType;
export type { EmoteType };
