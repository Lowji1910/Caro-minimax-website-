import math
import time

def check_win(board, symbol):
    n = len(board)
    directions = [(0,1), (1,0), (1,1), (1,-1)]
    for r in range(n):
        for c in range(n):
            if board[r][c] != symbol:
                continue
            for dr, dc in directions:
                pr, pc = r - dr, c - dc
                if 0 <= pr < n and 0 <= pc < n and board[pr][pc] == symbol:
                    continue
                count = 0
                rr, cc = r, c
                while 0 <= rr < n and 0 <= cc < n and board[rr][cc] == symbol:
                    count += 1
                    rr += dr
                    cc += dc
                if count >= 5:
                    left_block = False
                    right_block = False
                    lr, lc = r - dr, c - dc
                    if not (0 <= lr < n and 0 <= lc < n) or board[lr][lc] != '':
                        left_block = True
                    rr_end, cc_end = r + dr*count, c + dc*count
                    if not (0 <= rr_end < n and 0 <= cc_end < n) or board[rr_end][cc_end] != '':
                        right_block = True
                    if not (left_block and right_block):
                        return True
    return False

def can_win_next(board, symbol):
    n = len(board)
    for r in range(n):
        for c in range(n):
            if board[r][c] == '':
                board[r][c] = symbol
                if check_win(board, symbol):
                    board[r][c] = ''
                    return True
                board[r][c] = ''
    return False

def evaluate_board(board, ai_symbol, player_symbol):
    n = len(board)
    score = 0
    directions = [(0,1), (1,0), (1,1), (1,-1)]
    
    for r in range(n):
        for c in range(n):
            if board[r][c] == '':
                continue
            symbol = board[r][c]
            for dr, dc in directions:
                pr, pc = r - dr, c - dc
                if 0 <= pr < n and 0 <= pc < n and board[pr][pc] == symbol:
                    continue
                count = 0
                rr, cc = r, c
                while 0 <= rr < n and 0 <= cc < n and board[rr][cc] == symbol:
                    count += 1
                    rr += dr
                    cc += dc
                if count == 0:
                    continue
                left_block = False
                right_block = False
                lr, lc = r - dr, c - dc
                if not (0 <= lr < n and 0 <= lc < n) or board[lr][lc] != '':
                    left_block = True
                rr_end, cc_end = r + dr*count, c + dc*count
                if not (0 <= rr_end < n and 0 <= cc_end < n) or board[rr_end][cc_end] != '':
                    right_block = True
                blocked = left_block + right_block

                if symbol == ai_symbol:
                    if count >= 5 and blocked < 2:
                        return 1000000
                    if count == 4:
                        score += (50000 if blocked == 0 else 5000)
                    elif count == 3:
                        score += (1000 if blocked == 0 else 100)
                    elif count == 2:
                        score += (50 if blocked == 0 else 5)
                elif symbol == player_symbol:
                    if count >= 5 and blocked < 2:
                        return -1000000
                    if count == 4:
                        score -= (40000 if blocked == 0 else 4000)
                    elif count == 3:
                        score -= (800 if blocked == 0 else 80)
                    elif count == 2:
                        score -= (40 if blocked == 0 else 4)
    return score

def get_valid_moves(board, limit_radius=2):
    n = len(board)
    has_stone = any(board[r][c] != '' for r in range(n) for c in range(n))
    if not has_stone:
        return [(n//2, n//2)]
    neighbors = set()
    for r in range(n):
        for c in range(n):
            if board[r][c] != '':
                for dr in range(-limit_radius, limit_radius + 1):
                    for dc in range(-limit_radius, limit_radius + 1):
                        rr, cc = r + dr, c + dc
                        if 0 <= rr < n and 0 <= cc < n and board[rr][cc] == '':
                            neighbors.add((rr, cc))
    return list(neighbors)

def minimax(board, depth, alpha, beta, is_maximizing, ai_symbol, player_symbol, start_time, time_limit):
    if time.time() - start_time > time_limit:
        return evaluate_board(board, ai_symbol, player_symbol)

    if check_win(board, ai_symbol):
        return 100000
    if check_win(board, player_symbol):
        return -100000
    if depth == 0:
        return evaluate_board(board, ai_symbol, player_symbol)

    moves = get_valid_moves(board)
    if not moves:
        return 0

    if is_maximizing:
        max_eval = -math.inf
        for (r, c) in moves:
            board[r][c] = ai_symbol
            eval = minimax(board, depth-1, alpha, beta, False, ai_symbol, player_symbol, start_time, time_limit)
            board[r][c] = ''
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = math.inf
        for (r, c) in moves:
            board[r][c] = player_symbol
            eval = minimax(board, depth-1, alpha, beta, True, ai_symbol, player_symbol, start_time, time_limit)
            board[r][c] = ''
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval

def get_ai_move(board, ai_symbol, player_symbol):
    n = len(board)
    start_time = time.time()
    time_limit = 3
    depth = 4
    for r in range(n):
        for c in range(n):
            if board[r][c] == '':
                board[r][c] = ai_symbol
                if check_win(board, ai_symbol):
                    board[r][c] = ''
                    return (r, c)
                board[r][c] = ''
    for r in range(n):
        for c in range(n):
            if board[r][c] == '':
                board[r][c] = player_symbol
                if check_win(board, player_symbol):
                    board[r][c] = ''
                    return (r, c)
                board[r][c] = ''

    best_score = -math.inf
    best_move = None
    moves = get_valid_moves(board)
    moves.sort(key=lambda move: sum(
        1 for dr in [-1, 0, 1] for dc in [-1, 0, 1]
        if 0 <= move[0]+dr < n and 0 <= move[1]+dc < n and board[move[0]+dr][move[1]+dc] != ''
    ), reverse=True)

    for (r, c) in moves:
        board[r][c] = ai_symbol
        score = minimax(board, depth, -math.inf, math.inf, False, ai_symbol, player_symbol, start_time, time_limit)
        board[r][c] = ''
        if score > best_score:
            best_score = score
            best_move = (r, c)

    # Nếu không tìm được nước đi tốt, chọn ô đầu tiên trống
    if best_move is None:
        for r in range(n):
            for c in range(n):
                if board[r][c] == '':
                    return (r, c)
    return best_move