import type { ItemDefinition } from '$lib/domain/types';

const chain = (chainId: string, rows: Array<[string, string, string, string]>): ItemDefinition[] => rows.map((row, index) => ({
  id: row[0], name: row[1], icon: row[2], description: row[3], chainId, level: index + 1,
  nextItemId: rows[index + 1]?.[0], kind: 'mergeable', mergeable: index < rows.length - 1, tags: [chainId]
}));

export const javascriptItems = chain('javascript', [
  ['character','Character','a','A tiny fragment of source code.'], ['string','String','“ ”','Text, now with quotation marks.'],
  ['variable','Variable','x','A named place for state to hide.'], ['expression','Expression','x+1','Values and operators making a result.'],
  ['function','Function','ƒ','Reusable behavior with opinions.'], ['callback','Callback','↩','A function waiting by the phone.'],
  ['promise','Promise','◇','A future result, probably.'], ['async_function','Async Function','await','Orderly asynchronous behavior.'],
  ['module','Module','⬡','A reusable code boundary.'], ['application','Application','▣','A complete deliverable. Ship it.']
]);
export const bugItems = chain('bugs', [
  ['typo','Typo','?','Harmless until deployment.'], ['warning','Warning','!','Ignored successfully for six months.'],
  ['bug','Bug','◆','Unexpected behavior with a ticket number.'], ['regression','Regression','↙','The old bug has returned.'],
  ['outage','Outage','☁','Everything is fine, except the service.'], ['incident','Incident','⚠','A calendar invitation with urgency.'],
  ['major_incident','Major Incident','🔥','Leadership has joined the call.'], ['hearing','Congressional Hearing','⚖','The ultimate escalation path.']
]);
export const serverItems = chain('servers', [
  ['raspberry_pi','Raspberry Pi','π','A tiny computer with enormous responsibilities.'],
  ['desktop_pc','Desktop PC','▤','A beige box promoted into infrastructure.'],
  ['server_workstation','Server Workstation','▥','A desktop nobody is allowed to turn off.'],
  ['rack_server','Rack Server','▦','Loud, rectangular, and business critical.'],
  ['server_cluster','Server Cluster','⬢','Several servers agreeing to fail together.'],
  ['data_center','Data Center','▰','A climate-controlled monument to uptime.'],
  ['cloud_region','Cloud Region','☁','Someone else’s data center, billed creatively.']
]);
export const producer: ItemDefinition = { id:'workstation', name:'Junior Developer Workstation', description:'Produces code and occasional consequences.', kind:'producer', icon:'⌨', mergeable:false, tags:['producer'] };
export const infrastructureProducer: ItemDefinition = { id:'infrastructure_workbench', name:'Infrastructure Workbench', description:'Produces server hardware and operational anxiety. Unlocks at player level 4.', kind:'producer', icon:'🛠', mergeable:false, tags:['producer','servers'] };
export const itemCatalog = [...javascriptItems, ...bugItems, ...serverItems, producer, infrastructureProducer];
export const itemById = new Map(itemCatalog.map((item) => [item.id, item]));
