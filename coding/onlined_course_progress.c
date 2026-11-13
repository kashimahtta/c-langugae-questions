/*
TITLE: Online Course Progress
DESCRIPTION: Counts students who have started but not completed an online course.
STATEMENT:
Given an array of course completion percentages, return the number of students whose progress is greater than 0% and less than 100%.
*/int count_in_progress_students(int progress[], int n) {
    int count = 0;

    for (int i = 0; i < n; i++) {
        if (progress[i] > 0 && progress[i] < 100) {
            count++;
        }
    }

    return count;
}