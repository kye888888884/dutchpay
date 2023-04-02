function getDistance(app) {
    return Math.min(100 + app.stageWidth * 0.2, app.stageHeight * 0.4);
}

// Utilities
function create2DArray(rows, columns) {
    var arr = new Array(rows);
    for (var i = 0; i < rows; i++) {
        arr[i] = new Array(columns);
    }
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < columns; col++) {
            arr[col][row] = 0;
        }
    }
    return arr;
}

function ToFixedNumber(number) {
    return Number(number.toFixed(3));
}

String.prototype.format = function () {
    var formatted = this,
        i = 0;
    var newArguments = [];
    for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        if (Array.isArray(arg)) newArguments.push(...arg);
        else newArguments.push(arg);
    }

    while (/%s/.test(formatted))
        formatted = formatted.replace("%s", newArguments[i++]);
    return formatted;
};

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}

function initShadow(ctx) {
    ctx.shadowColor = "white";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function splitText(str, len) {
    let lines = [];
    for (let i = 0; i < str.length; i += len) {
        lines.push(str.substr(i, len));
    }
    return lines;
}

function lerpColor(a, b, t) {
    const ah = parseInt(a.replace(/#/g, ""), 16);
    const [ar, ag, ab] = [ah >> 16, (ah >> 8) & 0xff, ah & 0xff];

    const bh = parseInt(b.replace(/#/g, ""), 16);
    const [br, bg, bb] = [bh >> 16, (bh >> 8) & 0xff, bh & 0xff];

    let [cr, cg, cb] = [lerp(ar, br, t), lerp(ag, bg, t), lerp(ab, bb, t)];
    [cr, cg, cb] = [Math.floor(cr), Math.floor(cg), Math.floor(cb)];

    return (
        "#" + ((1 << 24) + (cr << 16) + (cg << 8) + cb).toString(16).slice(1)
    );
}

function getColorValue(col) {
    const h = parseInt(col.replace(/#/g, ""), 16);
    const [r, g, b] = [h >> 16, (h >> 8) & 0xff, h & 0xff];

    return Math.floor((r + g + b) / (3 * 256));
}

function hslToString(hsl) {
    const r = /(?:hsl\()(\d+),\s*(\d+)\s*%,\s*(\d+)\s*%\)/g;
    const matches = r.exec(hsl);
    if (matches !== null) return [matches[1], matches[2], matches[3]];
    else return [0, 0, 0];
}

function hslToHex(hsl) {
    let [h, s, l] = hslToString(hsl);
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getAngle(x1, y1, x2, y2) {
    let angle = Math.atan2(y2 - y1, x2 - x1);
    if (angle < 0) angle += Math.PI * 2;
    return angle;
}

function getIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    // 첫 번째 선분의 방정식 계수 a1, b1, c1 구하기
    const a1 = y2 - y1;
    const b1 = x1 - x2;
    const c1 = x2 * y1 - x1 * y2;

    // 두 번째 선분의 방정식 계수 a2, b2, c2 구하기
    const a2 = y4 - y3;
    const b2 = x3 - x4;
    const c2 = x4 * y3 - x3 * y4;

    // 첫 번째 선분과 두 번째 선분이 교차하는지 확인
    const d = a1 * b2 - a2 * b1;
    if (d === 0) return null;

    // 교차점의 좌표 x, y 계산
    const x = (b1 * c2 - b2 * c1) / d;
    const y = (a2 * c1 - a1 * c2) / d;

    // 첫 번째 선분과 두 번째 선분의 범위 확인
    if (x < Math.min(x1, x2) || x > Math.max(x1, x2)) return null;
    if (x < Math.min(x3, x4) || x > Math.max(x3, x4)) return null;
    if (y < Math.min(y1, y2) || y > Math.max(y1, y2)) return null;
    if (y < Math.min(y3, y4) || y > Math.max(y3, y4)) return null;

    // 교차점 반환
    return [x, y];
}

function pointDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function isSamePoint(x1, y1, x2, y2, x3, y3, x4, y4) {
    if (x1 == x3 && y1 == y3) return true;
    if (x2 == x3 && y2 == y3) return true;
    if (x1 == x4 && y1 == y4) return true;
    if (x2 == x4 && y2 == y4) return true;
    return false;
}
