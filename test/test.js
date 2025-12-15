let totalRaised = 0;
const goal = 1000;
let rotation = 0;


const form = document.getElementById('donationForm');
const amountInput = document.getElementById('amount');
const progressBar = document.getElementById('progress-bar');
const modal = document.getElementById('wheelModal');
const wheel = document.getElementById('wheel');
const resultText = document.getElementById('wheelResult');


// Preset buttons


document.querySelectorAll('.preset-buttons button').forEach(btn => {
btn.addEventListener('click', () => {
amountInput.value = btn.dataset.amount;
});
});


// Donation submit
form.addEventListener('submit', e => {
e.preventDefault();


const amount = Number(amountInput.value);
totalRaised += amount;


const percent = Math.min((totalRaised / goal) * 100, 100);
progressBar.style.width = percent + '%';
progressBar.textContent = `$${totalRaised} Raised`;


modal.style.display = 'block';
form.reset();
});


// Spin logic


document.getElementById('spinBtn').addEventListener('click', () => {
const chance = Math.floor(Math.random() * 1000) + 1;
let prize;


if (chance === 1) {
prize = 100;
rotation += 300; // force golden section
} else {
const normalPrizes = [10, 20, 30, 40, 50];
prize = normalPrizes[Math.floor(Math.random() * normalPrizes.length)];
rotation += Math.floor(Math.random() * 300) + 360;
}


wheel.style.transform = `rotate(${rotation}deg)`;


setTimeout(() => {
resultText.textContent = `You won $${prize}!`;
}, 2000);
});
});


// Close modal


document.querySelector('.close').addEventListener('click', () => {
modal.style.display = 'none';
resultText.textContent = '';
});