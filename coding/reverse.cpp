#include <iostream>
#include <string>

std::string reverseString(const std::string& str) {
    std::string reversed = "";
    for (int i = str.length() - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

int main() {
    std::string input;
    std::cout << "Enter a string: ";
    std::cin >> input;
    std::cout << "Reversed: " << reverseString(input) << std::endl;
    return 0;
}
