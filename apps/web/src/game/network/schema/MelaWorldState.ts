import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class PlayerSchema extends Schema {
  @type("string") sessionId: string = "";
  @type("string") displayName: string = "Yatri";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 32;
  @type("number") rotationY: number = 0;
  @type("string") animState: string = "idle";

  // Avatar Customization
  @type("string") color: string = "#C41E3A";
  @type("string") dhakaTopiColor: string = "#8B0000";
  @type("boolean") hasDhakaTopi: boolean = true;
  @type("boolean") hasVest: boolean = true;
  @type("string") vestColor: string = "#D97706";
  @type("string") skinTone: string = "#E0AC69";
  @type("boolean") hasTika: boolean = false;
  @type("boolean") hasReceivedTikaReward: boolean = false;
  @type("boolean") isFlyingKite: boolean = false;
  @type("string") avatarType: string = "boy1";

  // Economy & Inventory (NPR Currency)
  @type("number") npr: number = 100;
  @type("number") selRotiCount: number = 0;
  @type("number") chiyaCount: number = 0;
  @type("boolean") hasChanga: boolean = false;

  // Stats & Network
  @type("number") ping: number = 0;
  @type("number") tokens: number = 100;
  @type("number") score: number = 0;
  @type("boolean") isOnline: boolean = true;
  @type("number") lastActive: number = Date.now();
}

export class PingSwingSchema extends Schema {
  @type("string") occupantSessionId: string = "";
  @type("string") occupantName: string = "";
  @type("number") swingAngle: number = 0;
  @type("number") swingSpeed: number = 0;
  @type("boolean") isPumping: boolean = false;
}

export class LangurBurjaSchema extends Schema {
  @type("number") roundId: number = 1;
  @type("string") phase: string = "betting";
  @type("number") timerRemaining: number = 15;
  @type("string") d1: string = "jhanda";
  @type("string") d2: string = "burja";
  @type("string") d3: string = "ita";
  @type("string") d4: string = "paan";
  @type("string") d5: string = "hukum";
  @type("string") d6: string = "chidi";
}

export class DiyaSchema extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("boolean") isLit: boolean = false;
  @type("string") litBy: string = "";
  @type("number") litAt: number = 0;
}

export class ChatMessageSchema extends Schema {
  @type("string") id: string = "";
  @type("string") senderId: string = "";
  @type("string") senderName: string = "";
  @type("string") text: string = "";
  @type("number") timestamp: number = 0;
  @type("string") channel: string = "global";
}

export class MelaWorldState extends Schema {
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type(PingSwingSchema) pingSwing = new PingSwingSchema();
  @type(LangurBurjaSchema) langurBurja = new LangurBurjaSchema();
  @type({ map: DiyaSchema }) diyas = new MapSchema<DiyaSchema>();
  @type([ChatMessageSchema]) messages = new ArraySchema<ChatMessageSchema>();
}
