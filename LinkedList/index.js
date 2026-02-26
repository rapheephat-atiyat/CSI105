class ListNode {
    constructor(data, next = null) {
        this.data = data;
        this.next = next;
    }
}

class LinkedList {
    constructor(val = null) {
        this.head = val !== null ? new ListNode(val) : null;
        this.length = 0;
    }

    prepend(val) {
        this.head = new ListNode(val, this.head);
        this.length++;
    }

    append(val) {
        const newNode = new ListNode(val);
        if (this.head === null) {
            return this.head = newNode;
        }

        let cur = this.head;
        while (cur.next) cur = cur.next;
        cur.next = newNode;
        this.length++;
    }

    shift() {
        if (!this.head) return;
        this.head = this.head.next;
        this.length--;
    }

    pop() {
        if (!this.head) return null;
        if (!this.head.next) return this.head = null;

        let cur = this.head;
        while (cur.next.next) cur = cur.next;
        cur.next = null;
        this.length--;
    }

    removeAt(index) {
        if (!this.head) return;
        if (index === 0) return this.head = this.head.next;
        let cur = this.head;
        let i = 0;
        while (cur.next && i < index - 1) {
            cur = cur.next;
            i++;
        }
        if (!cur.next) return;
        cur.next = cur.next.next;
    }

    reverse() {
        let prev = null;
        let cur = this.head;
        while (cur) {
            const next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        head = prev;
    }
}

const list = new LinkedList();

const data1 = new ListNode(1)
const data2 = new ListNode(2)
const data3 = new ListNode(3)

list.append(data1)
list.prepend(data2)
list.append(data3)
list.shift()

console.log(list);