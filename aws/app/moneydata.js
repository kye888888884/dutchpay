/*
    MoneyData는 돈을 관리하는 기능을 하는 함수형 클래스입니다.

    1. 생성자
        MoneyData(arrName, arrMoney)
        arrName: n개의 이름 문자열이 담긴 배열
        arrMoney: n개의 정수가 담긴 배열
    ex) A가 10000원, B가 30000원을 사용했을 경우:
        MoneyData(['A', 'B'], [10000, 30000])

    2. 프로퍼티
        n: arrName의 길이
        payInfo: 지출 내역을 담은 딕셔너리
        send: 송금 내용을 담은 2차원 행렬
        sum: 지출 금액 합계
        average: sum / n
        cutTotal: 절삭 금액 합계

    3. 메소드
        start: 초기화
        step1: 사용한 돈 저장
        step2: 단순화 1 (A->B ~ B->A)
        step3: 단순화 2 (A->B & B->C => A->C)
        step4: 양수화 (-A -> +A)
        cutMoney: 절삭
        calculateLoss: 절삭 손해 계산
        getMessageToSend: 송금 내용 딕셔너리 생성 및 반환
        getMessageToCut: 절삭 내용 딕셔너리 생성 및 반환
*/

/**
 * MoneyData is functional class for management and calculating about money.
 * Length of arrName and arrMoney must be equal.
 * @param {Array<string>} arrName Array of names
 * @param {Array<number>} arrMoney Array of spanding
 * @returns None
 */
function MoneyData(arrName, arrMoney) {
    if (arrName.length != arrMoney.length) {
        console.log("name size and money size are different.");
        return undefined;
    }

    // Properties

    /** Number of member
     * @type {number}*/
    this.n = Number(arrName.length);

    /** Dictinory containing details of spending
     * @type {Array<{ index: number, name: string, money: number, send: number, loss: number }>} */
    this.payInfo = new Array(this.n);

    /** 2D Array contaning infomation of sending money
     * @type {Array<Array<number>>} */
    this.send = create2DArray(this.n, this.n);

    /** Sum of spending
     * @type {number} */
    this.sum = 0;

    /** Average of spending
     * @type {number} */
    this.average = 0;

    /** Sum of cut money
     * @type {number} */
    this.cutTotal = 0;

    // Methods

    /**
     * Initialize this class.
     * @returns MoneyData
     */
    this.init = function () {
        return this;
    };

    this.getIndexOfName = function (name) {
        var index = -1;
        this.payInfo.forEach((v, i) => {
            if (v["name"] === name) {
                index = i;
            }
        });
        return index;
    };

    this.addAdditionalPay = function (name_from, name_to, money) {
        var index_from = this.getIndexOfName(name_from);
        var index_to = this.getIndexOfName(name_to);
        this.send[index_to][index_from] += money;
        return this;
    };

    /**
     *
     * @returns MoneyData
     */
    this.start = function () {
        // Create array object: [{name: paid money}] and calculate sum and average
        for (let i = 0; i < this.n; i++) {
            this.payInfo[i] = {
                index: i,
                name: arrName[i],
                money: arrMoney[i],
                send: 0,
                loss: 0,
            };
        }

        this.payInfo.sort(function (a, b) {
            return b["money"] - a["money"];
        });

        this.payInfo.forEach((value) => {
            this.sum += Number(value["money"]);
        });
        this.average = Math.round(this.sum / this.n);
        return this;
    };
    /**
     * Initialize 'sum' for calculating information of sending money.
     * @returns
     */
    this.step1 = function () {
        // Find the money to send each other.
        this.send.forEach((value, to, arr) => {
            value.forEach((_, from) => {
                if (from != to)
                    arr[from][to] = Math.floor(
                        this.payInfo[to]["money"] / this.n
                    );
            });
        });
        return this;
    };
    /**
     *
     * @returns
     */
    this.step2 = function () {
        // Calculate the difference between A->B and B->A
        // Theorem 1 of dutch algebra
        this.send.forEach((value, to, arr) => {
            value.forEach((_, from) => {
                if (arr[from][to] > arr[to][from]) {
                    arr[from][to] -= arr[to][from];
                    arr[to][from] = 0;
                } else {
                    arr[to][from] -= arr[from][to];
                    arr[from][to] = 0;
                }
            });
        });
        return this;
    };
    this.step3 = function () {
        // Simplify the progress of sending flow. make A->B and B->C to A->B and A->C
        for (var from = 0; from < this.n; from++) {
            for (var to = 0; to < this.n; to++) {
                if (from == to) continue;

                fst = this.send[from][to];
                if (fst <= 0) continue;

                for (var end = 0; end < this.n; end++) {
                    snd = this.send[to][end];
                    if (snd <= 0) continue;

                    min = fst < snd ? fst : snd;
                    this.send[from][to] -= min;
                    this.send[to][end] -= min;
                    if (from != end) this.send[from][end] += min;
                    break;
                }
            }
        }
        return this;
    };
    this.step4 = function () {
        // make (-) to (+)
        this.send.forEach((value, to, arr) => {
            value.forEach((_, from) => {
                if (arr[from][to] < 0) {
                    arr[to][from] -= arr[from][to];
                    arr[from][to] = 0;
                }
            });
        });
        return this;
    };
    this.cutMoney = function (cutUnit) {
        // cut money by unit.
        this.send.forEach((value, to, arr) => {
            value.forEach((_, from) => {
                if (arr[from][to] > 0) {
                    arr[from][to] = Math.floor(arr[from][to]);
                    let _money = arr[from][to];
                    _money = Math.round(_money / cutUnit) * cutUnit;
                    let _cut = arr[from][to] - _money;
                    arr[from][to] = _money;
                    this.cutTotal += _cut;
                }
            });
        });
        if (this.cutTotal % 10 == 9) this.cutTotal++;
        return this;
    };
    this.calculateLoss = function () {
        // calculate the loss or profit.
        var arrSend = new Array(this.n).fill(0);
        this.send.forEach((value, to, arr) => {
            value.forEach((_, from) => {
                arrSend[from] += arr[from][to];
                arrSend[to] -= arr[from][to];
            });
        });
        var arrLoss = new Array(this.n).fill(0); // array to store each cut-off money.
        this.payInfo.forEach((value, index, arr) => {
            arrLoss[index] = value["money"] + arrSend[index] - this.average;
            arr[index]["send"] = arrSend[index];
            arr[index]["loss"] = arrLoss[index];
        });
        return this;
    };
    this.getMessageToSend = function () {
        // return [taker's name, giver's name, money to send].
        var msg = [];
        this.send.forEach((value, to, arr) => {
            value.forEach((_, from) => {
                if (arr[from][to] > 0) {
                    msg.push([
                        this.payInfo[from]["name"],
                        this.payInfo[to]["name"],
                        arr[from][to],
                    ]);
                }
            });
        });
        return msg;
    };
    this.getMessageToCut = function () {
        // return [name, loss, (bool) isLoss].
        var msg = [];
        this.payInfo.forEach((value, index, arr) => {
            if (value["loss"] != 0)
                msg.push([this.payInfo[index]["name"], value["loss"]]);
        });
        return msg;
    };
    this.orderByIndex = this.payInfo.sort((a, b) => b["index"] - a["index"]);
}
