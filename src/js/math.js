import { a, double } from "./mathA";

export function square(x) {
  return x * x;
}

export function cube(x) {
  return x * x * x;
}

export function tt() {
  return "A";
}

console.log("a:", a);
double();
console.log("a:", a);
