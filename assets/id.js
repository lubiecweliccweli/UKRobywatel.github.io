var params = new URLSearchParams(window.location.search);
var expectedPin = (params.get("pin") || "123456").replace(/\D/g, "").slice(0, 6);
if (expectedPin.length !== 6) {
    expectedPin = "123456";
}

var input = document.querySelector(".password_input");
var eye = document.querySelector(".eye");
var statusText = document.querySelector(".pin_status");
var loginButton = document.querySelector(".login");
var biometricButton = document.querySelector(".biometric_login");

loginButton.addEventListener("click", verifyPin);
biometricButton.addEventListener("click", loginWithBiometricDemo);

var welcome = "Dzien dobry!";
var date = new Date();
if (date.getHours() >= 18){
    welcome = "Dobry wieczor!";
}
document.querySelector(".welcome").innerHTML = welcome;

input.addEventListener("input", function () {
    input.value = input.value.replace(/\D/g, "").slice(0, 6);
    statusText.textContent = "";
});

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        verifyPin();
    }
});

eye.addEventListener("click", function () {
    if (input.type === "password") {
        input.type = "text";
        eye.classList.add("eye_close");
    } else {
        input.type = "password";
        eye.classList.remove("eye_close");
    }
});

function verifyPin(){
    var pin = input.value.replace(/\D/g, "");
    if (pin.length !== 6) {
        statusText.style.color = "#ff7676";
        statusText.textContent = "Wpisz 6 cyfr PIN-u demo.";
        input.focus();
        return;
    }

    if (pin !== expectedPin) {
        statusText.style.color = "#ff7676";
        statusText.textContent = "Nieprawidlowy PIN demo.";
        input.value = "";
        input.focus();
        return;
    }

    statusText.style.color = "#6be28d";
    statusText.textContent = "PIN poprawny.";
    delay(250).then(toHome);
}

async function loginWithBiometricDemo(){
    biometricButton.disabled = true;
    statusText.style.color = "#ffffff";
    statusText.textContent = "Sprawdzanie biometrii demo...";

    var usedWebAuthn = false;
    try {
        usedWebAuthn = await tryWebAuthnDemo();
    } catch (error) {
        usedWebAuthn = false;
    }

    if (usedWebAuthn) {
        statusText.style.color = "#6be28d";
        statusText.textContent = "Biometria potwierdzona.";
        delay(250).then(toHome);
        return;
    }

    statusText.style.color = "#6be28d";
    statusText.textContent = "Biometria demo potwierdzona.";
    delay(650).then(toHome);
}

async function tryWebAuthnDemo(){
    if (!window.PublicKeyCredential || !window.isSecureContext) {
        return false;
    }

    var available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) {
        return false;
    }

    var stored = localStorage.getItem("demoBiometricCredential");
    var challenge = randomBytes(32);

    if (!stored) {
        var created = await navigator.credentials.create({
            publicKey: {
                challenge: challenge,
                rp: { name: "Demo" },
                user: {
                    id: randomBytes(16),
                    name: "demo",
                    displayName: "Demo"
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 },
                    { type: "public-key", alg: -257 }
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required"
                },
                timeout: 60000,
                attestation: "none"
            }
        });

        if (!created) {
            return false;
        }

        localStorage.setItem("demoBiometricCredential", arrayBufferToBase64Url(created.rawId));
        return true;
    }

    var credential = await navigator.credentials.get({
        publicKey: {
            challenge: challenge,
            allowCredentials: [{
                id: base64UrlToArrayBuffer(stored),
                type: "public-key"
            }],
            userVerification: "required",
            timeout: 60000
        }
    });

    return Boolean(credential);
}

function toHome(){
    location.href = "home.html?" + params.toString();
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

function randomBytes(length) {
    var bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function arrayBufferToBase64Url(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToArrayBuffer(value) {
    var base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
