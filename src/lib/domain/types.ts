export type ItemKind = 'mergeable' | 'producer';

export interface ItemDefinition {
  id: string; name: string; description: string; chainId?: string; level?: number;
  nextItemId?: string; kind: ItemKind; icon: string; mergeable: boolean; tags: string[];
}
export interface BoardItemState { activationsRemaining?: number; cooldownUntil?: number; }
export interface BoardItem { instanceId: string; definitionId: string; cellIndex: number; createdAt: number; originProducerId?: string; state?: BoardItemState; }
export interface BoardCell { index: number; locked: boolean; unlockCost?: number; }
export interface PlayerState { id: 'local-player'; credits: number; xp: number; level: number; energy: number; maxEnergy: number; energyUpdatedAt: number; }
export interface Requirement { itemId: string; quantity: number; }
export interface TicketTemplate { id: string; requester: string; title: string; description: string; requirements: Requirement[]; minPlayerLevel?: number; }
export interface Ticket { id: string; requesterId: string; requester: string; title: string; description: string; requirements: Requirement[]; rewards: { credits: number; xp: number; energy: number }; status: 'active' | 'completed'; createdAt: number; }
export interface EnergyShopState { windowStartedAt: number | null; purchases: number; }
export interface GameSettings { sound: boolean; reducedMotion: boolean; highContrast: boolean; }
export interface GameState { schemaVersion: number; player: PlayerState; cells: BoardCell[]; items: BoardItem[]; tickets: Ticket[]; settings: GameSettings; energyShop: EnergyShopState; ticketSequence: number; updatedAt: number; }
export interface CommandResult { ok: boolean; reason?: string; message?: string; action?: string; }
