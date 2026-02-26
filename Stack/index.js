class Stack {
    constructor() {
        this.stack = [];
    }

    push(val) {
        this.stack.push(val);
    }

    pop() {
        return this.stack.pop();
    }

    peek() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    }

    isEmpty() {
        return this.stack.length === 0;
    }

    clear() {
        this.stack = [];
    }

    get size() {
        return this.stack.length;
    }
}

const s = new Stack();
s.push("A");
s.push("B");
s.push("C");
console.log(s.pop());
console.log(s);