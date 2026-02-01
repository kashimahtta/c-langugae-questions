

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// Define constants
#define NUM_PLAYERS 2
#define BOARD_SIZE 16
#define NUM_PIECES 4

// Define structures
typedef struct {
    int player;
    int position;
} Piece;

// Function prototypes
void initializeBoard(Piece pieces[NUM_PIECES]);
void printBoard(Piece pieces[NUM_PIECES]);
void rollDice(int *diceValue);
void movePiece(Piece *piece, int diceValue);
void playGame(Piece pieces[NUM_PIECES]);

int main() {
    // Initialize random number generator
    srand(time(NULL));

    // Initialize pieces
    Piece pieces[NUM_PIECES] = {{1, 0}, {1, 0}, {2, 0}, {2, 0}};

    // Play game
    playGame(pieces);

    return 0;
}

void initializeBoard(Piece pieces[NUM_PIECES]) {
    // Initialize pieces at starting position
    for (int i = 0; i < NUM_PIECES; i++) {
        pieces[i].position = 0;
    }
}

void printBoard(Piece pieces[NUM_PIECES]) {
    // Print current state of the board
    for (int i = 0; i < BOARD_SIZE; i++) {
        printf("%d ", i);
        for (int j = 0; j < NUM_PIECES; j++) {
            if (pieces[j].position == i) {
                printf("P%d ", pieces[j].player);
            } else {
                printf(". ");
            }
        }
        printf("\n");
    }
}

void rollDice(int *diceValue) {
    // Simulate rolling a dice
    *diceValue = rand() % 6 + 1;
}

void movePiece(Piece *piece, int diceValue) {
    // Move piece based on dice value
    piece->position += diceValue;
    if (piece->position >= BOARD_SIZE) {
        piece->position -= BOARD_SIZE;
    }
}

void playGame(Piece pieces[NUM_PIECES]) {
    int currentPlayer = 0;
    int diceValue;

    while (1) {
        // Print current state of the board
        printBoard(pieces);

        // Roll dice
        rollDice(&diceValue);
        printf("Player %d rolled a %d\n", currentPlayer + 1, diceValue);

        // Move piece
        movePiece(&pieces[currentPlayer * 2], diceValue);

        // Check for win
        if (pieces[currentPlayer * 2].position == BOARD_SIZE - 1) {
            printf("Player %d wins!\n", currentPlayer + 1);
            break;
        }

        // Switch player
        currentPlayer = (currentPlayer + 1) % NUM_PLAYERS;
    }
}

