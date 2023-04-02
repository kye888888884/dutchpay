const font = "Gowun Dodum";
const MONEYTEST_PRECISION = 0.05;

class App {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        // window.addEventListener('resize', this.resize.bind(this), false);
        window.requestAnimationFrame(this.animate.bind(this));

        this.nameBoxes = [];
        this.moneyLines = [];
        this.colors = [];
        this.coords = [];
        this.preWindowWidth = 0;
        this.preWindowHeight = 0;

        this.canvasSize = 0.9;
    }

    resize() {
        this.stageWidth = $(window).width() * this.canvasSize;
        this.stageHeight = $(window).height();

        this.canvas.width = this.stageWidth;
        this.canvas.height = this.stageHeight;

        this.ctx.scale(1, 1);

        // set elements's center
        this.moneyLines.forEach((moneyLine) => {
            moneyLine.resize(this);
        });

        this.nameBoxes.forEach((nameBox) => {
            nameBox.resize(this);
        });

        nameBoxSize =
            40 + (this.stageWidth - 200) / 60 - (nameBoxNumber - 3) * 3;
    }

    animate(t) {
        if (
            this.preWindowWidth != $(window).width() * this.canvasSize ||
            this.preWindowHeight != $(window).height()
        ) {
            this.preWindowWidth = $(window).width() * this.canvasSize;
            this.preWindowHeight = $(window).height();
            this.resize();
        }

        window.requestAnimationFrame(this.animate.bind(this));

        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);

        // draw elements
        this.moneyLines.forEach((moneyLine) => {
            moneyLine.drawLine(this.ctx);
        });

        this.nameBoxes.forEach((nameBox) => {
            nameBox.draw(this.ctx);
        });

        this.moneyLines.forEach((moneyLine) => {
            moneyLine.drawMoney(this.ctx);
        });
    }
}

class moneyLine {
    constructor(x1, y1, x2, y2, money, app, index1, index2, index, isLean) {
        // apply param of constructor
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.money = money;
        this.app = app;
        this.index1 = index1; // for setting colors
        this.index2 = index2;
        this.index = index;

        // line
        this.x2line = 0;
        this.y2line = 0;

        // arrow
        this.x2arrow = 0;
        this.y2arrow = 0;
        this.angle = 0;
        this.size = 0;
        this.height = 0;

        this.distance = 150;
        this.cx = 0;
        this.cy = 0;
        this.resize(app);

        this.color1 = "#ffffff";
        this.color2 = "#000000";

        this.moneyLines = this.app.moneyLines;

        this.dashOffset = 0;

        this.t = 0;
        var maxDistance = 0;

        var [x1, y1, x2, y2] = [this.x1, this.y1, this.x2, this.y2];
        for (var w = 0.1; w <= 0.9; w += MONEYTEST_PRECISION) {
            var mx = lerp(x1, x2, w);
            var my = lerp(y1, y2, w);
            var distance = Math.min(
                pointDistance(mx, my, x1, y1),
                pointDistance(mx, my, x2, y2)
            );
            for (var idx = 0; idx < this.moneyLines.length; idx++) {
                if (this.index === idx) continue;

                var [x3, y3] = [
                    this.moneyLines[idx].x1,
                    this.moneyLines[idx].y1,
                ];
                var [x4, y4] = [
                    this.moneyLines[idx].x2,
                    this.moneyLines[idx].y2,
                ];

                if (isSamePoint(x1, y1, x2, y2, x3, y3, x4, y4)) continue;

                var inter = getIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
                if (inter == null) continue;

                var [crossX, crossY] = inter;
                console.log(crossX, crossY);
                var dis = pointDistance(mx, my, crossX, crossY);
                if (distance < 0 || distance > dis) distance = dis;
            }

            if (maxDistance < distance) {
                maxDistance = distance;
                this.t = w;
            }
        }

        this.setColor(app);

        this.isLean = isLean;
        this.isMoneyDark = getColorValue(this.colorCenter) < 0.5;
    }

    drawLine(ctx) {
        var x1 = this.x1 + this.cx;
        var y1 = this.y1 + this.cy;
        var x2 = this.x2 + this.cx;
        var y2 = this.y2 + this.cy;

        // draw line
        var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size * 0.2;
        ctx.setLineDash([15, 5]);
        ctx.lineDashOffset = this.dashOffset;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(this.x2line + this.cx, this.y2line + this.cy);
        ctx.stroke();

        this.dashOffset -= 0.25;

        // draw arrow
        ctx.fillStyle = this.color2;
        ctx.translate(this.x2arrow + this.cx, this.y2arrow + this.cy);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(-this.size, -this.height);
        ctx.lineTo(0, 0);
        ctx.lineTo(-this.size, this.height);
        ctx.closePath();
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    drawMoney(ctx) {
        var mx = lerp(this.x1, this.x2, this.t) + this.cx;
        var my = lerp(this.y1, this.y2, this.t) + this.cy;

        // draw money background
        ctx.translate(mx, my + 1);
        let angle = getAngle(this.x1, this.y1, this.x2, this.y2);
        if (angle >= Math.PI * 0.5 && angle < Math.PI * 1.5) angle -= Math.PI;
        ctx.rotate(angle);

        // draw money
        ctx.font = `bold ${nameBoxSize * 0.5}px Gowun Dodum`;
        ctx.strokeStyle = this.colorCenter;
        ctx.setLineDash([]);
        ctx.fillStyle = this.isMoneyDark ? "#fff" : "#222";
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.strokeText(this.money, 0, 0);
        ctx.fillText(this.money, 0, 0);
        initShadow(ctx);

        ctx.rotate(-angle);
        ctx.translate(-mx, -(my + 1));
    }

    resize(app) {
        this.distance = getDistance(app);

        this.x1 = app.coords[this.index1]["x"] * this.distance;
        this.y1 = app.coords[this.index1]["y"] * this.distance;
        this.x2 = app.coords[this.index2]["x"] * this.distance;
        this.y2 = app.coords[this.index2]["y"] * this.distance;

        this.angle =
            -Math.atan2(this.x2 - this.x1, this.y2 - this.y1) + Math.PI * 0.5;
        this.size = Math.min(this.distance * 0.1 * (nameBoxSize / 30), 32);
        this.height = this.size * 0.5;

        // re-calculate coordinate of index-2 (considering with nameBoxSize)
        let length = Math.sqrt(
            Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2)
        );
        let ratio = 1 - nameBoxSize / length;
        this.x2arrow = lerp(this.x1, this.x2, ratio);
        this.y2arrow = lerp(this.y1, this.y2, ratio);
        ratio = 1 - (nameBoxSize + this.size) / length;
        this.x2line = lerp(this.x1, this.x2, ratio);
        this.y2line = lerp(this.y1, this.y2, ratio);

        this.cx = app.canvas.width / 2;
        this.cy = app.canvas.height / 2;
    }

    setColor(app) {
        this.color1 = hslToHex(this.app.colors[this.index1]);
        this.color2 = hslToHex(this.app.colors[this.index2]);
        this.colorCenter = lerpColor(this.color1, this.color2, this.t);
    }
}

class NameBox {
    constructor(x, y, radius, name, color, app, index) {
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.name = name;
        this.color = color;
        this.index = index;

        this.distance = 150;
        this.cx = 0;
        this.cy = 0;
        this.resize(app);
    }

    draw(ctx) {
        var x = this.getX();
        var y = this.getY();

        // draw circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        // draw name
        var len = this.name.length;
        var col = len == 4 ? 2 : 3;
        var raw = Math.floor((len + 2) / 3);
        var lines = splitText(this.name, col);
        var size = (nameBoxSize * 1.5) / lines[0].length;
        var sizeY = size * (raw - 1);
        for (var i = 0; i < lines.length; i++) {
            ctx.font = `${size}px Gowun Dodum`;
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";

            var oy = i * size;
            oy -= sizeY / 2;
            ctx.fillText(lines[i], x, y + oy);
        }
    }

    resize(app) {
        this.distance = getDistance(app);

        this.x = app.coords[this.index]["x"] * this.distance;
        this.y = app.coords[this.index]["y"] * this.distance;

        this.cx = app.canvas.width / 2;
        this.cy = app.canvas.height / 2;

        this.radius = nameBoxSize;
    }

    getX() {
        return this.x + this.cx;
    }

    getY() {
        return this.y + this.cy;
    }
}
