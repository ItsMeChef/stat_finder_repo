class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

export default class LinkedList {
    constructor() {
        this.head = null
    }

    append(obj) {
        const newNode = new Node(obj)

        if (!this.head) {
            this.head = newNode
            return
        }
        let current = this.head
        while (current.next) {
            current = current.next
        }
        current.next = newNode
    }

    find(key, value) {
        let current = this.head
        while (current) {
            if (current.data[key] === value) {
                return current.data
            }
            current = current.next
        }
        return null
    }

    deleteById(id) {
        if (!this.head) {
            return false
        }

        if (this.head.data.id === id) {
            this.head = this.head.next
            return true
        }
        
        let currentHead = this.head
        while (currentHead.next) {
            if (currentHead.next.data.id === id) {
                currentHead.next = currentHead.next.next;
                return true                
            }
            current = current.next
        }
        return false
    }

    printList() {
        let current = this.head
        let output = ''
        while (current) {
            output += `${JSON.stringify(current.data)} -> \n`
            current = current.next
        }
        console.log(output + 'null')
    }
}