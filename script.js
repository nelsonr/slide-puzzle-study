let puzzle, img, gridSize, cellsCount, cellSize, grid, emptyCell;

function shuffleGrid (grid) {
    return grid
        .map((cell) => [cell, Math.random() * (grid.length - 1)])
        .toSorted((a, b) => b[1] - a[1])
        .map(([cell], index) => {
            const y = Math.floor(index / gridSize);
            const x = Math.floor(index % gridSize);

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

        drawCells();
    }
}

function drawCells () {
    // Clear cells
    puzzle.querySelectorAll(".cell").forEach((cell) => cell.remove());

    // Get current background dimensions
    const { width, height } = img.getBoundingClientRect();

    const cells = grid.map((cell) => {
        const div = document.createElement("div");

        div.className = "cell";

        div.style = `
            background-position-x: ${-width / gridSize * cell.offsetX}px;
            background-position-y: ${-height / gridSize * cell.offsetY}px;
            top: ${(cell.y * cellSize / height * 100)}%;
            left: ${(cell.x * cellSize / width * 100)}%;
        `;

        div.dataset.id = cell.id;
        div.dataset.x = cell.x;
        div.dataset.y = cell.y;

        div.addEventListener("click", moveCell.bind(null, cell.id));

        return div;
    });

    puzzle.append(...cells);
}

function setup () {
    gridSize = 3;
    cellsCount = gridSize * gridSize - 1;
    cellSize = img.getBoundingClientRect().width / gridSize;
    grid = [];

    puzzle.style.setProperty("--background-image", `url(${img.src})`);

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
    grid = shuffleGrid(grid);

    drawCells();
    puzzle.style.setProperty("--background-size", img.getBoundingClientRect().width + "px");
}

puzzle = document.querySelector(".slide-puzzle");
img = puzzle.querySelector("img");
img.addEventListener("load", setup);
