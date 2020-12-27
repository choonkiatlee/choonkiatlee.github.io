---
layout: post
title: "JPake Calculator"
tags: [Yakk]
toc: false
icon: /img/cats/algo.svg
keywords: JPake Yakk pake cryptography encription elliptical modular discrete log
---

## JPake Calculator

This is a simple demo of the JPake JS library showing the key exchange between the 2 parties. 

After inputting the shared password and going through the 2 rounds of message passing, both Alice and Bob should have the same shared key if and only if they originally had the same password. 


<!-- HTML Layout of the below code.
|                                                                               | Alice                            | Bob                            |
| ----------------------------------------------------------------------------- | -------------------------------- | ------------------------------ |
| Input <br/>Shared Password:                                                   | <input id="AliceSecret"></input> | <input id="BobSecret"></input> |
| <button id="round1btn" class="button blue">Start<br/>Round 1</button>         | <pre id="AliceMsg1"></pre>       | <pre id="BobMsg1"></pre>       |
| <button id="round2btn" class="button blue">Start<br/>Round 2</button>         | <pre id="AliceMsg2"></pre>       | <pre id="BobMsg2"></pre>       |
| <button id="sharedkeybtn" class="button blue">Get<br/>Shared<br/>Key</button> | <pre id="alicesharedkey"></pre>  | <pre id="bobsharedkey"></pre>  | -->

<table style="width:">
    <thead>
        <tr>
            <th style="width:200px"></th>
            <th>Alice</th>
            <th>Bob</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Input<br/>Shared Password:</td>
            <td><input id="AliceSecret"></input></td>
            <td><input id="BobSecret"></input></td>
        </tr>
        <tr>
            <td><button id="round1btn" class="button blue">Start<br/>Round 1</button><p id="round1errmsg" style="text-align:center;color:red;"><br/></p></td>
            <td><pre id="AliceMsg1"></pre></td>
            <td><pre id="BobMsg1"></pre></td>
        </tr>
        <tr>
            <td><button id="round2btn" class="button blue">Start<br/>Round 2</button><p id="round2errmsg" style="text-align:center;color=red;"><br/></p></td>
            <td><pre id="AliceMsg2"></pre></td>
            <td><pre id="BobMsg2"></pre></td>
        </tr>
        <tr>
            <td><button id="sharedkeybtn" class="button blue">Get<br/>Shared<br/>Key</button><p id="sharedkeyerrmsg" style="text-align:center;color:red;"><br/></p></td>
            <td><pre id="alicesharedkey"></pre></td>
            <td><pre id="bobsharedkey"></pre></td>
        </tr>
    </tbody>

</table>



<script src="/posts/yakk/jpake.js"></script>
<script>
    var AliceSecretElem = document.getElementById("AliceSecret")
    var BobSecretElem = document.getElementById("BobSecret")

    var AliceRound1MsgElem = document.getElementById("AliceMsg1")
    var BobRound1MsgElem = document.getElementById("BobMsg1")

    var AliceRound2MsgElem = document.getElementById("AliceMsg2")
    var BobRound2MsgElem = document.getElementById("BobMsg2")

    var AliceSharedKeyMsgElem = document.getElementById("alicesharedkey")
    var BobSharedKeyMsgElem = document.getElementById("bobsharedkey")

    var round1btn = document.getElementById("round1btn")
    var round2btn = document.getElementById("round2btn")
    var sharedkeybtn = document.getElementById("sharedkeybtn")

    <!-- A bit of a hack to make the table expand to fit the whole screen  -->
    AliceSecretElem.parentElement.parentElement.parentElement.parentElement.parentElement.style.width = "80vw"

    function prettify(jsonString) {
        // wrap strings by breaking a newline every comma
        return JSON.stringify(JSON.parse(jsonString),null,2);
    }

    var pakeA, pakeB
    var msgA1, msgB1
    var msgA2, msgB2

    function onStartRound1() {

        // Clear all other msgelems
        AliceRound2MsgElem.textContent = ""
        BobRound2MsgElem.textContent = ""

        AliceSharedKeyMsgElem.textContent = ""
        BobSharedKeyMsgElem.textContent = ""

        round1errmsg.textContent = ""
        round2errmsg.textContent = ""
        sharedkeyerrmsg.textContent = ""

        var aliceSecret = AliceSecretElem.value
        var bobSecret = BobSecretElem.value

        pakeA = new jpake.JPake(aliceSecret)
        pakeB = new jpake.JPake(bobSecret)

        try {
            msgA1 = pakeA.GetRound1Message()
            msgB1 = pakeB.GetRound1Message()
        } catch(err) {
            round1errmsg.textContent = err
            throw(err)
        }
        
        const secretstr = "Alice Secret Input: " + aliceSecret + "\n\n"

        const Astr = secretstr + "===Alice Message To Bob===\n" + prettify(msgA1)
        const Bstr = secretstr + "===Bob Message To Alice===\n" + prettify(msgB1)

        AliceRound1MsgElem.textContent = Astr
        BobRound1MsgElem.textContent = Bstr
    }

    function onStartRound2() {

        try {
            msgA2 = pakeA.GetRound2Message(msgB1)
            msgB2 = pakeB.GetRound2Message(msgA1)
        } catch(err) {
            round2errmsg.textContent = err
            throw(err)
        }

        const Astr = "===Alice Message To Bob===\n" + prettify(msgA2)
        const Bstr = "===Bob Message To Alice===\n" + prettify(msgB2)

        AliceRound2MsgElem.textContent = Astr
        BobRound2MsgElem.textContent = Bstr
    }

    function onGetSharedKey() {

        try {
            const keyA = pakeA.ComputeSharedKey(msgB2)
            const keyB = pakeB.ComputeSharedKey(msgA2)

            if (keyA != keyB) {
                sharedkeyerrmsg.textContent = "Keys are not the same!"
            }

            const Astr = "===Alice's Shared Key===\n" + keyA
            const Bstr = "===Bob's Shared Key===\n" + keyB

            AliceSharedKeyMsgElem.textContent = Astr
        BobSharedKeyMsgElem.textContent = Bstr
        } catch(err) {
            sharedkeyerrmsg.textContent = err
            throw(err)
        }
        
    }

    round1btn.onclick = onStartRound1
    round2btn.onclick = onStartRound2
    sharedkeybtn.onclick = onGetSharedKey

</script>