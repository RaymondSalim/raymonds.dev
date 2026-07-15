export interface Dimensions {
  pixels?: number
  rem?: number
  vh?: number
  vw?: number
  cm?: number
  mm?: number
  q?: number
  in?: number
  pc?: number
  pt?: number
}

interface ScreenSize {
  width: number
  height: number
  innerWidth: number
  innerHeight: number
}

function getScreenSize(): ScreenSize {
  const { screen } = window;
  return {
    width: screen.width,
    height: screen.height,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
  };
}

function getScreenDPI(): number {
  const div = document.createElement('div');
  const id = `${Math.floor(Math.random() * 9000)}_random`;
  div.style.height = '1in';
  div.style.width = '1in';
  div.style.position = 'fixed';
  div.style.left = '-10000px';
  div.id = id;

  document.body.append(div);

  const devicePixelRatio = window.devicePixelRatio || 1;

  const el = document.getElementById(id)!!;
  const dpiX = el.offsetWidth * devicePixelRatio;
  el.remove();

  return dpiX;
}

function convertFromPixels(px: number, dpi: number, screenSize: ScreenSize): Dimensions {
  const cmPerInch = 2.54;
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return {
    pixels: px,
    rem: px / fontSize,
    vh: (screenSize.innerHeight * 100) / (dpi * px),
    vw: px / screenSize.innerWidth,
    cm: (px * cmPerInch) / dpi,
    mm: (px * cmPerInch * 10) / dpi,
    q: (px * cmPerInch * 40) / dpi,
    in: px / dpi,
    pc: (px * 6) / dpi,
    pt: (px * 72) / dpi,
  };
}

function convertFromRem(rem: number, dpi: number, screenSize: ScreenSize) {
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const px = rem * fontSize;
  return convertFromPixels(px, dpi, screenSize);
}

/**
 * Returns converted dimensions
 *
 * @params px, rem - only one is required, if more than one parameter is specified, only one will be considered in that order (px, rem)
 * @return Dimensions - an object containing all the converted dimension
 */
export function convert(px?: number, rem?: number): Dimensions | null {
  const screenSize = getScreenSize();
  const dpi = getScreenDPI();

  if (px != null) {
    return convertFromPixels(px, dpi, screenSize);
  }

  if (rem != null) {
    return convertFromRem(rem, dpi, screenSize);
  }

  return null;
}

/**
 * Calculate the height (including border, padding, margin, scrollbar) of a HTMLElement
 *
 * @param element the element to be calculated
 * @return number - sum of height, or 0
 */
export function getOuterHeight(element: HTMLElement | null): number {
  return (
    (element?.offsetHeight ?? 0)
      + Number(element?.style.marginTop)
      + Number(element?.style.marginBottom)
  );
}
