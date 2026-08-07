export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progression'|'merge'|'support'|'operations'|'event';
  hidden?: boolean;
  eventId?: string;
}

export const achievementCatalog: AchievementDefinition[] = [
  {id:'first-merge',name:'Merge Initiate',description:'Complete your first merge.',icon:'◇',category:'merge'},
  {id:'first-ticket',name:'Ticket Closer',description:'Resolve your first support ticket.',icon:'✓',category:'support'},
  {id:'application-shipped',name:'It Works on Production',description:'Build a complete Application.',icon:'▣',category:'merge'},
  {id:'cloud-architect',name:'Cloud Architect',description:'Build a Cloud Region.',icon:'☁',category:'operations'},
  {id:'full-board',name:'Maximum Allocation',description:'Unlock every cell on the game board.',icon:'▦',category:'progression'},
  {id:'rack-mounted',name:'Rack Mounted',description:'Store your first item in the Server Rack.',icon:'▤',category:'operations'},
  {id:'html-operator',name:'Markup Operator',description:'Deploy the HTML Workbench at level 20.',icon:'</>',category:'progression'},
  {id:'html-certified',name:'Standards Compliant',description:'Build Production Markup.',icon:'W3',category:'merge'},
  {id:'hackathon-winner',name:'Hackathon Winner',description:'Redeem a Winning Hack during Hackathon Weekend.',icon:'🏆',category:'event',eventId:'hackathon-2026'}
  ,{id:'retro-cloud',name:'Back to the Cloud',description:'Merge thirty years of computing into a Cloud Desktop during Retro Computing Week.',icon:'💾',category:'event',eventId:'retro-computing-2026'}
];

export const achievementById=new Map(achievementCatalog.map(achievement=>[achievement.id,achievement]));
