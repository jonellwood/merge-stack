export interface ProducerDefinition {
  itemId: string;
  energyCost: number;
  unlockLevel: number;
  actionLabel: string;
  drops: ReadonlyArray<{itemId:string;weight:number}>;
}

export const producerCatalog: ProducerDefinition[] = [
  { itemId:'workstation', energyCost:1, unlockLevel:1, actionLabel:'TAP TO COMPILE', drops:[{itemId:'character',weight:70},{itemId:'string',weight:15},{itemId:'typo',weight:10},{itemId:'warning',weight:5}] },
  { itemId:'infrastructure_workbench', energyCost:2, unlockLevel:4, actionLabel:'TAP TO PROVISION', drops:[{itemId:'raspberry_pi',weight:72},{itemId:'desktop_pc',weight:14},{itemId:'typo',weight:9},{itemId:'warning',weight:5}] }
];
export const producerByItemId=new Map(producerCatalog.map(producer=>[producer.itemId,producer]));
