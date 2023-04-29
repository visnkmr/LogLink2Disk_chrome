export function getTodayDateTimeString() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let hour = today.getHours();
    let minute = today.getMinutes();
    let second = today.getSeconds();
    let paddedMonth = month < 10 ? "0" + month : month.toString();
    let paddedDay = day < 10 ? "0" + day : day.toString();
    let paddedHour = hour < 10 ? "0" + hour : hour.toString();
    let paddedMinute = minute < 10 ? "0" + minute : minute.toString();
    let paddedSecond = second < 10 ? "0" + second : second.toString();
    return paddedDay + "-" + paddedMonth + "-" + year + "_" + paddedHour + "-" + paddedMinute + "-" + paddedSecond;
}
