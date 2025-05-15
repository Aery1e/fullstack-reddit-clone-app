export default function Timestamp(post) {
  const now = new Date();
  const difference = now - post;
  //Seconds
  if (difference < 60000) {
    return "" + Math.trunc(difference / 1000) + " second(s) ago";
  }
  //Minutes
  else if (difference < 3600000) {
    return "" + Math.trunc(difference / 1000 / 60) + " minute(s) ago";
  }
  //Hours
  else if (difference < 86400000) {
    // Changed to 24 hours
    return "" + Math.trunc(difference / 1000 / 60 / 60) + " hour(s) ago";
  }
  //Days
  else if (difference < 2628000000) {
    return "" + Math.trunc(difference / 1000 / 60 / 60 / 24) + " day(s) ago";
  }
  //Months
  else if (difference < 31540000000) {
    return (
      "" + Math.trunc(difference / 1000 / 60 / 60 / 24 / 30) + " month(s) ago"
    );
  }
  //Years
  else {
    return (
      "" +
      Math.trunc(difference / 1000 / 60 / 60 / 24 / 30 / 12) +
      " year(s) ago"
    );
  }
}
