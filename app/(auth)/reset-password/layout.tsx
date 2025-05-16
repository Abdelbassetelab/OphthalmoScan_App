import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | OphthalmoScan-AI',
  description: 'Reset your OphthalmoScan-AI account password',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}