import './styles/EmptyState.css';
import { Radio } from 'lucide-react';

export const EmptyState = ({ title, detail }: { title: string; detail: string }) => {
  return <div className="empty-state"><Radio size={30} /><h2>{title}</h2><p>{detail}</p></div>;
};
