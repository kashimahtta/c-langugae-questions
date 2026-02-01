#include <stdio.h>
#include <stdlib.h>

void add();
void subtract();
void multiply();
void divide();
void menu();

int main() {
    int choice;

    while (1) {
        menu();
        printf("Enter your choice (1-5): ");
        scanf("%d", &choice);

        switch (choice) {
            case 1:
                add();
                break;
            case 2:
                subtract();
                break;
            case 3:
                multiply();
                break;
            case 4:
                divide();
                break;
            case 5:
                printf("Exiting...\n");
                exit(0);
            default:
                printf("Invalid choice! Please try again.\n");
        }
    }

    return 0;
}

void menu() {
    printf("\nSimple Calculator\n");
    printf("1. Add\n");
    printf("2. Subtract\n");
    printf("3. Multiply\n");
    printf("4. Divide\n");
    printf("5. Exit\n");
}

void add() {
    double num1, num2, result;
    printf("Enter two numbers to add: ");
    scanf("%lf %lf", &num1, &num2);
    result = num1 + num2;
    printf("Result: %.2lf + %.2lf = %.2lf\n", num1, num2, result);
}

void subtract() {
    double num1, num2, result;
    printf("Enter two numbers to subtract: ");
    scanf("%lf %lf", &num1, &num2);
    result = num1 - num2;
    printf("Result: %.2lf - %.2lf = %.2lf\n", num1, num2, result);
}

void multiply() {
    double num1, num2, result;
    printf("Enter two numbers to multiply: ");
    scanf("%lf %lf", &num1, &num2);
    result = num1 * num2;
    printf("Result: %.2lf * %.2lf = %.2lf\n", num1, num2, result);
}

void divide() {
    double num1, num2, result;
    printf("Enter two numbers to divide: ");
    scanf("%lf %lf", &num1, &num2);
    if (num2 != 0) {
        result = num1 / num2;
        printf("Result: %.2lf / %.2lf = %.2lf\n", num1, num2, result);
    } else {
        printf("Error! Division by zero is not allowed.\n");
    }
}