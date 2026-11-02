import React from 'react';
import { Home, Zap, Droplets, Wifi, Flame, ShoppingBag, Wrench, Receipt } from 'lucide-react';
import { BillCategory } from '../types';

interface Props {
  category: BillCategory;
  className?: string;
  size?: number;
}

export const getCategoryLabel = (category: BillCategory): string => {
  switch (category) {
    case 'rent':
      return 'House Rent';
    case 'electricity':
      return 'Electricity';
    case 'water':
      return 'Water';
    case 'wifi':
      return 'Wi-Fi & Internet';
    case 'gas':
      return 'Piped Gas';
    case 'groceries':
      return 'Groceries & Supplies';
    case 'maintenance':
      return 'Maintenance';
    case 'other':
    default:
      return 'Utility / Other';
  }
};

export const getCategoryColor = (category: BillCategory): string => {
  switch (category) {
    case 'rent':
      return '#6366F1'; // Indigo
    case 'electricity':
      return '#EAB308'; // Amber
    case 'water':
      return '#0EA5E9'; // Sky
    case 'wifi':
      return '#8B5CF6'; // Purple
    case 'gas':
      return '#F97316'; // Orange
    case 'groceries':
      return '#10B981'; // Emerald
    case 'maintenance':
      return '#64748B'; // Slate
    case 'other':
    default:
      return '#6B7280'; // Gray
  }
};

export const CategoryIcon: React.FC<Props> = ({ category, className = 'w-5 h-5', size }) => {
  const iconProps = { className, size };
  switch (category) {
    case 'rent':
      return <Home {...iconProps} />;
    case 'electricity':
      return <Zap {...iconProps} />;
    case 'water':
      return <Droplets {...iconProps} />;
    case 'wifi':
      return <Wifi {...iconProps} />;
    case 'gas':
      return <Flame {...iconProps} />;
    case 'groceries':
      return <ShoppingBag {...iconProps} />;
    case 'maintenance':
      return <Wrench {...iconProps} />;
    case 'other':
    default:
      return <Receipt {...iconProps} />;
  }
};
