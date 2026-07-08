const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let juegoActivo = true;
let score = 0;

let personaje = {
    x: 40,
    y: 110,
    width: 30,
    height: 30,
    vy: 0,
    gravity: 0.6,
    jumpForce: -10,
    isGrounded: false,
    img: null
};

let obstaculo = {
    x: canvas.width,
    y: 120,
    width: 20,
    height: 20,
    speed: 4
};

const botonReintentar = {
    x: canvas.width / 2 - 60,
    y: canvas.height / 2 + 10,
    width: 120,
    height: 35
};

// Escuchador para subir el personaje
document.getElementById('char-uploader').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                personaje.img = img;
            };
        };
        reader.readAsDataURL(file);
    }
});

function reiniciarJuego() {
    score = 0;
    obstaculo.x = canvas.width;
    obstaculo.speed = 4;
    personaje.y = 110;
    personaje.vy = 0;
    personaje.isGrounded = true;
    juegoActivo = true;
    update();
}

function manejarAccion() {
    if (juegoActivo && personaje.isGrounded) {
        personaje.vy = personaje.jumpForce;
        personaje.isGrounded = false;
    }
}

window.addEventListener('keydown', (e) => { 
    if (e.code === 'Space') {
        e.preventDefault();
        manejarAccion();
    } 
});

canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (!juegoActivo) {
        if (clickX >= botonReintentar.x && clickX <= botonReintentar.x + botonReintentar.width &&
            clickY >= botonReintentar.y && clickY <= botonReintentar.y + botonReintentar.height) {
            reiniciarJuego();
        }
    } else {
        manejarAccion();
    }
});

function update() {
    if (!juegoActivo) {
        dibujarPantallaGameOver();
        return;
    }

    // Limpieza e inicialización del fondo del canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111116';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gravedad
    personaje.vy += personaje.gravity;
    personaje.y += personaje.vy;

    if (personaje.y >= 110) {
        personaje.y = 110;
        personaje.vy = 0;
        personaje.isGrounded = true;
    }

    // Obstáculo
    obstaculo.x -= obstaculo.speed;
    if (obstaculo.x < -obstaculo.width) {
        obstaculo.x = canvas.width;
        score++;
        obstaculo.speed += 0.2; 
    }

    // Dibujar componentes
    ctx.fillStyle = '#ff4a4a';
    ctx.fillRect(obstaculo.x, obstaculo.y, obstaculo.width, obstaculo.height);

    if (personaje.img) {
        ctx.drawImage(personaje.img, personaje.x, personaje.y, personaje.width, personaje.height);
    } else {
        ctx.fillStyle = '#00ffcc';
        ctx.fillRect(personaje.x, personaje.y, personaje.width, personaje.height);
    }

    // Colisión
    if (personaje.x < obstaculo.x + obstaculo.width &&
        personaje.x + personaje.width > obstaculo.x &&
        personaje.y < obstaculo.y + obstaculo.height &&
        personaje.y + perimeter() > obstaculo.y) { // Simplificado para estabilidad
        
        // Corrección AABB básica
        if (personaje.y + personaje.height > obstaculo.y) {
            juegoActivo = false;
        }
    }

    // Marcador
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Puntos: ${score}`, 10, 20);

    requestAnimationFrame(update);
}

function dibujarPantallaGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff4a4a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡GAME OVER!', canvas.width / 2, canvas.height / 2 - 15);

    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(botonReintentar.x, botonReintentar.y, botonReintentar.width, botonReintentar.height);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('REINTENTAR', canvas.width / 2, botonReintentar.y + 22);
    ctx.textAlign = 'left';
}

update();
