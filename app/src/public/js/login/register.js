"use strict";

const id = document.querySelector("#id"),
    name = document.querySelector("#name"),
    pass = document.querySelector("#pass"),
    confirmPass = document.querySelector("#confirm-pass"),
    registerBtn = document.querySelector("#button");

registerBtn.addEventListener("click", login);

function login() {
    if (!id.value) return alert("아이디를 입력해주세요.")
    if (pass !== confirmPass) return alert("비밀번호가 일치하지 않습니다.");
    
    const req = {
        id: id.value,
        name: name.value,
        pass: pass.value,
    };

    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(req)
    })
    .then((res) => res.json())
    .then((res) => {
        if (res.success) {
            location.href = "/login";
        } else {
            alert(res.msg);
        }
    })
    .catch((err) => {
        console.error(new Error("로그인 에러"));
    });
}