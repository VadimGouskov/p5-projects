import { DisplacementFilter, DisplacementMapConfig } from "./displacement";
import { TurbulenceFilter, TurbulenceFilterConfig } from "./turbulence";

type WaveFilterConfig = {
  turbulence?: TurbulenceFilterConfig;
  displacementMap?: DisplacementMapConfig;
};

export type WaveFilter = {
  turbulence: Element;
  displacementMap: Element;
};

export const addWaveFilter = (
  parentId: string,
  filterId: string,
  config?: WaveFilterConfig
): WaveFilter | undefined => {
  const root = document.getElementById(parentId);

  if (!root) {
    return;
  }

  var NS = "http://www.w3.org/2000/svg";

  // initialize filter
  var filter = document.createElementNS(NS, "filter");
  filter.setAttribute("id", filterId);

  const turbulence = new TurbulenceFilter(config?.turbulence);
  const displacementMap = new DisplacementFilter(config?.displacementMap);

  filter.appendChild(turbulence.element);
  filter.appendChild(displacementMap.element);
  root.appendChild(filter);

  return {
    turbulence: turbulence.element,
    displacementMap: displacementMap.element,
  };
};

`
<filter id='noise' x='0%' y='0%' width='100%' height='100%'>
        <feTurbulence type="turbulence" baseFrequency="0 0.2" result="NOISE" numOctaves="2" />
        <feDisplacementMap in="SourceGraphic" in2="NOISE" scale="30" xChannelSelector="R" yChannelSelector="R"></feDisplacementMap>
</filter>
`;

export const addBlurFilter = (parentId: string, filterId: string) => {
  const root = document.getElementById(parentId);

  if (!root) {
    return;
  }

  var NS = "http://www.w3.org/2000/svg";

  var filter = document.createElementNS(NS, "filter");
  filter.setAttribute("id", filterId);

  var blur = document.createElementNS(NS, "feGaussianBlur");
  blur.setAttribute("stdDeviation", "5");

  filter.appendChild(blur);
  root.appendChild(filter);
};
