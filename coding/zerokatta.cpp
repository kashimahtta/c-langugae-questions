

#include <iostream>
using namespace std;

// Function to print the game board
void printBoard(char board[3][3]) {
    cout << " " << board[0][0] << " | " << board[0][1] << " | " << board[0][2] << endl;
    cout << "-----------" << endl;
    cout << " " << board[1][0] << " | " << board[1][1] << " | " << board[1][2] << endl;
    cout << "-----------" << endl;
    cout << " " << board[2][0] << " | " << board[2][1] << " | " << board[2][2] << endl;
}

// Function to check for a win
bool checkWin(char board[3][3], char player) {
    // Check rows
    for (int i = 0; i < 3; i++) {
        if (board[i][0] == player && board[i][1] == player && board[i][2] == player) {
            return true;
        }
    }
    // Check columns
    for (int i = 0; i < 3; i++) {
        if (board[0][i] == player && board[1][i] == player && board[2][i] == player) {
            return true;
        }
    }
    // Check diagonals
    if ((board[0][0] == player && board[1][1] == player && board[2][2] == player) ||
        (board[0][2] == player && board[1][1] == player && board[2][0] == player)) {
        return true;
    }
    return false;
}

int main() {
    char board[3][3] = {{'1', '2', '3'}, {'4', '5', '6'}, {'7', '8', '9'}};
    char player = 'X';
    int move;

    while (true) {
        printBoard(board);
        cout << "Player " << player << ", enter your move (1-9): ";
        cin >> move;

        // Update the board
        switch (move) {
            case 1: board[0][0] = player; break;
            case 2: board[0][1] = player; break;
            case 3: board[0][2] = player; break;
            case 4: board[1][0] = player; break;
            case 5: board[1][1] = player; break;
            case 6: board[1][2] = player; break;
            case 7: board[2][0] = player; break;
            case 8: board[2][1] = player; break;
            case 9: board[2][2] = player; break;
            default: cout << "Invalid move!" << endl; continue;
        }

        // Check for a win
        if (checkWin(board, player)) {
            printBoard(board);
            cout << "Player " << player << " wins!" << endl;
            break;
        }

        // Switch player
        player = (player == 'X') ? 'O' : 'X';
    }

    return 0;
}
