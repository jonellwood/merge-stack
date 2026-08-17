import { itemById } from './items';
import type { TicketTemplate } from '$lib/domain/types';
import { RETRO_COMPUTING_EVENT } from './events';

export const ticketTemplates: TicketTemplate[] = [
  { id:'password-alignment', requester:'Help Desk', title:'Password Field Alignment', description:'The pixels have unionized.', requirements:[{itemId:'string',quantity:1}] },
  { id:'escape-headline', requester:'Communications', title:'Escape This Headline', description:'Someone pasted a quote into another quote.', requirements:[{itemId:'character',quantity:2}] },
  { id:'known-issue', requester:'Quality Assurance', title:'Known Issue Reproduction', description:'Please preserve the typo exactly as documented.', requirements:[{itemId:'typo',quantity:1}] },
  { id:'console-message', requester:'Operations', title:'Harmless Console Message', description:'It says warning, but in a reassuring color.', requirements:[{itemId:'warning',quantity:1}] },
  { id:'employee-export', requester:'Human Resources', title:'Employee List Export', description:'Please make it Excel, PDF, and interactive.', requirements:[{itemId:'variable',quantity:1}] },
  { id:'monthly-report', requester:'Finance', title:'Monthly Report Failure', description:'It worked last month.', requirements:[{itemId:'expression',quantity:1},{itemId:'warning',quantity:1}] },
  { id:'website-update', requester:'Public Information', title:'Website Update', description:'Make the button modern, but exactly the same.', requirements:[{itemId:'function',quantity:1},{itemId:'string',quantity:1}] },
  { id:'compatibility-patch', requester:'Legacy Systems', title:'Compatibility Patch', description:'The bug is part of the approved workflow.', requirements:[{itemId:'callback',quantity:1},{itemId:'bug',quantity:1}] },
  { id:'strategic-dashboard', requester:'Executive Office', title:'Strategic Dashboard', description:'Due before the requirements meeting.', requirements:[{itemId:'promise',quantity:1},{itemId:'regression',quantity:1}] },

  { id:'conference-room-server', requester:'Facilities', title:'Conference Room Server', description:'The smart display needs enterprise-grade hosting.', minPlayerLevel:7, requirements:[{itemId:'raspberry_pi',quantity:2}] },
  { id:'under-desk-datacenter', requester:'Procurement', title:'Approved Server Upgrade', description:'The rack budget was converted into office furniture.', minPlayerLevel:7, requirements:[{itemId:'desktop_pc',quantity:1},{itemId:'warning',quantity:1}] },
  { id:'uptime-report', requester:'Operations', title:'Quarterly Uptime Report', description:'Please exclude the scheduled unscheduled outages.', minPlayerLevel:7, requirements:[{itemId:'server_workstation',quantity:1},{itemId:'bug',quantity:1}] },
  { id:'rack-and-stack', requester:'Infrastructure', title:'Rack and Stack', description:'The cloud migration starts in the supply closet.', minPlayerLevel:7, requirements:[{itemId:'rack_server',quantity:1},{itemId:'warning',quantity:1}] },
  { id:'redundancy-initiative', requester:'Architecture', title:'Redundancy Initiative', description:'Make one server redundant by purchasing several more.', minPlayerLevel:7, requirements:[{itemId:'server_cluster',quantity:1}] },
  { id:'data-residency-review', requester:'Legal', title:'Data Residency Review', description:'The bytes need a permanent address and valid identification.', minPlayerLevel:9, requirements:[{itemId:'data_center',quantity:1},{itemId:'typo',quantity:1}] },
  { id:'global-region-expansion', requester:'Executive Office', title:'Global Region Expansion', description:'Leadership would like lower latency near the vacation home.', minPlayerLevel:11, requirements:[{itemId:'cloud_region',quantity:1}] },
  { id:'disaster-recovery-theatre', requester:'Risk Management', title:'Disaster Recovery Theatre', description:'Fail over convincingly before the auditors arrive.', minPlayerLevel:11, requirements:[{itemId:'cloud_region',quantity:1},{itemId:'outage',quantity:1}] },

  { id:'status-page-refresh', requester:'Site Reliability', title:'Status Page Refresh', description:'The status page is the only service still online.', minPlayerLevel:7, requirements:[{itemId:'outage',quantity:1}] },
  { id:'executive-incident-brief', requester:'Communications', title:'Executive Incident Brief', description:'Summarize the incident without using the word incident.', minPlayerLevel:9, requirements:[{itemId:'incident',quantity:1}] },
  { id:'war-room-escalation', requester:'Site Reliability', title:'War Room Escalation', description:'The meeting now has more attendees than the service has users.', minPlayerLevel:11, requirements:[{itemId:'major_incident',quantity:1}] },
  { id:'oversight-preparation', requester:'Government Affairs', title:'Oversight Preparation', description:'Please make the technical answer fit inside the opening statement.', minPlayerLevel:13, requirements:[{itemId:'hearing',quantity:1}] },

  { id:'async-migration', requester:'Platform Engineering', title:'Async Migration', description:'Make it faster by waiting more efficiently.', minPlayerLevel:13, requirements:[{itemId:'async_function',quantity:1}] },
  { id:'modular-modernization', requester:'Architecture', title:'Modular Modernization', description:'Break up the monolith without changing any dependencies.', minPlayerLevel:15, requirements:[{itemId:'module',quantity:1}] },
  { id:'enterprise-application', requester:'Product Management', title:'Enterprise Application', description:'The MVP now includes every feature from the roadmap.', minPlayerLevel:17, requirements:[{itemId:'application',quantity:1}] }
  ,{ id:'homepage-skeleton', requester:'Web Services', title:'Homepage Skeleton', description:'Content will be provided immediately after launch.', minPlayerLevel:20, requirements:[{itemId:'html_tag',quantity:1},{itemId:'angle_bracket',quantity:1}] }
  ,{ id:'div-reduction-plan', requester:'Architecture', title:'Div Reduction Plan', description:'Replace the nested boxes with more meaningful nested boxes.', minPlayerLevel:20, requirements:[{itemId:'html_element',quantity:1},{itemId:'nested_element',quantity:1}] }
  ,{ id:'semantic-modernization', requester:'Accessibility', title:'Semantic Modernization', description:'The screen reader would like to know where the page begins.', minPlayerLevel:20, requirements:[{itemId:'semantic_section',quantity:1}] }
  ,{ id:'public-access-review', requester:'Compliance', title:'Public Access Review', description:'The site must work for users, keyboards, and procurement.', minPlayerLevel:20, requirements:[{itemId:'accessible_page',quantity:1},{itemId:'warning',quantity:1}] }
  ,{ id:'document-reorganization', requester:'Content Strategy', title:'Document Reorganization', description:'Everything is above the fold if the document is long enough.', minPlayerLevel:20, requirements:[{itemId:'document_structure',quantity:1}] }
  ,{ id:'production-markup-release', requester:'Release Engineering', title:'Production Markup Release', description:'Ship the final HTML before someone requests another wrapper.', minPlayerLevel:20, requirements:[{itemId:'production_markup',quantity:1}] }
  ,{ id:'component-style-guide', requester:'Design Systems', title:'Component Style Guide', description:'The card should look reusable even when the content is not.', minPlayerLevel:27, requirements:[{itemId:'class_selector',quantity:1},{itemId:'type_selector',quantity:1}] }
  ,{ id:'accessible-state-styles', requester:'Accessibility', title:'Accessible State Styles', description:'Make every state visible, including the one nobody documented.', minPlayerLevel:27, requirements:[{itemId:'attribute_selector',quantity:1},{itemId:'html_element',quantity:1}] }
  ,{ id:'navigation-hover-review', requester:'User Experience', title:'Navigation State Review', description:'The hover treatment is perfect on devices that can hover.', minPlayerLevel:28, requirements:[{itemId:'combinator',quantity:1},{itemId:'pseudo_class',quantity:1}] }
  ,{ id:'selector-consolidation', requester:'Architecture', title:'Selector Consolidation', description:'Please combine the duplicates without changing which duplicates win.', minPlayerLevel:29, requirements:[{itemId:'selector_list',quantity:1},{itemId:'function',quantity:1}] }
  ,{ id:'specificity-arbitration', requester:'Developer Experience', title:'Specificity Arbitration', description:'Settle the dispute with math, diplomacy, or one more important flag.', minPlayerLevel:30, requirements:[{itemId:'specificity_rule',quantity:1},{itemId:'regression',quantity:1}] }
  ,{ id:'cascade-governance', requester:'Platform Engineering', title:'Cascade Governance', description:'Put every override in an approved layer above the other approved layers.', minPlayerLevel:31, requirements:[{itemId:'cascade_layer',quantity:1},{itemId:'semantic_section',quantity:1}] }
  ,{ id:'design-system-launch', requester:'Brand Operations', title:'Design System Launch', description:'Centralize every visual decision before the next redesign begins.', minPlayerLevel:32, requirements:[{itemId:'design_system',quantity:1},{itemId:'production_markup',quantity:1}] }
  ,{ id:'netscape-required', requester:'Legacy Applications', title:'Netscape Required', description:'The application requires Netscape Navigator.', minPlayerLevel:14, activeFrom:RETRO_COMPUTING_EVENT.startsAt, activeUntil:RETRO_COMPUTING_EVENT.endsAt, requirements:[{itemId:'mainframe_terminal',quantity:1},{itemId:'punch_card',quantity:1}] }
  ,{ id:'only-working-backup', requester:'Business Continuity', title:'The Only Working Backup', description:'A floppy disk contains the only working backup.', minPlayerLevel:14, activeFrom:RETRO_COMPUTING_EVENT.startsAt, activeUntil:RETRO_COMPUTING_EVENT.endsAt, requirements:[{itemId:'floppy_disk',quantity:1}] }
  ,{ id:'stable-by-obscurity', requester:'Legacy Systems', title:'Stable by Obscurity', description:'The system is stable because nobody knows how to modify it.', minPlayerLevel:14, activeFrom:RETRO_COMPUTING_EVENT.startsAt, activeUntil:RETRO_COMPUTING_EVENT.endsAt, requirements:[{itemId:'dos_pc',quantity:1},{itemId:'punch_card',quantity:1}] }
];

export function ticketRewards(template: Pick<TicketTemplate,'requirements'>) {
  const difficulty=template.requirements.reduce((sum,requirement)=>sum+(itemById.get(requirement.itemId)?.level??1)*requirement.quantity,0);
  const energy=difficulty>=7?2:difficulty>=4?1:0;
  return {credits:20+difficulty*15,xp:8+difficulty*6,energy};
}
