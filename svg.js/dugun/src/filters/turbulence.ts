var NS = "http://www.w3.org/2000/svg";

export type TurbulenceFilterConfig = {
  type?: string;
  baseFrequency?: string;
  result?: string;
  numOctaves?: string;
};

export class TurbulenceFilter {
  element: Element;
  constructor(config?: TurbulenceFilterConfig) {
    var turbulence = document.createElementNS(NS, "feTurbulence");
    turbulence.setAttribute("type", "turbulence");
    turbulence.setAttribute("baseFrequency", "0.005 0.01");
    turbulence.setAttribute("result", "NOISE");
    turbulence.setAttribute("numOctaves", config?.numOctaves || "1");
    this.element = turbulence;
  }
}
