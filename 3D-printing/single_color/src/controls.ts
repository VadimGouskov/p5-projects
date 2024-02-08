const createRangeInput = () => {
  const range = document.createElement("input");
  range.type = "range";
  range.min = "0";
  range.max = "100";
  range.value = "50";
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
  constructor(parentId: string) {
    this.value = 50;
    const range = createRangeInput();

    range.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const parsedValue = parseInt(target.value);

      this.onChange(parsedValue);
    };

    appendInput(range, parentId);
  }

  onChange = (value: number) => {
    this.value = value;
  };
}
