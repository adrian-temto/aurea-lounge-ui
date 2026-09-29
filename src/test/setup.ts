import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  if (typeof document === "undefined") return;
  // Each test starts as a first-time visitor.
  document.cookie.split("; ").forEach((c) => {
    const name = c.split("=")[0];
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
});

// jsdom does not implement modal dialogs; mimic the parts the consent dialog uses.
// (Absent in tests that run in the node environment, e.g. proxy.test.ts.)
const proto = typeof HTMLDialogElement === "undefined" ? null : HTMLDialogElement.prototype;
if (proto && !proto.showModal) {
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
}
if (proto && !proto.close) {
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
