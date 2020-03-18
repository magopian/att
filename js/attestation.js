
// Various html nodes
const saveSignature        = document.getElementById("sauvegarder");
const signature            = document.getElementById("signature");
const restartSignature     = document.getElementById("refaire-signature");
const resetSignature       = document.getElementById("reset");
const form                 = document.getElementById("declaration-form");
const signatureWrapper     = document.getElementById("signature-wrapper");
signatureWrapper.className = "drawing";
const canvasWrapper        = document.getElementById("canvas-wrapper");
const canvas               = document.getElementById("dessiner-signature");
canvas.width               = canvasWrapper.clientWidth;
canvas.height              = canvasWrapper.clientWidth * 0.25;
const context              = canvas.getContext("2d");

// SAVE/RESTORE THE FORM TO/FROM LOCALSTORAGE
let serializedForm = {};
// Restore form from localstorage if previous data was stored
const fromStorage = localStorage.getItem(window.location.pathname);
if (fromStorage) {
    serializedForm = JSON.parse(fromStorage);
    Object.keys(serializedForm).map(function(formElementName) {
        if (formElementName === "signature") {
            // Special casing the signature which isn't a form element.
            signature.src = serializedForm["signature"];
            signatureWrapper.className = "displaying";
        } else {
            const elements = document.getElementsByName(formElementName);
            if (elements.length) {
                const element = elements[0];
                if (element.type === "checkbox") {
                    element.checked = serializedForm[formElementName];
                } else {
                    element.value = serializedForm[formElementName];
                }
            }
        }
    });
}

// Save the form to localstorage on change
function saveToLocalStorage(key, value) {
    serializedForm[key] = value;
    const json = JSON.stringify(serializedForm);
    localStorage.setItem(window.location.pathname, json);
}

// Keep compatibility with IE.
const formElements = Array.prototype.slice.call(form.elements);
formElements.map(function(element) {
    if (element.type === "checkbox") {
        element.onchange = function(event) {
            saveToLocalStorage(event.target.name, event.target.checked);
        };
    } else {
        element.oninput = function(event) {
            saveToLocalStorage(event.target.name, event.target.value);
        };
    }
});

// DRAWING A SIGNATURE (copied from https://stackoverflow.com/a/22891828)
context.strokeStyle = "#000000";
context.lineJoin    = "round";
context.lineWidth   = 2;

var clickX    = [];
var clickY    = [];
var clickDrag = [];
var paint;

/**
 * Add information where the user clicked at.
 * @param {number} x
 * @param {number} y
 * @return {boolean} dragging
 */
function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
}

/**
 * Redraw the complete canvas.
 */
function redraw() {
    // Clears the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (var i = 0; i < clickX.length; i += 1) {
        if (!clickDrag[i] && i == 0) {
            context.beginPath();
            context.moveTo(clickX[i], clickY[i]);
            context.stroke();
        } else if (!clickDrag[i] && i > 0) {
            context.closePath();

            context.beginPath();
            context.moveTo(clickX[i], clickY[i]);
            context.stroke();
        } else {
            context.lineTo(clickX[i], clickY[i]);
            context.stroke();
        }
    }
}

/**
 * Draw the newly added point.
 * @return {void}
 */
function drawNew() {
    var i = clickX.length - 1;
    if (!clickDrag[i]) {
        if (clickX.length == 0) {
            context.beginPath();
            context.moveTo(clickX[i], clickY[i]);
            context.stroke();
        } else {
            context.closePath();

            context.beginPath();
            context.moveTo(clickX[i], clickY[i]);
            context.stroke();
        }
    } else {
        context.lineTo(clickX[i], clickY[i]);
        context.stroke();
    }
}

function mouseDownEventHandler(event) {
    paint = true;
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    if (paint) {
        addClick(x, y, false);
        drawNew();
    }
}

function touchstartEventHandler(event) {
    event.preventDefault();
    paint = true;
    if (paint) {
        addClick(
            event.touches[0].pageX - canvas.offsetLeft,
            event.touches[0].pageY - canvas.offsetTop,
            false
        );
        drawNew();
    }
}

function mouseUpEventHandler(event) {
    event.preventDefault();
    context.closePath();
    paint = false;
}

function mouseMoveEventHandler(event) {
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    if (paint) {
        addClick(x, y, true);
        drawNew();
    }
}

function touchMoveEventHandler(event) {
    event.preventDefault();
    if (paint) {
        addClick(
            event.touches[0].pageX - canvas.offsetLeft,
            event.touches[0].pageY - canvas.offsetTop,
            true
        );
        drawNew();
    }
}

function setUpHandler(isMouseandNotTouch, detectEvent) {
    removeRaceHandlers();
    if (isMouseandNotTouch) {
        canvas.addEventListener("mouseup", mouseUpEventHandler);
        canvas.addEventListener("mousemove", mouseMoveEventHandler);
        canvas.addEventListener("mousedown", mouseDownEventHandler);
        mouseDownEventHandler(detectEvent);
    } else {
        canvas.addEventListener("touchstart", touchstartEventHandler);
        canvas.addEventListener("touchmove", touchMoveEventHandler);
        canvas.addEventListener("touchend", mouseUpEventHandler);
        canvas.addEventListener("touchcancel", function(event) {
            event.preventDefault();
        });
        touchstartEventHandler(detectEvent);
    }
}

function mouseWins(e) {
    setUpHandler(true, e);
}

function touchWins(e) {
    setUpHandler(false, e);
}

function removeRaceHandlers() {
    canvas.removeEventListener("mousedown", mouseWins);
    canvas.removeEventListener("touchstart", touchWins);
}

canvas.addEventListener("mousedown", mouseWins);
canvas.addEventListener("touchstart", touchWins);

// Save the signature or reset it.
saveSignature.onclick = function() {
    const dataURL = canvas.toDataURL("image/png");
    signature.src = dataURL;
    saveToLocalStorage("signature", dataURL);
    signatureWrapper.className = "displaying";
};

resetSignature.onclick = function() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
};

restartSignature.onclick = function() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    signatureWrapper.className = "drawing";
};
