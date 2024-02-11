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

  //   range.id = "range";
  return range;
};

const appendInput = (range: HTMLInputElement, parentId: string) => {
  const parent = document.getElementById(parentId);
  if (parent) {
    parent.appendChild(range);
  }
};

export class Control {
  value: number;
  constructor(parentId: string, rangeConfig: RangeConfig) {
    const range = createRangeInput(rangeConfig);
    this.value = parseFloat(range.value);

    range.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const parsedValue = parseFloat(target.value);

      this.onChange(parsedValue);
    };

    appendInput(range, parentId);
  }

  onChange = (value: number) => {
    this.value = value;
  };
}
