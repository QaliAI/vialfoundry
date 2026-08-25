export const manualPaymentMethods = [
  {
    id: "zelle",
    label: "Zelle",
    tagline: "Instant bank transfer with zero processing fee",
    description: "Send payment via Zelle using your banking app",
    instructions: "Transfer to our registered business email and include your order number in the memo.",
  },
  {
    id: "venmo",
    label: "Venmo",
    tagline: "Pay directly using your Venmo account",
    description: "Send payment via Venmo handle",
    instructions: "Pay to our official Venmo handle and include your order number in the payment note.",
  },
  {
    id: "manual_invoice",
    label: "Direct Invoice / Quote",
    tagline: "Receive formal invoice with itemized specifications",
    description: "Institutional & laboratory procurement quote",
    instructions: "Our procurement desk will generate and email a formal verified invoice for processing.",
  },
];

export function getPaymentMethod(id) {
  return manualPaymentMethods.find((m) => m.id === id) || manualPaymentMethods[0];
}
