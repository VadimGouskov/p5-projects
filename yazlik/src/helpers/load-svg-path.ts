import svgpath from "svgpath";
import loadSvgFile from "load-svg-file/dist/load-svg-file.es6"

export const loadSvgPath = (src: string, w?: number, h?:number): Promise<string> => {
        const targetClass = src.replace(".", "-").replace("/", "_");
        return loadSvgFile(`${src}`, {
            class: targetClass, 
          }).then(() => {
            console.log('SVG Loaded successfully')
            const element = document.querySelector(`.${targetClass}`)
            const svg =  element?.querySelector("svg");
            let width = svg?.getAttribute("width");
            let height = svg?.getAttribute("height");


            if(!width || !height ) {
                const viewBox = svg?.getAttribute("viewBox")
                if(!viewBox) {
                    throw Error("no width, height or viewbox not found")
                    return;
                }
                const viewBoxValues = viewBox.split(" ");
                width = viewBoxValues[2];
                height = viewBoxValues[3];
            }

            const path = svg?.querySelector("path");

            let targetPath = path?.getAttribute("d") || "";
            targetPath = svgpath(targetPath)
                            .scale(1/parseInt(width), 1/parseInt(height))
                            .scale(w || parseInt(width), h || parseInt(height)) 
                            .toString();

            // TODO HTML cleanup
            return targetPath;
        })
} 