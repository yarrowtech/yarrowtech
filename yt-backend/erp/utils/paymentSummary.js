export const CREDITED_PAYMENT_STATUSES = ["paid"];

export function calculateProjectPaymentSummary(project, payments = []) {
  const totalPayment = Number(project?.totalPayment) || 0;

  const paidAmount = payments.reduce((sum, payment) => {
    const amount = Number(payment?.amount) || 0;
    const status = String(payment?.status || "").toLowerCase();
    return CREDITED_PAYMENT_STATUSES.includes(status) ? sum + amount : sum;
  }, 0);

  const pendingAmount = payments.reduce((sum, payment) => {
    const amount = Number(payment?.amount) || 0;
    const status = String(payment?.status || "").toLowerCase();
    return status === "pending" ? sum + amount : sum;
  }, 0);

  const failedAmount = payments.reduce((sum, payment) => {
    const amount = Number(payment?.amount) || 0;
    const status = String(payment?.status || "").toLowerCase();
    return status === "failed" ? sum + amount : sum;
  }, 0);

  return {
    totalPayment,
    paidAmount,
    pendingAmount,
    failedAmount,
    dueAmount: Math.max(totalPayment - paidAmount, 0),
    paymentCount: payments.length,
  };
}
