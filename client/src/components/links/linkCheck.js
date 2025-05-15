export default function linkCheck(element) {
  //Find index of link
  let index = element.textContent.indexOf("](");
  //Check if [] is empty
  if (element.textContent[index - 1] === "[") {
    alert("Text to link is empty");
    return;
  }
  //Check if () is empty
  if (element.textContent[index + 2] === ")") {
    alert("Hyperlink is empty");
    return;
  }
  //Check if protocol is included and correct
  if (
    element.textContent.substring(index + 2, index + 8) !== "http://" &&
    element.textContent.substring(index + 2, index + 9) !== "https://"
  ) {
    alert("protocol for link is wrong or missing");
    return;
  }
}
