import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

// The `simnet` object is available globally in the test environment
// It is typed and can be used directly
declare const simnet: any;

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("stx-lucky-pot contract tests", () => {

  it("initial pot balance should be 0", () => {
    const { result } = simnet.callReadOnlyFn("stx-lucky-pot", "get-pot-balance", [], deployer);
    expect(result).toBeUint(0);
  });

  it("should add to pot", () => {
    const { result } = simnet.callPublicFn("stx-lucky-pot", "add-to-pot", [Cl.uint(1000000)], deployer);
    expect(result).toBeOk(Cl.bool(true));

    const { result: balance } = simnet.callReadOnlyFn("stx-lucky-pot", "get-pot-balance", [], deployer);
    expect(balance).toBeUint(1000000);
  });

  it("should add more from another wallet", () => {
    // Add from deployer first
    simnet.callPublicFn("stx-lucky-pot", "add-to-pot", [Cl.uint(1000000)], deployer);
    // Add from wallet1
    const { result } = simnet.callPublicFn("stx-lucky-pot", "add-to-pot", [Cl.uint(500000)], wallet1);
    expect(result).toBeOk(Cl.bool(true));

    const { result: balance } = simnet.callReadOnlyFn("stx-lucky-pot", "get-pot-balance", [], deployer);
    expect(balance).toBeUint(1500000);
  });

  it("owner should withdraw pot", () => {
    // Add some STX first
    simnet.callPublicFn("stx-lucky-pot", "add-to-pot", [Cl.uint(1000000)], deployer);
    simnet.callPublicFn("stx-lucky-pot", "add-to-pot", [Cl.uint(500000)], wallet1);

    const { result } = simnet.callPublicFn("stx-lucky-pot", "withdraw-pot", [], deployer);
    expect(result).toBeOk(Cl.uint(1500000));

    const { result: balance } = simnet.callReadOnlyFn("stx-lucky-pot", "get-pot-balance", [], deployer);
    expect(balance).toBeUint(0);
  });

  it("should fail to add 0 amount", () => {
    const { result } = simnet.callPublicFn("stx-lucky-pot", "add-to-pot", [Cl.uint(0)], deployer);
    expect(result).toBeErr(Cl.uint(1));
  });

  it("non-owner should fail to withdraw", () => {
    // First add some STX
    simnet.callPublicFn("stx-lucky-pot", "add-to-pot", [Cl.uint(1000000)], deployer);

    const { result } = simnet.callPublicFn("stx-lucky-pot", "withdraw-pot", [], wallet1);
    expect(result).toBeErr(Cl.uint(2));
  });

});