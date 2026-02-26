class Sort {
    /**
     * 
     * @param {Array} arr 
     */
    static selectionSort(arr) {
        for (let i = 0; i < arr.length; i++) {
            let min = i;
            for (let j = i; j < arr.length; j++) {
                if (arr[j] < arr[min]) {
                    min = j
                }
            }
            [arr[i], arr[min]] = [arr[min], arr[i]];
        }
        return arr;
    }

    /**
     * 
     * @param {Array} arr 
     */
    static insertinoSort(arr) {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        return arr;
    }

    /**
     * 
     * @param {Array} arr 
     */
    static bubbleSort(arr) {
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                }
            }
        }
        return arr;
    }

    /**
     * 
     * @param {Array} arr 
     */
    static shellSort(arr) {
        let n = arr.length;
        for (let g = Math.floor(n / 2); g > 0; g = Math.floor(g / 2)) {
            for (let i = g; i < n; i++) {
                let temp = arr[i];
                let j = i;
                while (j >= g && arr[j - g] > temp) {
                    arr[j] = arr[j - g];
                    j -= g;
                }
                arr[j] = temp;
            }
        }
        return arr;
    }

    /**
     * 
     * @param {Array} arr 
     */
    static mergeSort(arr) {
        if (arr.length <= 1) return arr;
        const mid = Math.floor(arr.length / 2);
        const left = Sort.mergeSort(arr.slice(0, mid));
        const right = Sort.mergeSort(arr.slice(mid));
        return Sort.merge(left, right);
    }

    /**
     * @private
     * @param {Array} left 
     * @param {Array} right 
    */
    static merge(left, right) {
        let result = [];
        let i = 0, j = 0;
        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    }

    /**
     * 
     * @param {Array} arr 
     */
    static quickSort(arr) {
        if (arr.length <= 1) return arr;
        const pivot = arr[arr.length - 1];
        const left = []
        const right = []

        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] < pivot) {
                left.push(arr[i]);
            } else {
                right.push(arr[i])
            }
        }

        return [...Sort.quickSort(left), pivot, ...Sort.quickSort(right)];
    }

    static log(label, data) {
        console.time(label);
        console.log(data);
        console.timeEnd(label);
    }
}


const d = [5, 20, 10, 8, 7, 1, 0];

Sort.log("Selection Sort", Sort.selectionSort([...d]));
Sort.log("Insertion Sort", Sort.insertinoSort([...d]));
Sort.log("Bubble Sort", Sort.bubbleSort([...d]));
Sort.log("Shell Sort", Sort.shellSort([...d]));
Sort.log("Merge Sort", Sort.mergeSort([...d]));
Sort.log("Quick Sort", Sort.quickSort([...d]));