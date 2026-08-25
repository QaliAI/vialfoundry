import test from "node:test";
import assert from "node:assert/strict";
import { checkoutSubmissionSchema } from "../src/lib/manual-orders/schema.ts";

test("checkoutSubmissionSchema validates complete valid order payload", () => {
  const validPayload = {
    submissionKey: "vf_sub_1724567890_abc123",
    customerName: "Dr. Eleanor Vance",
    customerEmail: "eleanor.vance@neuro-research.org",
    customerPhone: "+1-555-019-2834",
    shippingAddress: {
      firstName: "Eleanor",
      lastName: "Vance",
      company: "BioAnalytics Laboratory",
      address: "100 Science Parkway, Suite 400",
      city: "Cambridge",
      state: "MA",
      zip: "02142",
      country: "United States",
      email: "eleanor.vance@neuro-research.org",
    },
    shippingMethodId: "standard",
    preferredPaymentMethod: "cashapp",
    promoCode: "FOUNDRY10",
    affiliateCode: "DRMIKE",
    ruoAgreed: true,
    items: [
      {
        productId: "vf-std-001",
        productName: "BPC-157 Reference Standard",
        configurationLabel: "Reference Materials Standard",
        quantity: 2,
        unitPriceAmount: 6400,
        priceStatus: "fixed",
        sku: "VF-SKU-991",
        lotNumber: "LOT-VF-8842",
      },
    ],
  };

  const result = checkoutSubmissionSchema.safeParse(validPayload);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.customerEmail, "eleanor.vance@neuro-research.org");
    assert.equal(result.data.items.length, 1);
    assert.equal(result.data.items[0].quantity, 2);
  }
});

test("checkoutSubmissionSchema rejects submission when RUO agreement is false", () => {
  const payload = {
    submissionKey: "vf_sub_test_01",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    shippingAddress: {
      firstName: "John",
      lastName: "Doe",
      address: "123 Main St",
      city: "Boston",
      state: "MA",
      zip: "02108",
      country: "United States",
      email: "john@example.com",
    },
    shippingMethodId: "standard",
    preferredPaymentMethod: "zelle",
    ruoAgreed: false, // Invalid: must be true
    items: [
      {
        productName: "BPC-157",
        quantity: 1,
        unitPriceAmount: 6400,
      },
    ],
  };

  const result = checkoutSubmissionSchema.safeParse(payload);
  assert.equal(result.success, false);
});

test("checkoutSubmissionSchema rejects empty items array", () => {
  const payload = {
    submissionKey: "vf_sub_test_02",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    shippingAddress: {
      firstName: "Jane",
      lastName: "Doe",
      address: "456 Oak St",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "United States",
      email: "jane@example.com",
    },
    shippingMethodId: "standard",
    preferredPaymentMethod: "crypto",
    ruoAgreed: true,
    items: [], // Invalid: min 1 item
  };

  const result = checkoutSubmissionSchema.safeParse(payload);
  assert.equal(result.success, false);
});

test("idempotent submission key simulation ensures duplicate requests return existing record", () => {
  // In-memory mock store representing Supabase manual_orders
  const mockDb = new Map();

  function processSubmission(submissionKey, orderData) {
    if (mockDb.has(submissionKey)) {
      return {
        ...mockDb.get(submissionKey),
        isDuplicate: true,
      };
    }
    const createdOrder = {
      id: "uuid-" + Math.random().toString(36).slice(2),
      order_number: "VF-998877",
      submission_key: submissionKey,
      ...orderData,
      isDuplicate: false,
    };
    mockDb.set(submissionKey, createdOrder);
    return createdOrder;
  }

  const key = "vf_sub_unique_123456";
  const order1 = processSubmission(key, { customer_email: "test@lab.org", total_amount: 19000 });
  assert.equal(order1.isDuplicate, false);
  assert.equal(mockDb.size, 1);

  // Duplicate second submission with same submissionKey
  const order2 = processSubmission(key, { customer_email: "test@lab.org", total_amount: 19000 });
  assert.equal(order2.isDuplicate, true);
  assert.equal(order2.id, order1.id);
  assert.equal(order2.order_number, order1.order_number);
  assert.equal(mockDb.size, 1); // No second order was inserted
});
