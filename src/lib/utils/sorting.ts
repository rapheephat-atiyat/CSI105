import type { Algorithm, Difficulty, Step } from "$lib/types";

const difficultyConfig: Record<Difficulty, { min: number; max: number }> = {
    easy: { min: 5, max: 8 },
    normal: { min: 8, max: 12 },
    hard: { min: 12, max: 20 }
};

export function generateArray(difficulty: Difficulty) {
    const { min, max } = difficultyConfig[difficulty];
    const size = Math.floor(Math.random() * (max - min + 1)) + min;
    return Array.from({ length: size }, () =>
        Math.floor(Math.random() * 90) + 10
    );
}

export function getSolutionSteps(algo: Algorithm, arr: number[]) {
    switch (algo) {
        case "Selection Sort":
            return getSelectionSortSolution(arr);
        case "Insertion Sort":
            return getInsertionSortSolution(arr);
        case "Quick Sort":
            return getQuickSortSolution(arr);
        case "Merge Sort":
            return getMergeSortSolution(arr);
        default:
            return getBubbleSortSolution(arr);
    }
}

function getBubbleSortSolution(arr: number[]) {
    let steps: Step[] = [];
    let temp = [...arr];
    let n = temp.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (temp[j] > temp[j + 1]) {
                steps.push({ type: "swap", a: j, b: j + 1 });
                [temp[j], temp[j + 1]] = [temp[j + 1], temp[j]];
            }
        }
    }
    return { steps, sorted: temp };
}

function getSelectionSortSolution(arr: number[]) {
    let steps: Step[] = [];
    let temp = [...arr];
    let n = temp.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (temp[j] < temp[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            steps.push({ type: "swap", a: i, b: minIdx });
            [temp[i], temp[minIdx]] = [temp[minIdx], temp[i]];
        }
    }
    return { steps, sorted: temp };
}

function getInsertionSortSolution(arr: number[]) {
    let steps: Step[] = [];
    let temp = [...arr];
    let n = temp.length;
    for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0 && temp[j - 1] > temp[j]) {
            steps.push({ type: "swap", a: j - 1, b: j });
            [temp[j - 1], temp[j]] = [temp[j], temp[j - 1]];
            j--;
        }
    }
    return { steps, sorted: temp };
}

function getQuickSortSolution(arr: number[]) {
    let steps: Step[] = [];
    let temp = [...arr];
    function quickSort(low: number, high: number) {
        if (low < high) {
            let pivot = temp[high];
            let i = low - 1;
            for (let j = low; j < high; j++) {
                if (temp[j] < pivot) {
                    i++;
                    if (i !== j) {
                        steps.push({ type: "swap", a: i, b: j });
                        [temp[i], temp[j]] = [temp[j], temp[i]];
                    }
                }
            }
            if (i + 1 !== high) {
                steps.push({ type: "swap", a: i + 1, b: high });
                [temp[i + 1], temp[high]] = [temp[high], temp[i + 1]];
            }
            let pi = i + 1;
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
        }
    }
    quickSort(0, temp.length - 1);
    return { steps, sorted: temp };
}

function getMergeSortSolution(arr: number[]) {
    let steps: Step[] = [];
    let temp = [...arr];
    function mergeSorted(left: number, mid: number, right: number) {
        let l = left;
        let r = mid + 1;
        while (l <= mid && r <= right) {
            if (temp[l] <= temp[r]) {
                l++;
            } else {
                let value = temp[r];
                let index = r;
                while (index > l) {
                    steps.push({ type: "swap", a: index - 1, b: index });
                    temp[index] = temp[index - 1];
                    index--;
                }
                temp[l] = value;
                l++;
                mid++;
                r++;
            }
        }
    }
    function mergeSort(l: number, r: number) {
        if (l < r) {
            let m = Math.floor((l + r) / 2);
            mergeSort(l, m);
            mergeSort(m + 1, r);
            mergeSorted(l, m, r);
        }
    }
    mergeSort(0, temp.length - 1);
    return { steps, sorted: temp };
}
