
#include <iostream>
using namespace std;

int main() {
    int rows, cols;
    cout << "Enter rows and cols: ";
    cin >> rows >> cols;

    int num = 1;
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            cout << num << " ";
            num++;
        }
        cout << endl;
    }
    return 0;
}

