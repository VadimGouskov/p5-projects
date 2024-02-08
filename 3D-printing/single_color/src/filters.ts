export const addWaveFilter = (parentId: string, filterId: string) => {
  const root = document.getElementById(parentId);

  if (!root) {
    return;
  }

  var NS = "http://www.w3.org/2000/svg";

  // initialize filter
  var filter = document.createElementNS(NS, "filter");
  filter.setAttribute("id", "noise");

  // Turbulence filter
  var turbulence = document.createElementNS(NS, "feTurbulence");
  turbulence.setAttribute("type", "turbulence");
  turbulence.setAttribute("baseFrequency", "0.005 0.01");
  turbulence.setAttribute("result", "NOISE");
  turbulence.setAttribute("numOctaves", "1");

  // Displacement Map
  const displacementMap = document.createElementNS(NS, "feDisplacementMap");
  displacementMap.setAttribute("in", "SourceGraphic");
  displacementMap.setAttribute("in2", "NOISE");
  displacementMap.setAttribute("scale", "100");
  displacementMap.setAttribute("xChannelSelector", "R");
  displacementMap.setAttribute("yChannelSelector", "R");

  filter.appendChild(turbulence);
  filter.appendChild(displacementMap);
  root.appendChild(filter);
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
  filter.setAttribute("id", "noise");

  var blur = document.createElementNS(NS, "feGaussianBlur");
  blur.setAttribute("stdDeviation", "5");

  filter.appendChild(blur);
  root.appendChild(filter);
};
