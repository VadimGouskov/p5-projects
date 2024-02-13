var NS = "http://www.w3.org/2000/svg";

export type DisplacementMapConfig = {
  in: string;
  in2: string;
  scale?: string;
  xChannelSelector?: string;
  yChannelSelector?: string;
};

export class DisplacementFilter {
  element: Element;

  constructor(config?: DisplacementMapConfig) {
    const displacementMap = document.createElementNS(NS, "feDisplacementMap");
    displacementMap.setAttribute("in", "SourceGraphic");
    displacementMap.setAttribute("in2", "NOISE");
    displacementMap.setAttribute("scale", config?.scale || "100");
    displacementMap.setAttribute("xChannelSelector", "R");
    displacementMap.setAttribute("yChannelSelector", "R");

    this.element = displacementMap;
  }
}
