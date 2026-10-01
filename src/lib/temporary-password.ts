import { randomInt } from "node:crypto";

// No 0/O, 1/l/I: the password gets typed in from an email, possibly on a phone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Temporary password like "Xk7p-Qm4t-Rw9z": about 70 bits, readable, replaced at first sign-in. */
export function newTemporaryPassword() {
  const group = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${group()}-${group()}-${group()}`;
}
