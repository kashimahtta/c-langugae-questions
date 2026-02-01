#include <iostream>
#include <string>

class BankAccount {
private:
    int accountNo;
    std::string accountHolderName;
    double balance;

public:
    BankAccount(int accountNo, std::string accountHolderName, double balance)
        : accountNo(accountNo), accountHolderName(accountHolderName), balance(balance) {}

    void deposit(double amount) {
        balance += amount;
        std::cout << "Deposit: " << amount << std::endl;
    }

    void withdraw(double amount) {
        if (balance >= amount) {
            balance -= amount;
            std::cout << "Withdraw: " << amount << std::endl;
        } else {
            std::cout << "Insufficient funds!" << std::endl;
        }
    }

    void display() const {
        std::cout << "Account No: " << accountNo << std::endl;
        std::cout << "Account Holder Name: " << accountHolderName << std::endl;
        std::cout << "Balance: " << balance << std::endl;
    }
};

int main() {
    BankAccount account(123456789, "Kashi", 1500.0);
    account.display();
    account.deposit(800.0);
    account.withdraw(300.0);
    account.display();

    return 0;
}
