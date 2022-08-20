"use strict";

function getResult() {
    var sum = 0;
    var arrName = new Array();
    var arrMoney = new Array();
    $(".name").each(function (index, item) {
        let name = $(item).val();
        arrName.push(name);
    });
    $(".number").each(function (index, item) {
        let num = Number($(item).val());
        arrMoney.push(num);
        sum += num;
    });

    $("#sum").html(String(sum));
    $("#result").empty();
    calMoney(arrName, arrMoney);
}

function addMember() {
    var number = 0;
    $(".name").each( () => number++ );

    if (number < 10) {
        $(".name:last").clone().appendTo('div.input-container');
        $(".number:last").clone().appendTo('div.input-container');
    }
}

function removeMember() {
    var number = 0;
    $(".name").each( () => number++ );

    if (number > 2) {
        $(".name:last").remove();
        $(".number:last").remove();
    }
}

function calMoney(arrName, arrMoney) {
    var cutUnit = Number($("input#cut:checked").val());
    let moneyData = new MoneyData(arrName, arrMoney)
                        ?.start()
                        .step1()
                        .step2()
                        .step3()
                        .step4()
                        .cutMoney(cutUnit)
                        .calculateLoss();

    // indicate the result.
    {
    let div = "<div>인당 지출 금액: " + String(moneyData.average);
    $("#result").append(div);
    }

    moneyData.getMessageToSend().forEach( (value) => {
        $("#result").append("<div>%s님이 %s님에게: %s".format(value));
    });
    
    $("#result").append("<div>절삭된 금액: %s".format(moneyData.cutTotal));

    moneyData.getMessageToCut().forEach( (value) => {
        let msg = value.slice();
        msg.splice(1, 0, (msg[1] > 0) ? "손해" : "이득");
        msg[2] = Math.abs(msg[2]);
        $("#result").append("<div>절삭으로 인한 %s님의 %s: %s".format(msg));
    });
}

function MoneyData(arrName, arrMoney) {
    if (arrName.length != arrMoney.length) {
        console.log("name size and money size are different.");
        return undefined;
    }
    
    // properties
    this.n = arrName.length;
    this.payInfo = new Array(this.n);
    this.send = create2DArray(this.n, this.n);
    this.sum = 0;
    this.average = 0;
    this.cutTotal = 0;

    // functions
    this.start = function() { // Create array object: [{name: paid money}] and calculate sum and average
        for(let i = 0; i < this.n; i++) {
            this.payInfo[i] = {
                'index': i,
                'name': arrName[i],
                'money': arrMoney[i],
                'send': 0,
                'loss': 0,
            };
        }
        this.payInfo.sort(function(a, b) { return b['money'] - a['money'] });

        this.payInfo.forEach( value => {
            this.sum += value['money'];
        });
        this.average = Math.round(this.sum / this.n);
        return this;
    }
    this.step1 = function() { // Find the money to send each other.
        this.send.forEach( (value, taker, arr) => {
            value.forEach( (_, giver) => {
                if (taker != giver)
                    arr[taker][giver] = Math.floor(this.payInfo[taker]['money'] / this.n);
            });
        });
        return this;
    }
    this.step2 = function() { // Calculate the difference between A->B and B->A
        this.send.forEach( (value, taker, arr) => {
            value.forEach( (_, giver) => {
                if (giver > taker) {
                    var trans = arr[giver][taker]; // transposed
                    arr[taker][giver] -= trans;
                    arr[giver][taker] = 0;
                }
            });
        });
        return this;
    }
    this.step3 = function() { // Simplify the progress of sending flow. make A->B and B->C to A->B and A->C
        this.send.forEach( (value, taker, arr) => {
            value.forEach( (_, giver) => {
                if (giver > taker) {
                    for (let restTaker = giver - 1; restTaker >= 0; restTaker--) {
                        if (arr[restTaker][taker] != 0) {
                            arr[taker][giver] -= arr[restTaker][taker];
                            arr[restTaker][giver] += arr[restTaker][taker];
                            arr[restTaker][taker] = 0;
                        }
                    }
                }
            });
        });
        return this;
    }
    this.step4 = function() { // make (-) to (+)
        this.send.forEach( (value, taker, arr) => {
            value.forEach( (_, giver) => {
                if (arr[taker][giver] < 0) {
                    arr[giver][taker] -= arr[taker][giver];
                    arr[taker][giver] = 0;
                }
            });
        });
        return this;
    }
    this.cutMoney = function(cutUnit) { // cut money by unit.
        this.send.forEach( (value, taker, arr) => {
            value.forEach( (_, giver) => {
                if (arr[taker][giver] > 0) {
                    arr[taker][giver] = Math.floor(arr[taker][giver]);
                    let _money = arr[taker][giver];
                    _money = Math.round(_money / cutUnit) * cutUnit;
                    let _cut = arr[taker][giver] - _money;
                    arr[taker][giver] = _money;
                    this.cutTotal += _cut;
                }
            });
        });
        if (this.cutTotal % 10 == 9)
            this.cutTotal++;
        return this;
    }
    this.calculateLoss = function() { // calculate the loss or profit.
        var arrSend = new Array(this.n).fill(0);
        this.send.forEach( (value, taker, arr) => {
            value.forEach( (_, giver) => {
                arrSend[giver] += arr[taker][giver];
                arrSend[taker] -= arr[taker][giver];
            });
        });
        var arrLoss = new Array(this.n).fill(0); // array to store each cut-off money.
        // for (let i = 0; i < this.n; i++) {
        //     arrLoss[i] = this.payInfo[i]["money"] + arrSend[i] - this.average;
        // }
        this.payInfo.forEach( (value, index, arr) => {
            arrLoss[index] = value['money'] + arrSend[index] - this.average;
            arr[index]['send'] = arrSend[index];
            arr[index]['loss'] = arrLoss[index];
        })
        return this;
    }
    this.getMessageToSend = function() { // return [taker's name, giver's name, money to send].
        var msg = [];
        this.send.forEach( (value, taker, arr) => {
            value.forEach( (_, giver) => {
                if (arr[taker][giver] > 0) {
                    msg.push([this.payInfo[giver]['name'],
                        this.payInfo[taker]['name'],
                        arr[taker][giver]]);
                }
            });
        });
        return msg;
    }
    this.getMessageToCut = function() { // return [name, loss, (bool) isLoss].
        var msg = [];
        this.payInfo.forEach( (value, index, arr) => {
            if (value['loss'] != 0)
                msg.push([this.payInfo[index]['name'], value['loss']]);
        });
        return msg;
    }
    this.orderByIndex = this.payInfo.sort((a, b) => b['index'] - a['index']);
}

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

String.prototype.format = function() {
    var formatted = this, i = 0;
    var newArguments = [];
    for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        if (Array.isArray(arg))
            newArguments.push(...arg);
        else
            newArguments.push(arg);
    }
    
    while (/%s/.test(formatted))
    	formatted = formatted.replace("%s", newArguments[i++]);
    return formatted;
}