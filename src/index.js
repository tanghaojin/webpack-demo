import "./style.css";
import logo from "./vite.svg";
import cdata from "./data.csv";
import xdata from "./data.xml";
import pkg from "../package.json"; // cant not import {name} from
function component() {
  const element = document.createElement("div");

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = `webpack hello ${pkg.name}`;
  element.classList.add("hello");
  const img = new Image();
  img.src = logo;
  element.appendChild(img);

  console.log(cdata);
  console.log(xdata);

  return element;
}

document.body.appendChild(component());
