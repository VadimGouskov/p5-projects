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

const createInput = ({
  min = 0,
  max = 10,
  value = 1,
  step = 0.1,
}: RangeConfig) => {
  const input = document.createElement("input");
  input.type = "number";
  input.min = min.toString();
  input.max = max.toString();
  input.value = value.toString();
  input.step = step.toString();
  input.style.width = "75px";

  return input;
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
  input: HTMLInputElement;
  constructor(label = "", parentId: string, rangeConfig: RangeConfig) {
    this.range = createRangeInput(rangeConfig);
    this.input = createInput(rangeConfig);
    this.label = createLabel(label);
    this.value = parseFloat(this.range.value);

    this.range.oninput = (e) => {
      const target = e.target as HTMLInputElement;
      // reflect value on input
      this.input.value = target.value;

      // single source of truth
      const parsedValue = parseFloat(target.value);
      this.onChange(parsedValue);
    };

    this.input.oninput = (e) => {
      const target = e.target as HTMLInputElement;
      this.range.value = target.value;

      const parsedValue = parseFloat(target.value);
      this.onChange(parsedValue);
    };

    const container = document.createElement("div");

    container.style.display = "flex";

    container.appendChild(this.label);
    container.appendChild(this.range);
    container.appendChild(this.input);

    appendElement(container, parentId);
  }

  onChange = (value: number) => {
    this.value = value;
  };
}
