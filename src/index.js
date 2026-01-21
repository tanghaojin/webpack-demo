import "./style.css";
import logo from "./vite.svg";
import pkg from "../package.json"; // cant not import {name} from
import { printMe, sayHello } from "./js/printMe.js";
import calc from "./js/other.js";
import _ from "lodash-es";
function component() {
  const element = document.createElement("div");
  const btn = document.createElement("button");

  // test css
  element.innerHTML = `webpack hello ${pkg.name}`;
  element.classList.add("hello");
  // add image
  const img = new Image();
  img.src = logo;
  element.appendChild(img);

  btn.innerHTML = "Click me and check the console!";
  btn.onclick = printMe;
  element.appendChild(btn);

  calc("aaatt112211");
  const p = document.createElement("p");
  p.innerHTML = _.join(["webpack", "test"]);
  element.appendChild(p);

  return element;
}

document.body.appendChild(component());
