const gameState = {
    grid: {
        size: 3,
        cells: [],
        cellsCount: 0,
        cellSize: 0,
        emptyCell: {
            x: 0,
            y: 0
        },
    },
    score: {
        current: 0,
        best: 0,
        hasBest: false
    }
};

function shuffleGrid () {
    return gameState.grid.cells
        .map((cell) => [cell, Math.random() * (gameState.grid.cells.length - 1)])
        .toSorted((a, b) => b[1] - a[1])
        .map(([cell], index) => {
            const x = Math.floor(index % gameState.grid.size);
            const y = Math.floor(index / gameState.grid.size);

            return { ...cell, x, y };
        });
}

function moveCell (id) {
    const index = gameState.grid.cells.findIndex((cell) => cell.id === id);
    const { x: x1, y: y1 } = gameState.grid.cells[index];
    const { x: x2, y: y2 } = gameState.grid.emptyCell;

    // Checks if cell to move is adjacent to the empty cell
    if ((x1 === x2 && Math.abs(y2 - y1) === 1) || (y1 === y2 && Math.abs(x2 - x1) === 1)) {
        gameState.grid.emptyCell.x = x1;
        gameState.grid.emptyCell.y = y1;
        gameState.grid.cells[index].x = x2;
        gameState.grid.cells[index].y = y2;

        animateCellId = id;

        render();
        updateMovesCounter();
        renderMovesCounter();
    }
}

function render () {
    // Get current background dimensions
    const { width, height } = img.getBoundingClientRect();
    const gridSize = gameState.grid.size;
    const cellSize = gameState.grid.cellSize;

    gameState.grid.cells.forEach((cell) => {
        const el = rootEl.querySelector(`[data-id="${cell.id}"].cell`);

        el.style = `
            background-position-x: ${-width / gridSize * cell.offsetX}px;
            background-position-y: ${-height / gridSize * cell.offsetY}px;
            top: ${(cell.y * cellSize / height * 100)}%;
            left: ${(cell.x * cellSize / width * 100)}%;
        `;

        el.dataset.x = cell.x;
        el.dataset.y = cell.y;

        return el;
    });

    if (isPuzzleSolved()) {
        rootEl.classList.add("solved");
    }
}

function addCellElements () {
    const cells = gameState.grid.cells.map((cell) => {
        const div = document.createElement("div");

        div.className = "cell";
        div.addEventListener("click", moveCell.bind(null, cell.id));

        div.dataset.id = cell.id;

        return div;
    });

    rootEl.append(...cells);
}

function isPuzzleSolved () {
    return gameState.grid.cells.every((cell) => {
        return cell.x === cell.offsetX && cell.y === cell.offsetY;
    });
}

function updateMovesCounter () {
    gameState.score.current = gameState.score.current + 1;

    if (!gameState.score.hasBest) {
        gameState.score.best = gameState.score.current;
    }
}

function renderMovesCounter () {
    const rootEl = document.querySelector(".moves-counter");
    const current = rootEl.querySelector(".current span");
    // const best = rootEl.querySelector(".best span");

    current.textContent = gameState.score.current.toString().padStart(3, "0");
    // best.TextContent = gameState.score.best.toString().padStart(3, "0");
}

function restart () {
    gameState.grid.cells = shuffleGrid();
    render();
    rootEl.classList.remove("solved");
}

function setTheme () {
    const themes = ["theme-01", "theme-02"];
    const themeIndex = Math.ceil(Math.random() * themes.length - 1);
    const theme = themes[themeIndex];

    document.querySelector("main").className = theme;
}

function setup () {
    const imageWidth = img.getBoundingClientRect().width;

    gameState.grid.cellsCount = gameState.grid.size * gameState.grid.size - 1;
    gameState.grid.cellSize = imageWidth / gameState.grid.size;

    rootEl.style.setProperty("--background-image", `url(${img.src})`);
    rootEl.style.setProperty("--background-size", imageWidth + "px");
    rootEl.style.setProperty("--grid-size", gameState.grid.size);

    let id = 0;

    for (let y = 0; y < gameState.grid.size; y++) {
        for (let x = 0; x < gameState.grid.size; x++) {
            gameState.grid.cells.push({
                id: id,
                x: x,
                y: y,
                offsetX: x,
                offsetY: y,
            });
            id++;
        }
    }

    gameState.grid.emptyCell = {
        x: gameState.grid.size - 1,
        y: gameState.grid.size - 1,
    };

    gameState.grid.cells.pop();
    gameState.grid.cells = shuffleGrid();

    setTheme();
    addCellElements();
    render();
}

let rootEl = document.querySelector(".slide-puzzle .board");
let img = rootEl.querySelector("img");

if (img.complete) {
    setup();
} else {
    img.addEventListener("load", setup);
}
