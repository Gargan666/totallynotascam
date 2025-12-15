const wheel = document.getElementById('wheel');

const chance = 0.1;
const spinTime = 5000; // milliseconds in which the wheel spins (1000 = 1 second)
let slots = [];
let loseSlots = [];
let slotsLength;

let slotDegrees = [];

function setSlots(c) { // c = win probability / chance in decimal (1 represents 100%). 
  if (c <= 0 || c > 1) {
    throw new Error("Probability must be between 0 (exclusive) and 1 (inclusive)");
  }
  
  slotsLength = 1 / c;

  if (!Number.isInteger(slotsLength)) {
    throw new Error("Probability does not map cleanly to a whole number of slots");
  }

  // counter to create list of all slots individually
  let counting = true;
  let currentNum = 1;
  while (counting) {
    slots.push(currentNum);
    currentNum++;
    if (currentNum > slotsLength) {
        loseSlots = slots.filter(item => item !== 1); // remove 1 for losing slots, 1 is winning slot
        counting = false;
    }
  }

  // log results for testing
  console.log(`all slots: ${slots}`);
  console.log(`losing slots: ${loseSlots}`);
}

function spin() {
// what slot you landed on
const landedSlot = Math.ceil(Math.random() * slots)

// ADD WHEEL ANIMATION LOGIC HERE

// after wheel is done spinning
setTimeout(() => {
  const lose = loseSlots.includes(landedSlot);

  if (lose) {
    console.log(`HAHA LOSER YOU LANDED ${landedSlot} INSTEAD OF 1`);
  } else {
    console.log('ah, a seasoned gambler, i see..');
  }
}, spinTime);

}


setSlots(chance);
rotations();
spin();



// -- HELPERS (no touchy unless necessary) -- //

// calculate angle area of each slot on a wheel
function rotations() {
    const d = 360 / slotsLength; // how many degrees of a circle each slot takes up
    let count = 0;

    // create new array of all degrees corresponding with slots
    slots.forEach((i) => {
        count += d; // ending area for the slot (for example, slot 1 at chance 10% goes from 0 degrees to 36 degrees)
        const item = {i, count};
        slotDegrees.push(item);
    });
    console.log(slotDegrees);
}

// draw the wheel
function drawWheel() {
    const ctx = wheel.getContext("2d");

    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = 50;
    const startAngle = 0;
    const endAngle = 360;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle
    );
    ctx.closePath();
    ctx.fill();

}
drawWheel()