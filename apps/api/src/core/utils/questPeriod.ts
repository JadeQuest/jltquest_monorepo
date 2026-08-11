import { QuestFrequency } from '@jlt/database';

export function getQuestPeriodKey(frequency: QuestFrequency | string): string {
  const now = new Date();
  
  if (frequency === QuestFrequency.ONE_TIME || frequency === (QuestFrequency as any).ACHIEVEMENT || frequency === 'ACHIEVEMENT') {
    return 'ALL';
  }
  
  if (frequency === QuestFrequency.REPEATABLE) {
    return `RPT-${now.getTime()}-${Math.random().toString(36).substring(7)}`;
  }
  
  if (frequency === QuestFrequency.DAILY) {
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  if (frequency === QuestFrequency.WEEKLY) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
  
  if (frequency === (QuestFrequency as any).MONTHLY || frequency === 'MONTHLY') {
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  
  return 'ALL';
}
