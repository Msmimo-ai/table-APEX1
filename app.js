// app.js

// Initialize jsQR library for QR code scanning
import jsQR from 'jsqr';

// Access the camera
const videoElement = document.createElement('video');
const canvasElement = document.createElement('canvas');
const canvasContext = canvasElement.getContext('2d');

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }});
    videoElement.srcObject = stream;
    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement.play());
        };
    });
}

async function scanQRCode() {
    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const code = jsQR(imageData.data, canvasElement.width, canvasElement.height);

    if (code) {
        alert('QR Code detected: ' + code.data);
        localStorage.setItem('lastQRCode', code.data);
    }
}

// Render table with stored data
function renderTable() {
    const data = JSON.parse(localStorage.getItem('lastQRCode')) || [];
    const table = document.createElement('table');

    // Populate table with data
    data.forEach((item) => {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.innerText = item;
    });

    document.body.appendChild(table);
}

// Download data as JSON
function downloadData() {
    const data = localStorage.getItem('lastQRCode');
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.json';
    link.click();
}

// Upload data from file
async function uploadData(event) {
    const file = event.target.files[0];
    const data = await file.text();
    localStorage.setItem('lastQRCode', data);
}

// Email sharing functionality (via mailto)
function shareViaEmail() {
    const body = localStorage.getItem('lastQRCode');
    window.open(`mailto:?subject=QR Code Data&body=${body}`);
}

// Initialize the app
async function initializeApp() {
    await startCamera();
    setInterval(scanQRCode, 1000);
    renderTable();
}

initializeApp();

// Event listeners for download and upload
document.getElementById('downloadButton').addEventListener('click', downloadData);
document.getElementById('uploadButton').addEventListener('change', uploadData);
document.getElementById('shareButton').addEventListener('click', shareViaEmail);