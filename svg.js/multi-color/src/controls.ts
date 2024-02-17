type RangeConfig = {
  min?: number;
  max?: number;
  value?: number;
  step?: number;
};

const createRangeInput = ({
  min = 0,
  max = 10,
  value = 1,
  step = 0.1,
}: RangeConfig) => {
  const range = document.createElement("input");
  range.type = "range";
  range.min = min.toString();
  range.max = max.toString();
  range.value = value.toString();
  range.step = step.toString();

  range.style.marginRight = "16px";
  range.style.width = "400px";

  //   range.id = "range";
  return range;
};

const createLabel = (content: string) => {
  const label = document.createElement("label");
  label.innerHTML = content;
  label.style.minWidth = "100px";
  return label;
};

const createDiv = (content: string) => {
  const div = document.createElement("div");
  div.innerHTML = content;
  return div;
};

const appendElement = (range: HTMLElement, parentId: string) => {
  const parent = document.getElementById(parentId);
  if (parent) {
    parent.appendChild(range);
  }
};

export class RangeControl {
  value: number;
  range: HTMLInputElement;
  label: HTMLLabelElement;
  screen: HTMLDivElement;
  constructor(label = "", parentId: string, rangeConfig: RangeConfig) {
    this.range = createRangeInput(rangeConfig);
    this.label = createLabel(label);
    this.value = parseFloat(this.range.value);
    this.screen = createDiv(this.value.toString());

    this.range.oninput = (e) => {
      const target = e.target as HTMLInputElement;
      const parsedValue = parseFloat(target.value);

      this.onChange(parsedValue);
    };

    const container = document.createElement("div");

    container.style.display = "flex";

    container.appendChild(this.label);
    container.appendChild(this.range);
    container.appendChild(this.screen);

    appendElement(container, parentId);

    // appendElement(this.range, parentId);
    // appendElement(this.label, parentId);
    // appendElement(this.screen, parentId);
  }

  onChange = (value: number) => {
    this.value = value;
    this.screen.innerHTML = this.value.toString();
  };
}
