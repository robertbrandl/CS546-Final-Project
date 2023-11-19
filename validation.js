export function checkString(str){
    if (!str || str === undefined){
        throw "The argument is not supplied, null, undefined, 0, false, '', or NaN";
    }
    if (typeof str !== 'string') {
        throw `${str} is not a string`;
    }
    let trimStr = str.trim();
    if (trimStr.length === 0){
        throw 'The argument cannot be empty';
    }
    return trimStr;
}