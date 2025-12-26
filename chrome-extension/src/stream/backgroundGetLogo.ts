import flow128_png from './img/flow128.png';
import flow128w_png from './img/flow128w.png';

function getLogoUrl(darkBackground: boolean) {
    return darkBackground ? flow128w_png : flow128_png
}

export { getLogoUrl }
