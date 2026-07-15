import { itemById } from './items';
import type { TicketTemplate } from '$lib/domain/types';

export const ticketTemplates: TicketTemplate[] = [
  { id:'password-alignment', requester:'Help Desk', title:'Password Field Alignment', description:'The pixels have unionized.', requirements:[{itemId:'string',quantity:1}] },
  { id:'escape-headline', requester:'Communications', title:'Escape This Headline', description:'Someone pasted a quote into another quote.', requirements:[{itemId:'character',quantity:2}] },
  { id:'known-issue', requester:'Quality Assurance', title:'Known Issue Reproduction', description:'Please preserve the typo exactly as documented.', requirements:[{itemId:'typo',quantity:1}] },
  { id:'console-message', requester:'Operations', title:'Harmless Console Message', description:'It says warning, but in a reassuring color.', requirements:[{itemId:'warning',quantity:1}] },
  { id:'employee-export', requester:'Human Resources', title:'Employee List Export', description:'Please make it Excel, PDF, and interactive.', requirements:[{itemId:'variable',quantity:1}] },
  { id:'monthly-report', requester:'Finance', title:'Monthly Report Failure', description:'It worked last month.', requirements:[{itemId:'expression',quantity:1},{itemId:'warning',quantity:1}] },
  { id:'website-update', requester:'Public Information', title:'Website Update', description:'Make the button modern, but exactly the same.', requirements:[{itemId:'function',quantity:1},{itemId:'string',quantity:1}] },
  { id:'compatibility-patch', requester:'Legacy Systems', title:'Compatibility Patch', description:'The bug is part of the approved workflow.', requirements:[{itemId:'callback',quantity:1},{itemId:'bug',quantity:1}] },
  { id:'strategic-dashboard', requester:'Executive Office', title:'Strategic Dashboard', description:'Due before the requirements meeting.', requirements:[{itemId:'promise',quantity:1},{itemId:'regression',quantity:1}] }
  ,{ id:'conference-room-server', requester:'Facilities', title:'Conference Room Server', description:'The smart display needs enterprise-grade hosting.', minPlayerLevel:4, requirements:[{itemId:'raspberry_pi',quantity:2}] }
  ,{ id:'under-desk-datacenter', requester:'Procurement', title:'Approved Server Upgrade', description:'The rack budget was converted into office furniture.', minPlayerLevel:4, requirements:[{itemId:'desktop_pc',quantity:1},{itemId:'warning',quantity:1}] }
  ,{ id:'uptime-report', requester:'Operations', title:'Quarterly Uptime Report', description:'Please exclude the scheduled unscheduled outages.', minPlayerLevel:5, requirements:[{itemId:'server_workstation',quantity:1},{itemId:'bug',quantity:1}] }
];

export function ticketRewards(template: Pick<TicketTemplate,'requirements'>) {
  const difficulty=template.requirements.reduce((sum,requirement)=>sum+(itemById.get(requirement.itemId)?.level??1)*requirement.quantity,0);
  const energy=difficulty>=7?2:difficulty>=4?1:0;
  return {credits:20+difficulty*15,xp:8+difficulty*6,energy};
}
