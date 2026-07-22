import { HACKATHON_EVENT } from './events';

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
  { itemId:'event_pipeline', energyCost:2, unlockLevel:14, actionLabel:'DEPLOY HACK FEED', eventId:HACKATHON_EVENT.id, activeFrom:HACKATHON_EVENT.startsAt, activeUntil:HACKATHON_EVENT.endsAt, burstCapacity:HACKATHON_EVENT.burstCapacity, cooldownMs:HACKATHON_EVENT.cooldownMs, drops:HACKATHON_EVENT.drops }
];
export const producerByItemId=new Map(producerCatalog.map(producer=>[producer.itemId,producer]));
