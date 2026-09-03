import React from 'react';
import type { SyncStatus } from '../types/survey';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: SyncStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'SYNCED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          <CheckCircle2 className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          SYNCED
        </span>
      );
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          <Clock className={isSm ? 'w-3.5 h-3.5 animate-pulse' : 'w-4 h-4 animate-pulse'} />
          PENDING
        </span>
      );
    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          <AlertCircle className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          FAILED
        </span>
      );
  }
};
