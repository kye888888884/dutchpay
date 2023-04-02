"use strict";

const MAX_MEMBER = 10;
const MAX_NAME_LENGTH = 9;

var app;
window.onload = () => {
    app = new App();
    app.resize();
};

const font = "Gowun Dodum";
var nameBoxSize = 50;
var nameBoxNumber = 3;

$(".name").keyup(function () {
    if (this.value.length >= MAX_NAME_LENGTH) {
        console.log("이름 제한");
        this.setCustomValidity(
            `이름은 최대 ${MAX_NAME_LENGTH}자까지만 입력할 수 있습니다.`
        );
    } else this.setCustomValidity("");
});
$(".name").change(function () {
    updateAdditionalNames();
});
$(".money").keyup(function () {
    this.setCustomValidity("");
});
$("#additional").click(function () {
    var field = document.createElement("div");
    var slt1 = document.createElement("select");
    var slt2 = document.createElement("select");
    var input = document.createElement("input");
    var span1 = document.createElement("span");
    var span2 = document.createElement("span");
    field.className = "additional-field";
    slt1.className = "additional-select select-from";
    slt2.className = "additional-select select-to";
    input.type = "number";
    span1.innerText = "이 ";
    span2.innerText = "에게 ";
    field.append(slt1);
    field.append(span1);
    field.append(slt2);
    field.append(span2);
    field.append(input);

    $(".additional-container").append(field);

    updateAdditionalNames();
});

function updateAdditionalNames() {
    $(".additional-select").each(function (index, item) {
        var idx = item.selectedIndex;
        var arrName = getNames();
        item.innerHTML = "";
        arrName.forEach((v, i) => {
            var option = document.createElement("option");
            option.innerText = `${v}`;
            item.append(option);
        });
        item.selectedIndex = idx < 0 ? 0 : idx;
    });
}

function getNames() {
    var arrName = [];
    $(".name").each(function (index, item) {
        let name = $(item).val();
        arrName.push(name);
    });
    return arrName;
}

// Dutch pay
function getResult() {
    // Name is empty one or more, stop
    var isNameEmpty = false;
    $(".name").each(function (index, item) {
        if ($(item).val() === "") {
            isNameEmpty = true;
            this.setCustomValidity("이름을 입력해주세요.");
        } else this.setCustomValidity("");
    });
    if (isNameEmpty) {
        return;
    }

    var sum = 0;
    var arrName = getNames();
    var arrMoney = new Array();

    // Name is duplicated, stop
    var dupIndexes = [];
    arrName.forEach((element, index) => {
        if (arrName.indexOf(element) !== index) dupIndexes.push(index);
    });

    if (dupIndexes.length > 0) {
        $(".name").each(function (index, item) {
            if (dupIndexes.indexOf(index) != -1)
                this.setCustomValidity("이름이 중복됩니다.");
            else this.setCustomValidity("");
        });
        return;
    }

    $(".number").each(function (index, item) {
        let num = Number($(item).val());
        arrMoney.push(num);
        sum += num;
    });

    $("#sum").html(String(sum));
    $("#result").empty();

    var moneyData = calMoney(arrName, arrMoney);
    drawResult(arrName, moneyData);
}

function drawResult(arrName, moneyData) {
    nameBoxNumber = moneyData.n;
    app.resize();

    // set colors and coordinates
    app.colors = [];
    app.coords = [];
    for (let i = 0; i < moneyData.n; i++) {
        let colorH = (i / moneyData.n) * 255 + 25;
        app.colors.push(`hsl(${colorH}, 80%, 40%)`);

        let x = Math.cos(((-i / moneyData.n) * 2 - 0.5) * Math.PI);
        let y = Math.sin(((-i / moneyData.n) * 2 - 0.5) * Math.PI);

        app.coords.push({ x, y });
    }

    // create elements
    app.nameBoxes = [];
    app.moneyLines = [];
    for (let i = 0; i < moneyData.n; i++) {
        let name = String(arrName[i]);

        // create nameBoxes
        let { x, y } = app.coords[i];
        app.nameBoxes.push(
            new NameBox(x, y, nameBoxSize, name, app.colors[i], app, i)
        );
    }

    // create moenylines
    moneyData.getMessageToSend().forEach((value) => {
        let index1 = arrName.indexOf(value[0]);
        let index2 = arrName.indexOf(value[1]);

        if (index1 != -1 && index2 != -1) {
            app.moneyLines.push(
                new moneyLine(
                    app.coords[index1]["x"],
                    app.coords[index1]["y"],
                    app.coords[index2]["x"],
                    app.coords[index2]["y"],
                    value[2],
                    app,
                    index1,
                    index2
                )
            );
        }
    });

    scrollSmoothToCanvas();
}

function addMember() {
    var number = 0;
    $(".name").each(() => number++);

    if (number < 10) {
        $(".name:last")
            .clone()
            .attr("value", "")
            .appendTo("div.input-container");
        $(".number:last")
            .clone()
            .attr("value", "")
            .appendTo("div.input-container");
        if (number == 10 - 1) $("#add-button").attr("disabled", true);
    }
}

function removeMember() {
    var number = 0;
    $(".name").each(() => number++);

    if (number > 2) {
        $(".name:last").remove();
        $(".number:last").remove();
    }

    $("#add-button").attr("disabled", false);
}

function calMoney(arrName, arrMoney) {
    var cutUnit = Number($("input.cut-input:checked").val());
    let moneyData = new MoneyData(arrName, arrMoney)?.start().step1();

    $(".additional-field").each((i, v) => {
        var name_from = v.childNodes[0].value;
        var name_to = v.childNodes[2].value;
        var money = Number(v.childNodes[4].value);
        moneyData = moneyData.addAdditionalPay(name_from, name_to, money);
    });

    moneyData = moneyData.step2().step3();

    moneyData = moneyData.cutMoney(cutUnit).calculateLoss();

    // indicate the result.
    {
        let div = "<div>인당 지출 금액: " + String(moneyData.average);
        $("#result").append(div);
    }

    moneyData.getMessageToCut().forEach((value) => {
        let msg = value.slice();
        msg.splice(1, 0, msg[1] > 0 ? "손해" : "이득");
        msg[2] = Math.abs(msg[2]);
        $("#result").append("<div>절삭으로 인한 %s님의 %s: %s".format(msg));
    });

    return moneyData;
}

// Scroll
function scrollSmooth(isDown) {
    window.scrollTo({
        behavior: "smooth",
        left: 0,
        top: isDown ? document.body.scrollHeight : 0,
    });
}

function scrollSmoothToCanvas() {
    window.scrollTo({
        behavior: "smooth",
        left: 0,
        top: $("#result-canvas").offset().top,
    });
}

// Draw
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
    constructor(x1, y1, x2, y2, money, app, index1, index2) {
        // apply param of constructor
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.money = money;
        this.app = app;
        this.index1 = index1; // for setting colors
        this.index2 = index2;

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
        this.setColor(app);

        this.dashOffset = 0;
    }

    drawLine(ctx) {
        var x1 = this.x1 + this.cx;
        var y1 = this.y1 + this.cy;
        var x2 = this.x2 + this.cx;
        var y2 = this.y2 + this.cy;
        var mx = (x1 + x2) * 0.5;
        var my = (y1 + y2) * 0.5;

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
        var mx = this.x1 * 0.3 + this.x2 * 0.7 + this.cx;
        var my = this.y1 * 0.3 + this.y2 * 0.7 + this.cy;

        // draw money background
        ctx.font = `bold ${nameBoxSize * 0.5}px Gowun Dodum`;
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#ffffff";
        ctx.setLineDash([]);
        ctx.textAlign = "center";
        ctx.lineWidth = nameBoxSize * 0.1;
        ctx.strokeText(this.money, mx, my + 1);

        // draw money
        ctx.font = `bold ${nameBoxSize * 0.5}px Gowun Dodum`;
        ctx.fillStyle = "#222222";
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(this.money, mx, my + 1);
        initShadow(ctx);
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
        this.color1 = this.app.colors[this.index1];
        this.color2 = this.app.colors[this.index2];
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
