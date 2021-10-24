function contains(arr, item) {
    let itemString = JSON.stringify(item);

    return arr.some(el => {
        return JSON.stringify(el) === itemString;
    });
}

export default contains;