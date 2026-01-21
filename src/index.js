import "./style.css";
import logo from "./vite.svg";
import pkg from "../package.json"; // cant not import {name} from

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
  import(
    /*webpackChunkName: "printMe-async", webpackPreload: true */ "./js/printMe.js"
  ).then(({ default: printMe }) => {
    btn.onclick = printMe;
    element.appendChild(btn);
  });

  console.log("aaatt112211");

  import(
    /*webpackChunkName: "lodash-async", webpackPrefetch: true */ "lodash-es"
  ).then(({ join }) => {
    const p = document.createElement("p");
    p.innerHTML = join(["webpack", "test"]);
    element.appendChild(p);
  });

  return element;
}

document.body.appendChild(component());
