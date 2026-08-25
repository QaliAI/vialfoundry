import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveAliasCode,
  normalizeAffiliateCode,
  formatReferralLink,
  calculateOrderAffiliateCommission,
  percentToBps,
  bpsToPercent,
} from "../src/lib/affiliates/utils.mjs";

test("percentToBps and bpsToPercent conversions", () => {
  assert.equal(percentToBps(10), 1000);
  assert.equal(percentToBps(12.5), 1250);
  assert.equal(bpsToPercent(1000), 10);
  assert.equal(bpsToPercent(800), 8);
});

test("alias codes resolve to primary partner codes", () => {
  assert.equal(resolveAliasCode("vf01"), "PARTNER01");
  assert.equal(resolveAliasCode("vf02"), "PARTNER02");
  assert.equal(resolveAliasCode("labs"), "LABS10");
  assert.equal(resolveAliasCode("UNKNOWN"), "unknown");
});

test("formatReferralLink constructs clean canonical URL", () => {
  assert.equal(formatReferralLink("PARTNER01"), "https://vialfoundry.com/r/PARTNER01");
});

test("calculateOrderAffiliateCommission excludes shipping and applies bps", () => {
  const comm = calculateOrderAffiliateCommission({
    productSubtotalCents: 20000,
    shippingCents: 1500,
    rateBps: 1000, // 10%
  });

  assert.equal(comm.commissionCents, 2000);
  assert.equal(comm.shippingCentsExcluded, 1500);
});
