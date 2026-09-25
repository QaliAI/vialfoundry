import test from 'node:test';
import assert from 'node:assert';
import {
  classifyFulfillmentQueue,
  FULFILLMENT_QUEUES,
  isValidStatusTransition,
  isOrderReportableAsRevenue,
  MANUAL_ORDER_STATUSES,
} from '../src/lib/admin/order-classification.mjs';

test('order classification includes waiting_inventory and waiting_documentation', () => {
  assert.ok(MANUAL_ORDER_STATUSES.includes('waiting_inventory'));
  assert.ok(MANUAL_ORDER_STATUSES.includes('waiting_documentation'));
});

test('FULFILLMENT_QUEUES contains all 6 operational fulfillment queues', () => {
  const ids = FULFILLMENT_QUEUES.map((q) => q.id);
  assert.deepStrictEqual(ids, [
    'PAID_NEEDS_FULFILLMENT',
    'WAITING_ON_INVENTORY',
    'WAITING_ON_DOCUMENTATION',
    'SHIPPED',
    'DELIVERED_COMPLETED',
    'REFUND_EXCEPTION',
  ]);
});

test('classifyFulfillmentQueue assigns orders to exact operational queues', () => {
  // Refund / Exception
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'refunded', payment_status: 'paid' }),
    'REFUND_EXCEPTION',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'canceled', payment_status: 'paid' }),
    'REFUND_EXCEPTION',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'paid', payment_status: 'paid', amount_refunded: 500 }),
    'REFUND_EXCEPTION',
  );

  // Delivered / Completed
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'fulfilled', payment_status: 'paid' }),
    'DELIVERED_COMPLETED',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'delivered', payment_status: 'paid' }),
    'DELIVERED_COMPLETED',
  );

  // Shipped
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'shipped', payment_status: 'paid' }),
    'SHIPPED',
  );

  // Waiting on inventory
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'waiting_inventory', payment_status: 'paid' }),
    'WAITING_ON_INVENTORY',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'paid', payment_status: 'paid', inventory_status: 'oversell' }),
    'WAITING_ON_INVENTORY',
  );

  // Waiting on documentation
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'waiting_documentation', payment_status: 'paid' }),
    'WAITING_ON_DOCUMENTATION',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'paid', payment_status: 'paid', documentation_status: 'pending' }),
    'WAITING_ON_DOCUMENTATION',
  );

  // Paid — Needs Fulfillment
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'paid', payment_status: 'paid' }),
    'PAID_NEEDS_FULFILLMENT',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'preparing', payment_status: 'paid' }),
    'PAID_NEEDS_FULFILLMENT',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'packed', payment_status: 'paid' }),
    'PAID_NEEDS_FULFILLMENT',
  );

  // Awaiting Payment
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'new', payment_status: 'pending_payment' }),
    'AWAITING_PAYMENT',
  );
  assert.strictEqual(
    classifyFulfillmentQueue({ status: 'pending_payment', payment_status: 'pending_payment' }),
    'AWAITING_PAYMENT',
  );
});

test('status transitions allow moving between paid, waiting_inventory, and packaging states', () => {
  assert.ok(isValidStatusTransition('paid', 'waiting_inventory'));
  assert.ok(isValidStatusTransition('paid', 'waiting_documentation'));
  assert.ok(isValidStatusTransition('paid', 'preparing'));
  assert.ok(isValidStatusTransition('waiting_inventory', 'preparing'));
  assert.ok(isValidStatusTransition('waiting_inventory', 'packed'));
  assert.ok(isValidStatusTransition('waiting_inventory', 'shipped'));
  assert.ok(isValidStatusTransition('waiting_documentation', 'preparing'));
  assert.ok(isValidStatusTransition('preparing', 'shipped'));
  assert.ok(isValidStatusTransition('shipped', 'fulfilled'));
});

test('isOrderReportableAsRevenue counts waiting_inventory and waiting_documentation as revenue', () => {
  assert.strictEqual(isOrderReportableAsRevenue({ status: 'paid' }), true);
  assert.strictEqual(isOrderReportableAsRevenue({ status: 'waiting_inventory' }), true);
  assert.strictEqual(isOrderReportableAsRevenue({ status: 'waiting_documentation' }), true);
  assert.strictEqual(isOrderReportableAsRevenue({ status: 'pending_payment' }), false);
  assert.strictEqual(isOrderReportableAsRevenue({ status: 'canceled' }), false);
  assert.strictEqual(isOrderReportableAsRevenue({ status: 'refunded' }), false);
});
