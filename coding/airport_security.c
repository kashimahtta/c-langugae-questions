/*
TITLE: Approved Cabin Bags
DESCRIPTION: Counts cabin bags that meet the airline’s weight policy.
STATEMENT:
Given an array of bag weights in kilograms, return the number of bags weighing at least 7 kg and at most 15 kg.
*/
#include <stdio.h>

int count_approved_cabin_bags(int weights[], int n) {
    int count = 0;

    for (int i = 0; i < n; i++) {
        if (weights[i] >= 7 && weights[i] <= 15) {
            count++;
        }
    }

    return count;
}