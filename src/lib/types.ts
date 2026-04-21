export type Difficulty = 'easy' | 'normal' | 'hard';
export type Algorithm = 'Bubble Sort' | 'Selection Sort' | 'Insertion Sort' | 'Merge Sort' | 'Quick Sort';
export type Step = { type: "swap"; a: number; b: number } | { type: "compare"; a: number; b: number } | { type: "overwrite"; index: number; value: number };
