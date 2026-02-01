#include <iostream>

int sum2DArray(int arr[][3], int rows, int cols) {
    int sum = 0;
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            sum += arr[i][j];
        }
    }
    return sum;
}

int main() {
    int arr[][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int rows = 3;
    int cols = 3;
    std::cout << "Sum: " << sum2DArray(arr, rows, cols) << std::endl;
    return 0;
}
