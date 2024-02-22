const socket = io(); // Se connecter au serveur
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Fonction pour dessiner le jeu
function drawGame(state) {
    // Effacer le canvas
    ctx.clearRect(0, 0, 700, 500);
    // Dessiner la balle
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(state.ballPosition.x + 700 / 2, state.ballPosition.y + 500 / 2, 2, 0, 2 * Math.PI); // Rayon réduit à 10
    ctx.fill();
    
    // Dessiner les paddles avec des dimensions ajustées
    ctx.fillStyle = 'white';
    state.playerPositions.forEach(pos => {
        // Ajuster la largeur à 20 et la hauteur à 100, et positionner correctement
        ctx.fillRect(pos.x + 700 / 2 - 5, pos.y + 500 / 2 - 10, 5, 20); // Centrer les paddles verticalement
    });
}

// Écouter les mises à jour de l'état du jeu depuis le serveur
socket.on('gameState', (state) => {
    drawGame(state);
});