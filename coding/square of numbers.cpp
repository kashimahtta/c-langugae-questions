#include <iostream>
using namespace std;

int main() {
    int side;
    cout << "Enter side: ";
    cin >> side;

    int num = 1;
    for (int i = 0; i < side; i++) {
        for (int j = 0; j < side; j++) {
            cout << num << " ";
            num++;
        }
        cout << endl;
    }
    return 0;
}
