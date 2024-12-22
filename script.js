function shuffleGrid () {
    return grid
        .map((cell) => [cell, Math.random() * (grid.length - 1)])
        .toSorted((a, b) => b[1] - a[1])
        .map(([cell], index) => {
            const x = Math.floor(index % gridSize);
            const y = Math.floor(index / gridSize);

            return { ...cell, x, y };
        });
}

function moveCell (id) {
    const index = grid.findIndex((cell) => cell.id === id);
    const { x: x1, y: y1 } = grid[index];
    const { x: x2, y: y2 } = emptyCell;

    // Checks if cell to move is adjacent to the empty cell
    if ((x1 === x2 && Math.abs(y2 - y1) === 1) || (y1 === y2 && Math.abs(x2 - x1) === 1)) {
        emptyCell.x = x1;
        emptyCell.y = y1;
        grid[index].x = x2;
        grid[index].y = y2;

        animateCellId = id;

        render();
    }
}

function render () {
    // Get current background dimensions
    const { width, height } = img.getBoundingClientRect();

    grid.forEach((cell) => {
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

function addCells () {
    const cells = grid.map((cell) => {
        const div = document.createElement("div");

        div.className = "cell";
        div.addEventListener("click", moveCell.bind(null, cell.id));

        div.dataset.id = cell.id;

        return div;
    });

    rootEl.append(...cells);
}

function isPuzzleSolved () {
    return grid.every((cell) => {
        return cell.x === cell.offsetX && cell.y === cell.offsetY;
    });
}

function restart () {
    grid = shuffleGrid();
    render();
    rootEl.classList.remove("solved");
}

function setup () {
    const imageWidth = img.getBoundingClientRect().width;

    gridSize = 3;
    cellsCount = gridSize * gridSize - 1;
    cellSize = imageWidth / gridSize;
    grid = [];

    rootEl.style.setProperty("--background-image", `url(${img.src})`);
    rootEl.style.setProperty("--background-size", imageWidth + "px");
    rootEl.style.setProperty("--grid-size", gridSize);

    let id = 0;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid.push({
                id: id,
                x: x,
                y: y,
                offsetX: x,
                offsetY: y,
            });
            id++;
        }
    }

    emptyCell = {
        id: id - 1,
        x: gridSize - 1,
        y: gridSize - 1,
    };

    grid.pop();
    grid = shuffleGrid(grid, gridSize);

    addCells();
    render();

    const playAgainButton = document.getElementById("play-again");
    playAgainButton.addEventListener("click", restart);
}

let gridSize, cellsCount, cellSize, grid, emptyCell, playAgainButton;
let rootEl = document.querySelector(".slide-puzzle .board");
let img = rootEl.querySelector("img");

if (img.complete) {
    setup();
} else {
    img.addEventListener("load", setup);
}
