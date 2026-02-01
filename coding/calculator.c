//simple calculator by Kashi 
#include <stdio.h>

int main() {
    char operator;//defining variables 
    double num1, num2;
    double result;

    printf("Which operator you want (+, -, *, /,): ");//%(remainder)not able to use .. ask sir !!
    scanf("%c", &operator);

    printf("Enter numbers: ");
    scanf("%lf %lf", &num1, &num2);//double datatype is used so %1f

    switch(operator) {
        case '+'://addition
            result = num1 + num2;
            printf("%.2lf + %.2lf = %.2lf\n", num1, num2, result);
            break;

        case '-'://subtraction
            result = num1 - num2;
            printf("%.2lf - %.2lf = %.2lf\n", num1, num2, result);
            break;

        case '*':// multiplication
            result = num1 * num2;
            printf("%.2lf * %.2lf = %.2lf\n", num1, num2, result);
            break;

        case '/'://division
            if (num2 != 0) {
                result = num1 / num2;
                printf("%.2lf / %.2lf = %.2lf\n", num1, num2, result);
            } else {
                printf("Error! Division by zero is not allowed.\n");
            }
            break;
        //case '%':// remainder 
        	//result = num1 % num2;
        //	printf("%.2lf % %.2lf = %.2lf\n", num1, num2, result);
        //	break;
        	
        default:
            printf("Error! This is wrong.\n");
            break;
    }

    return 0;
}