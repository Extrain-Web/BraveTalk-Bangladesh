'use client';

import { use } from 'react';
import BatchPaymentStatus from '@/components/Shared/BatchPaymentStatus';

// Per-batch payment status (one-time full payment — no installments / dues)
export default function BatchPaymentPage({ params }) {
  const { batchId } = use(params);
  return <BatchPaymentStatus batchId={batchId} basePath="/dashboard/training-manager" />;
}
