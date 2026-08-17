import { RETRO_COMPUTING_EVENT } from './events';

export interface ProducerDefinition {
  itemId: string;
  energyCost: number;
  unlockLevel: number;
  actionLabel: string;
  drops: ReadonlyArray<{itemId:string;weight:number}>;
  eventId?: string;
  activeFrom?: number;
  activeUntil?: number;
  burstCapacity?: number;
  cooldownMs?: number;
}

export const producerCatalog: ProducerDefinition[] = [
  { itemId:'workstation', energyCost:1, unlockLevel:1, actionLabel:'TAP TO COMPILE', drops:[{itemId:'character',weight:70},{itemId:'string',weight:15},{itemId:'typo',weight:10},{itemId:'warning',weight:5}] },
  { itemId:'infrastructure_workbench', energyCost:2, unlockLevel:7, actionLabel:'TAP TO PROVISION', drops:[{itemId:'raspberry_pi',weight:72},{itemId:'desktop_pc',weight:14},{itemId:'typo',weight:9},{itemId:'warning',weight:5}] },
  { itemId:'event_pipeline', energyCost:2, unlockLevel:14, actionLabel:'BOOT RETRO FEED', eventId:RETRO_COMPUTING_EVENT.id, activeFrom:RETRO_COMPUTING_EVENT.startsAt, activeUntil:RETRO_COMPUTING_EVENT.endsAt, burstCapacity:RETRO_COMPUTING_EVENT.burstCapacity, cooldownMs:RETRO_COMPUTING_EVENT.cooldownMs, drops:RETRO_COMPUTING_EVENT.drops },
  { itemId:'html_workbench', energyCost:3, unlockLevel:20, actionLabel:'TAP TO RENDER', drops:[{itemId:'angle_bracket',weight:72},{itemId:'html_tag',weight:14},{itemId:'typo',weight:9},{itemId:'warning',weight:5}] },
  { itemId:'css_selector_lab', energyCost:3, unlockLevel:27, actionLabel:'TAP TO STYLE', drops:[{itemId:'type_selector',weight:68},{itemId:'class_selector',weight:14},{itemId:'typo',weight:10},{itemId:'warning',weight:6},{itemId:'regression',weight:2}] }
];
export const producerByItemId=new Map(producerCatalog.map(producer=>[producer.itemId,producer]));
