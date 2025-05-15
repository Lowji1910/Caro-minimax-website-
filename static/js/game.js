document.addEventListener("DOMContentLoaded", function () {
  // Prevent text selection on the entire document
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
  });

  const boardDiv = document.getElementById("board");
  const chooseXBtn = document.getElementById("chooseX");
  const chooseOBtn = document.getElementById("chooseO");
  const sideSelection = document.getElementById("sideSelection");
  const turnSelection = document.getElementById("turnSelection");
  const chooseFirstBtn = document.getElementById("chooseFirst");
  const chooseSecondBtn = document.getElementById("chooseSecond");
  const undoBtn = document.getElementById("undo");
  const messageDiv = document.getElementById("message");
  const playAgainBtn = document.getElementById("playAgain");
  const turnStatusLeft = document.getElementById("turnStatusLeft");
  const turnStatusRight = document.getElementById("turnStatusRight");
  const timerLeft = document.getElementById("timerLeft");
  const timerRight = document.getElementById("timerRight");

  let playerSymbol = "";
  let aiSymbol = "";
  let playerTurn = false;
  let gameOver = false;
  let undoUsed = false;
  let board = Array(30)
    .fill()
    .map(() => Array(30).fill(""));
  let history = [];
  let selectedCell = null;
  let playerTimerInterval = null;
  let aiTimerInterval = null;
  let playerTimeLeft = 20;
  let aiTimeLeft = 20;

  // Xây dựng bảng cờ
  for (let r = 0; r < 30; r++) {
    for (let c = 0; c < 30; c++) {
      const cell = document.createElement("div");
      cell.id = `cell-${r}-${c}`;
      cell.classList.add("cell");
      cell.addEventListener("click", () => cellClick(r, c));
      boardDiv.appendChild(cell);
    }
  }

  function updateTurnStatus() {
    if (playerTurn && !gameOver) {
      turnStatusLeft.textContent = "Bạn";
      turnStatusRight.textContent = "";
      timerLeft.style.visibility = "visible";
      timerRight.style.visibility = "hidden";
    } else if (!playerTurn && !gameOver) {
      turnStatusLeft.textContent = "";
      turnStatusRight.textContent = "Bot";
      timerLeft.style.visibility = "hidden";
      timerRight.style.visibility = "visible";
    } else {
      turnStatusLeft.textContent = "";
      turnStatusRight.textContent = "";
      timerLeft.style.visibility = "hidden";
      timerRight.style.visibility = "hidden";
    }
  }

  function startPlayerTimer() {
    clearInterval(playerTimerInterval);
    playerTimeLeft = 20;
    timerLeft.textContent = playerTimeLeft + "s";
    timerLeft.style.visibility = "visible";
    timerRight.style.visibility = "hidden";
    playerTimerInterval = setInterval(() => {
      playerTimeLeft--;
      timerLeft.textContent = playerTimeLeft + "s";
      if (playerTimeLeft <= 0) {
        clearInterval(playerTimerInterval);
        timerLeft.textContent = "Hết giờ";
        playerTurn = false;
        gameOver = true;
        showMessage("Bạn thua vì hết giờ!", "lose");
        endGame();
      }
    }, 1000);
  }

  function startAITimer() {
    clearInterval(aiTimerInterval);
    aiTimeLeft = 20;
    timerRight.textContent = aiTimeLeft + "s";
    timerRight.style.visibility = "visible";
    timerLeft.style.visibility = "hidden";
    aiTimerInterval = setInterval(() => {
      aiTimeLeft--;
      timerRight.textContent = aiTimeLeft + "s";
      if (aiTimeLeft <= 0) {
        clearInterval(aiTimerInterval);
        timerRight.textContent = "Hết giờ";
        playerTurn = true;
        gameOver = true;
        showMessage("Bạn thắng vì bot hết giờ!", "win");
        endGame();
      }
    }, 1000);
  }

  function stopPlayerTimer() {
    clearInterval(playerTimerInterval);
    timerLeft.style.visibility = "hidden";
  }

  function stopAITimer() {
    clearInterval(aiTimerInterval);
    timerRight.style.visibility = "hidden";
  }

  // Bắt đầu ván sau khi chọn phe
  function startGame() {
    sideSelection.style.display = "none";
    turnSelection.classList.remove("hidden");
  }

  // Bắt đầu ván sau khi chọn lượt đi
  function startGameWithTurn(firstPlayer) {
    turnSelection.classList.add("hidden");
    updateTurnStatus();
    
    if (firstPlayer === playerSymbol) {
      playerTurn = true;
      updateTurnStatus();
      startPlayerTimer();
    } else {
      playerTurn = false;
      updateTurnStatus();
      startAITimer();
      // AI đi trước
      fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: playerSymbol,
          board: board,
          row: -1,
          col: -1,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ai_move) {
            const [ar, ac] = data.ai_move;
            placePiece(ar, ac, aiSymbol);
            history.push({ r: ar, c: ac });
          }
          playerTurn = true;
          updateTurnStatus();
          stopAITimer();
          startPlayerTimer();
        });
    }
  }

  // Hàm xử lý khi click vào ô cờ
  function cellClick(r, c) {
    if (!playerTurn || gameOver) return;
    if (board[r][c] !== "") return;

    const cell = document.getElementById(`cell-${r}-${c}`);

    if (selectedCell === null) {
      // Lần click đầu tiên - tô đậm ô
      selectedCell = { r, c };
      cell.classList.add("selected");
    } else if (selectedCell.r === r && selectedCell.c === c) {
      // Click lần 2 vào cùng ô - đánh quân
      cell.classList.remove("selected");
      selectedCell = null;

      // Đánh nước của người chơi
      placePiece(r, c, playerSymbol);
      history.push({ r: r, c: c });
      playerTurn = false;
      updateTurnStatus();
      stopPlayerTimer();
      startAITimer();

      // Gửi request nước đi của người chơi tới server
      fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: playerSymbol,
          board: board,
          row: r,
          col: c,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Nếu người chơi thắng ngay sau nước vừa đi
          if (data.player_win) {
            stopAITimer();
            showMessage("Bạn thắng!", "win");
            endGame();
            return;
          }
          // Thực hiện nước đi của AI nếu có
          if (data.ai_move) {
            const [ar, ac] = data.ai_move;
            placePiece(ar, ac, aiSymbol);
            history.push({ r: ar, c: ac });
          }
          // Nếu AI thắng sau nước vừa đi
          if (data.ai_win) {
            stopAITimer();
            showMessage("Bạn thua!", "lose");
            endGame();
            return;
          }
          playerTurn = true;
          updateTurnStatus();
          stopAITimer();
          startPlayerTimer();
        });
    } else {
      // Click vào ô khác - chuyển selection
      const prevCell = document.getElementById(
        `cell-${selectedCell.r}-${selectedCell.c}`
      );
      prevCell.classList.remove("selected");
      selectedCell = { r, c };
      cell.classList.add("selected");
    }
  }

  // Đặt quân cờ lên bàn (cập nhật cả giao diện và mảng board)
  function placePiece(r, c, symbol) {
    board[r][c] = symbol;
    // Loại bỏ last-move khỏi tất cả các ô
    document
      .querySelectorAll(".last-move")
      .forEach((cell) => cell.classList.remove("last-move"));
    const cell = document.getElementById(`cell-${r}-${c}`);
    cell.textContent = symbol;
    cell.classList.add(symbol);
    cell.classList.remove("selected");
    cell.classList.add("last-move");
  }

  // Hiển thị thông báo (loại: "win", "lose")
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = "";
    messageDiv.classList.add(type, "show");
    if (type !== "win" && type !== "lose") {
      setTimeout(() => {
        messageDiv.classList.remove("show");
      }, 2000);
    }
  }

  // Kết thúc ván cờ
  function endGame() {
    gameOver = true;
    undoBtn.disabled = true;
    playAgainBtn.classList.remove("hidden");
    stopPlayerTimer();
    stopAITimer();
    updateTurnStatus();
  }

  // Bắt đầu lại ván cờ (refresh trang)
  playAgainBtn.addEventListener("click", () => {
    messageDiv.classList.remove("show");
    location.reload();
  });

  // Xử lý nút Undo
  undoBtn.addEventListener("click", () => {
    if (undoUsed || gameOver) return;
    if (history.length === 0) return;
    // Xóa nước cuối của AI (nếu có)
    if (history.length > 0) {
      const last = history.pop();
      board[last.r][last.c] = "";
      const cell = document.getElementById(`cell-${last.r}-${last.c}`);
      cell.textContent = "";
      cell.classList.remove("X", "O", "selected", "last-move");
    }
    // Xóa nước cuối của người chơi
    if (history.length > 0) {
      const last = history.pop();
      board[last.r][last.c] = "";
      const cell = document.getElementById(`cell-${last.r}-${last.c}`);
      cell.textContent = "";
      cell.classList.remove("X", "O", "selected", "last-move");
    }
    undoUsed = true;
    undoBtn.disabled = true;
    if (playerTurn && !gameOver) {
      startPlayerTimer();
    }
  });

  // Chọn phe X hoặc O
  chooseXBtn.addEventListener("click", () => {
    playerSymbol = "X";
    aiSymbol = "O";
    startGame();
  });

  chooseOBtn.addEventListener("click", () => {
    playerSymbol = "O";
    aiSymbol = "X";
    startGame();
  });

  // Chọn lượt đi
  chooseFirstBtn.addEventListener("click", () => {
    startGameWithTurn(playerSymbol);
  });

  chooseSecondBtn.addEventListener("click", () => {
    startGameWithTurn(aiSymbol);
  });
});
