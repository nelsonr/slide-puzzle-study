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

        const cell = gameState.grid.cells[index];

        if (cell.x === cell.offsetX && cell.y === cell.offsetY) {
            console.log("HIT SPARK!");
            const cellElement = rootEl.querySelector(`[data-id="${cell.id}"].cell`);

            if (cellElement) {
                cellElement.classList.add("cell--hit-spark");
            }
        }

        updateMovesCounter();
        render();
    }
}

function render () {
    // Get current background dimensions
    const { width, height } = img.getBoundingClientRect();
    const gridSize = gameState.grid.size;

    gameState.grid.cells.forEach((cell) => {
        const el = rootEl.querySelector(`[data-id="${cell.id}"].cell`);
        const x = `${(cell.x * 100)}%`;
        const y = `${(cell.y * 100)}%`;

        el.style = `
            background-position-x: ${-width / gridSize * cell.offsetX}px;
            background-position-y: ${-height / gridSize * cell.offsetY}px;
            transform: translate(${x}, ${y});
        `;

        el.dataset.x = cell.x;
        el.dataset.y = cell.y;

        if (el.classList.contains("cell--hit-spark")) {
            el.addEventListener("transitionend", function () {
                const { top, left, width } = this.getBoundingClientRect();
                const x = (left + width / 2);
                const y = (top + 10);

                renderHitSpark(x, y);
                this.classList.remove("cell--hit-spark");
            }, { once: true })
        }

        return el;
    });

    if (isPuzzleSolved()) {
        rootEl.classList.add("solved");
    }

    renderMovesCounter();

    if (document.querySelector(".no-transition")) {
        setTimeout(() => {
            document.querySelector(".no-transition").classList.remove("no-transition");
        }, 400)
    }
}

function renderHitSpark (x, y) {
    const effectsEl = document.querySelector(".effects");
    const hitSparkEl = effectsEl.querySelector(".hit-spark");
    const { width, height } = hitSparkEl.getBoundingClientRect();

    const instance = hitSparkEl.cloneNode(true);
    instance.style = `top: ${y + height / 2}px; left: ${x - width / 2}px;`;
    // instance.onanimationend = function () {
    //     setTimeout(() => {
    //         this.remove();
    //     }, 300);
    // }

    effectsEl.append(instance);
    instance.classList.add("hit-spark--animate");
}

function addCellElements () {
    if (document.querySelectorAll(".cell").length > 0) {
        return;
    }

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

    current.textContent = gameState.score.current.toString().padStart(3, "0");
}

function setTheme () {
    const themes = ["theme-01", "theme-02"];
    const themeIndex = Math.ceil(Math.random() * themes.length - 1);
    const theme = themes[themeIndex];

    document.querySelector("main").className = theme;
}

function setupPhotoSelection () {
    const fileInput = document.querySelector("input[type='file']");

    fileInput.addEventListener("change", function () {
        loadAndResizeImage(URL.createObjectURL(this.files[0]));
    });
}

function loadAndResizeImage (imgSource) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");

    img.src = imgSource;
    img.style = "visibility: hidden; position: fixed;"
    img.onload = function () {
        const { width, height } = rootEl.getBoundingClientRect();
        const { width: imgWidth, height: imgHeight } = this.getBoundingClientRect();
        const isSmaller = imgWidth < width && imgHeight < height;

        canvas.width = width;
        canvas.height = height;

        let sWidth = canvas.width;
        let sHeight = canvas.height;
        let dWidth = sWidth;
        let dHeight = sHeight;
        let sX = 0;
        let sY = 0;
        let dX = 0;
        let dY = 0;

        if (isSmaller) {
            dX = (width - imgWidth) / 2;
            dY = (height - imgHeight) / 2;
        } else {
            const smallestSide = imgWidth >= imgHeight ? imgHeight : imgWidth;

            canvas.width = smallestSide * 0.8;
            canvas.height = smallestSide * 0.8;

            sX = (imgWidth / 2) - (canvas.width / 2);
            sY = (imgHeight / 2) - (canvas.height / 2);
            sWidth = canvas.width;
            sHeight = canvas.width;
            dWidth = canvas.width;
            dHeight = canvas.height;
        }

        ctx.drawImage(this, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

        canvas.toBlob((blob) => {
            const puzzleImage = document.querySelector(".slide-puzzle img");
            const url = URL.createObjectURL(blob); // triggers setup() method

            puzzleImage.addEventListener("load", function () {
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(imgSource);
            }, { once: true })

            puzzleImage.src = url;

            this.remove();
        }, "image/jpeg");
    }

    document.body.append(img);
}

function loadPuzzleFromPhoto () {
    const img = document.querySelector(".slide-puzzle img");
    const imageWidth = img.getBoundingClientRect().width;

    rootEl.style.setProperty("--background-image", `url(${img.src})`);
    rootEl.style.setProperty("--background-size", imageWidth + "px");
    rootEl.style.setProperty("--grid-size", gameState.grid.size);

    gameState.grid.cellSize = imageWidth / gameState.grid.size;
}

function setup () {
    rootEl.classList.remove("solved");

    loadPuzzleFromPhoto();

    gameState.grid.cells = [];
    gameState.score.current = 0;
    gameState.grid.cellsCount = gameState.grid.size * gameState.grid.size - 1;

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

const rootEl = document.querySelector(".slide-puzzle .board");
const img = rootEl.querySelector("img");

img.addEventListener("load", setup);
setupPhotoSelection();

const imageIndex = Math.round(Math.random() * 1);
const imgSrc = ["img/photo_01.jpg", "img/photo_02.jpg"][imageIndex];
img.src = imgSrc;
