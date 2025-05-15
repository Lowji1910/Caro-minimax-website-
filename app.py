from flask import Flask, render_template, request, jsonify
from ai import get_ai_move, check_win, can_win_next
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/move', methods=['POST'])
def move():
    data = request.get_json()
    player = data['player']          # Ký hiệu của người chơi: 'X' hoặc 'O'
    ai = 'O' if player == 'X' else 'X'
    board = data['board']           # Bàn cờ hiện tại 
    row = data['row']
    col = data['col']

    player_win = False
    ai_win = False

    # Trường hợp người chơi chọn đi trước (row, col >= 0)
    if row >= 0:
        board[row][col] = player
        # Kiểm tra người chơi đã thắng ngay khi vừa đi
        if check_win(board, player):
            player_win = True

    # Nếu chưa thắng, tính nước đi của AI
    if not player_win:
        # AI đi
        ai_move = None
        # Nếu người chơi chọn O (AI là X và đi trước), ta gọi hàm AI khi row = -1
        if row < 0:
            ai_move = get_ai_move(board, ai, player)
        else:
            ai_move = get_ai_move(board, ai, player)
        # Thực hiện nước đi của AI (nếu có)
        if ai_move:
            ar, ac = ai_move
            board[ar][ac] = ai
            if check_win(board, ai):
                ai_win = True

    # Xác định cảnh báo thắng/thua (nếu ván chưa kết thúc)
    player_about_to_win = False
    player_about_to_lose = False
    if not player_win and not ai_win:
        # Nếu người chơi có thể thắng ở nước tiếp (của người chơi)
        player_about_to_win = can_win_next(board, player)
        # Nếu AI có thể thắng ở nước tiếp (nước của AI)
        player_about_to_lose = can_win_next(board, ai)

    # Chuẩn bị kết quả trả về
    result = {
        'board': board,
        'ai_move': ai_move if not player_win else None,
        'player_win': player_win,
        'ai_win': ai_win,
        'player_about_to_win': player_about_to_win,
        'player_about_to_lose': player_about_to_lose
    }
    return jsonify(result)

@app.route('/get_first_player', methods=['GET'])
def get_first_player():
    return jsonify({'first_player': random.choice(['X', 'O'])})

if __name__ == '__main__':
    app.run(debug=True)
