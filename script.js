const puzzle = document.querySelector(".slide-puzzle");
const img = puzzle.querySelector("img");

const gridSize = 3;
const cellsCount = gridSize * gridSize - 1;
const cellSize = img.width / gridSize;

let grid = [];
let id = 0;

for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
        grid.push({
            id: id,
            x: x,
            y: y,
            offsetX: x * cellSize,
            offsetY: y * cellSize,
        });
        id++;
    }
}

grid.pop();

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

grid = shuffleGrid(grid);

let emptyCell = {
    id: id - 1,
    x: gridSize - 1,
    y: gridSize - 1,
};

function drawCells () {
    puzzle.querySelectorAll(".cell").forEach((e) => e.remove());

    const cells = grid.map((entry) => {
        const div = document.createElement("div");
        div.className = "cell";
        div.style.backgroundImage = `url(${img.src})`;
        div.style.backgroundPositionX = (entry.offsetX / img.width * 100) + "%";
        div.style.backgroundPositionY = (entry.offsetY / img.height * 100) + "%";
        div.style.top = (entry.y * cellSize / img.height * 100) + "%";
        div.style.left = (entry.x * cellSize / img.width * 100) + "%";
        // div.style.width = cellSize + "px";
        div.setAttribute("data-id", entry.id);
        div.setAttribute("data-x", entry.x);
        div.setAttribute("data-y", entry.y);
        div.addEventListener("click", () => moveCell(entry.id));

        return div;
    });

    puzzle.append(...cells);
}

function moveCell (id) {
    const index = grid.findIndex((cell) => cell.id === id);
    const { x: x1, y: y1 } = grid[index];
    const { x: x2, y: y2 } = emptyCell;

    if ((x1 === x2 && Math.abs(y2 - y1) === 1) || (y1 === y2 && Math.abs(x2 - x1) === 1)) {
        emptyCell.x = x1;
        emptyCell.y = y1;
        grid[index].x = x2;
        grid[index].y = y2;

        drawCells();
    }
}

drawCells();
