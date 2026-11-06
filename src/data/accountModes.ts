import type { UserMode } from '@/types/dataDonation';

/** The three account types a user can register with. Single source for register + landing. */
export const ACCOUNT_MODES: { value: UserMode; label: string; description: string }[] = [
  { value: 'individual', label: 'Individual', description: 'Personal use for checking projects' },
  { value: 'researcher', label: 'Researcher', description: 'Academic or security research' },
  { value: 'ea-vc', label: 'EA / VC', description: 'Enterprise or venture capital use' },
];
