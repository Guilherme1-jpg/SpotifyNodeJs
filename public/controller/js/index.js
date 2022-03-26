import Controller from "./controller";
import View from "./view";
import Service from "./service";

const url = `${window.location.origin}/controller`;
Controller.initalize({
  view: new View(),
  service: new Service({ url }),
});
