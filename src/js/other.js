import { cube, tt } from "./math";
import "../style.css";

export default function calc(t) {
  console.log(t);
}

function component() {
  const element = document.createElement("pre");
  element.innerHTML = ["Hello webpack!", "5 cubed is equal to " + cube(5)].join(
    "\n\n",
  );
  const name = tt();
  import(`./math${name}.js`).then((value) => {
    console.log("math-value", value.double(2));
  });
  return element;
}

document.body.appendChild(component());
