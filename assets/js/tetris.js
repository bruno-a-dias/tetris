const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Escala do grid
context.scale(32, 32);

// Função para criar a matriz do tabuleiro
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Gera uma cor aleatória
function getRandomColor() {
    const colors = ['red', 'blue', 'green', 'yellow', 'cyan', 'purple', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Função para criar as diferentes formas de peças
function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ];
        case 'O':
            return [
                [1, 1],
                [1, 1],
            ];
        case 'L':
            return [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ];
        case 'J':
            return [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ];
        case 'I':
            return [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
        case 'S':
            return [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ];
    }
}

// Função para detectar colisão
function collide(matrix, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (matrix[y + o.y] &&
                 matrix[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Desenho do tabuleiro e peças
function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color || 'red';  // Define a cor da peça
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Limpa a tela e redesenha tudo
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos, player.color);  // Peças agora possuem cor
}

// Faz a peça cair mais rápido
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

// Movimentação das peças para os lados
function playerMove(dir) {
    player.pos.x += dir;
    // Verificação para garantir que a peça não saia da borda
    if (collide(arena, player)) {
        player.pos.x -= dir; // Reverte o movimento se colidir
    }
    // Verificação das bordas
    if (player.pos.x < 0) {
        player.pos.x = 0;  // Limita o movimento à borda esquerda
    } else if (player.pos.x + player.matrix[0].length > arena[0].length) {
        player.pos.x = arena[0].length - player.matrix[0].length;  // Limita o movimento à borda direita
    }
}

// Gira a peça
function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -1); // Reverte a rotação se colidir
            player.pos.x = pos;
            return;
        }
    }
    // Limita a rotação para que não saia da tela
    if (player.pos.x + player.matrix[0].length > arena[0].length) {
        player.pos.x = arena[0].length - player.matrix[0].length;
    } else if (player.pos.x < 0) {
        player.pos.x = 0;
    }
}

// Função para girar a matriz da peça
function rotate(matrix, dir = 1) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
}

// Reseta o jogador após uma peça ser fixada
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    player.color = getRandomColor();  // Atribui uma cor aleatória à peça

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// Função para mesclar peça com o tabuleiro
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Remove linhas completas do tabuleiro
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        player.score += rowCount;  // Aumenta 1 ponto para cada linha removida
    }
}

// Atualiza a pontuação
function updateScore() {
    document.getElementById('score').innerText = player.score;
}

// Matriz do tabuleiro e jogador
const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    color: 'red',  // Inicialmente atribui uma cor padrão
    score: 0,
};

playerReset();
updateScore();

// Controle de queda das peças
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Detecta as teclas de movimento
document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate();
    }
});

update();
