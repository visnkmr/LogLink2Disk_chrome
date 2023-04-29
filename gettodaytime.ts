// Define a function that returns today's date and time as a string
export function getTodayDateTimeString() {
    // Create a new Date object with the current date and time
    let today = new Date();
    // Get the year, month, day, hour, minute and second from the Date object
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // Months are zero-based
    let day = today.getDate();
    let hour = today.getHours();
    let minute = today.getMinutes();
    let second = today.getSeconds();
    // Pad the month, day, hour, minute and second with leading zeros if needed
    let paddedMonth = month < 10 ? "0" + month : month.toString();
    let paddedDay = day < 10 ? "0" + day : day.toString();
    let paddedHour = hour < 10 ? "0" + hour : hour.toString();
    let paddedMinute = minute < 10 ? "0" + minute : minute.toString();
    let paddedSecond = second < 10 ? "0" + second : second.toString();
    // Return the date and time as a string in the format yyyy-mm-dd_hh-mm-ss
    return paddedDay + "-" + paddedMonth + "-" + year + "_" + paddedHour + "-" + paddedMinute + "-" + paddedSecond;
    }