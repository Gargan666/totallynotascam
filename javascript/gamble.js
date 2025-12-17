// -------------------- SETUP -------------------- //

const wheel = document.getElementById('wheel');
const dot = document.getElementById('winDot');
const overlay = document.getElementById('overlay');

// styling
const loseFill = 'rgba(171, 42, 42, 1)';      // lose area fill color
const loseOutline = 'rgba(45, 7, 7, 1)'; // lose area outline color
const loseStrokeWidth = 2;   // lose area outline width

const winFill = 'rgb(54, 205, 54)';     // win area fill color
const winOutline = 'rgb(9, 77, 9)';  // win area outline color
const winStrokeWidth = 2;    // win area outline width

const shrink = 5;            // amount which the wheel will be shrinked

// logic stuff
const chance = 0.1;          // win probability in decimal (dictates win slice size)
const winnerAngle = -90;     // angle needed to hit to win (0 is to the right)
const spinTime = 1;          // how long the wheel takes to spin (in seconds)
const extraSpins = 10;       // how many extra times the wheel does a full rotation before landing

// arrays and or slot stuff
let slots = [];              // all slots in an array
let loseSlots = [];          // all slots except for the winning slot
let slotDegrees = [];        // all slots, however with their angles on the wheel listed for each slot
let slotsLength;             // how many slots there are in total

let logicalRotation = 0;     // current angle (doesn't loop around from 360 to 0)
let isSpinning = false;      // is already spinning check

// canvas stuff
const dpr = window.devicePixelRatio || 1;
const cssWidth = 300;        // match with #wheel style width (px)
const cssHeight = 300;       // match with #wheel style height (px)

wheel.style.width = `${cssWidth}px`;
wheel.style.height = `${cssHeight}px`;

wheel.width = cssWidth * dpr;
wheel.height = cssHeight * dpr;

const ctx = wheel.getContext('2d');
ctx.scale(dpr, dpr);

// -------------------- SLOT SETUP -------------------- //

function setSlots(c) {
  if (c <= 0 || c > 1) {
    throw new Error("Probability must be between 0 (exclusive) and 1 (inclusive)");
  }

  slotsLength = 1 / c;

  slots = [];
  for (let i = 1; i <= slotsLength; i++) {
    slots.push(i);
  }

  loseSlots = slots.filter(n => n !== 1);
}

// -------------------- SLOT ANGLES -------------------- //

// calculate angle range for each slot, puts it into the slotDegrees array
function rotations() {
  slotDegrees = [];

  const d = 360 / slotsLength;
  let start = 0;

  slots.forEach(i => {
    const end = start + d;
    slotDegrees.push({ i, start, end });
    start = end;
  });
}

// -------------------- DRAWING -------------------- //

// canvas drawing
function drawWheel() {
  const cx = cssWidth / 2;
  const cy = cssHeight / 2;
  const radius = cssWidth / 2;

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // ---- Losing area ---- //
  ctx.beginPath();
  ctx.arc(cx, cy, radius - loseStrokeWidth / 2 - shrink, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = loseFill;
  ctx.fill();

  ctx.lineWidth = loseStrokeWidth;
  ctx.strokeStyle = loseOutline;
  ctx.stroke();

  // ---- Winning slice ---- //
  const win = slotDegrees.find(s => s.i === 1);
  if (win) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    // shrink radius by half of stroke width to keep stroke inside
    ctx.arc(
      cx,
      cy,
      radius - winStrokeWidth / 2 - shrink,
      win.start * Math.PI / 180,
      win.end * Math.PI / 180
    );
    ctx.closePath();
    ctx.fillStyle = winFill;
    ctx.fill();

    ctx.lineWidth = winStrokeWidth;
    ctx.strokeStyle = winOutline;
    ctx.stroke();
  }
}

// update wheel by redrawing canvas under new conditions
function resizeWheel() {
  const cssWidth = 300;
  const cssHeight = 300;
  const dpr = window.devicePixelRatio || 1;

  wheel.width = cssWidth * dpr;
  wheel.height = cssHeight * dpr;
  wheel.style.width = `${cssWidth}px`;
  wheel.style.height = `${cssHeight}px`;

  const ctx = wheel.getContext('2d');
  ctx.scale(dpr, dpr);

  drawWheel();
}

window.addEventListener('resize', resizeWheel);
resizeWheel();

// -------------------- ANGLE HELPERS -------------------- //

// not important, just some math stuff
function normalizeAngle(deg) {
  return ((deg % 360) + 360) % 360;
}
// returns which slot is at a specific angle by reading the angle range of each slot
function getSlotAtAngle(angle) {
  return slotDegrees.find(slot => {
    const start = slot.start;
    const end = slot.end;

    if (start <= end) {
      return angle >= start && angle < end;
    }

    // wrap-around safety
    return angle >= start || angle < end;
  });
}

// -------------------- SPIN -------------------- //
// initiates the spinning of the wheel.
function spin() {
  if (isSpinning) return;
  isSpinning = true;

  const baseSpins = 360 * extraSpins;
  const randomOffset = Math.random() * 360;

  logicalRotation += baseSpins + randomOffset;

  wheel.style.transition = `transform ${spinTime}s cubic-bezier(0.22, 1, 0.36, 1)`;
  wheel.style.transform = `rotate(${logicalRotation}deg)`;

  setTimeout(() => {
    const normalizedRotation = normalizeAngle(logicalRotation);
    const effectiveAngle = normalizeAngle(winnerAngle - normalizedRotation);

    const landedSlot = getSlotAtAngle(effectiveAngle);

    if (landedSlot && landedSlot.i === 1) {
      console.log("WIN");
    } else {
      overlay.classList.remove('disabled');
      overlay.classList.add('fadeIn');
    }

    // normalize rotation to prevent unbounded growth
    logicalRotation = normalizeAngle(logicalRotation);
    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(${logicalRotation}deg)`;
    wheel.offsetHeight; // force reflow

    isSpinning = false;
  }, spinTime * 1000);
}

// -------------------- DOT POSITION -------------------- //
// returns x and y values of a specific angle on the edge of the wheel (with optional offset)
function getPointOnWheel(angleDeg, radiusOffset = 0) {
  const cx = cssWidth / 2;
  const cy = cssHeight / 2;
  const r = cssWidth / 2 - radiusOffset;

  const rad = angleDeg * Math.PI / 180;

  return {
    x: cx + Math.cos(rad) * r,
    y: cy + Math.sin(rad) * r
  };
}
// actually updates the position of the marker
function updateDotPosition() {
  const point = getPointOnWheel(winnerAngle);
  const dotWidth = dot.offsetWidth;
  const dotHeight = dot.offsetHeight;

  dot.style.position = 'absolute';
  dot.style.left = `${point.x - dotWidth / 2}px`;
  dot.style.top = `${point.y - dotHeight / 2}px`;
}

// -------------------- INIT -------------------- //

setSlots(chance);
rotations();
drawWheel();
updateDotPosition();

// call spin() when needed
// spin();