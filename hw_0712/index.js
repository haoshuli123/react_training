
// 1 - filter
Array.prototype.myFilter = function (callback) {
    const result = [];
    for(let i = 0; i < this.length; i++){
        if (callback(this[i], i, this)) {
            result.push(this[i]);
        }
        
    }
    return result;
}


// 2 - map
Array.prototype.myMap = function (callback) {
    const result = [];
    for(let i = 0; i < this.length; i++){
        result.push(callback(this[i], i, this));
    }
    return result;
}



// 3 - includes
Array.prototype.myIncludes = function (element) {
    for(let i = 0; i < this.length; i++){
        if(this[i] === element){
            return true;
        }
    }
    return false;
}



// 4 pop
Array.prototype.myPop = function (){
    let len = this.length;
    if (len == 0){
        return false;
    }else{
        let output = this[len - 1];
        delete this[len - 1];
        this.length--;
        return output;
    }
}




// 5 - reduce
Array.prototype.myReduce = function (callback, initialVal) {
    let acc = initialVal === undefined ? 0 : initialVal;
    for(let i = 0; i < this.length; i++){
        acc = callback(acc, this[i], i, this);
    }
    return acc;
}



// 6 - slice
Array.prototype.mySlice = function (start, end=this.length) {
    const result = [];
    if(start < 0) {
        start+=this.length
        if (start < 0){
            start = 0
        }
    }

    if(end < 0) {
        end+=this.length
        if (end < 0){
            end = 0
        }
    }
    for(let i = start; i < end; i++){
        result.push(this[i]);
    }
    return result;
}


// Tests
const arr = [1, 2, 3, 4, 5];
console.log(arr.myFilter(x => x%2 === 0));
console.log(arr.myMap(x => x*2));
console.log(arr.myIncludes(5));
console.log(arr.myReduce((sum, x) => sum + x, 0));
console.log(arr.mySlice(1, 2));
console.log(arr.myPop()); 
console.log(arr);
