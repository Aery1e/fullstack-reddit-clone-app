export default function textToLink(element) {
  //Find index of link
  let index = element.textContent.indexOf("](");
  //Create Link element
  let link = document.createElement("a");
  //Create following text element
  let text = document.createElement("p");
  //Find index of [
  let nameStart = index;
  while (element.textContent[nameStart] != "[") {
    nameStart--;
    if (nameStart < 0) {
      break;
    }
  }
  //Find index of )
  let linkEnd = index;
  while (element.textContent[linkEnd] != ")") {
    linkEnd++;
    if (linkEnd === element.textContent.length) {
      break;
    }
  }
  // Create name
  let txt = document.createTextNode(
    element.textContent.substring(nameStart + 1, index)
  );
  // Link anchor element to txt
  link.appendChild(txt);
  // Add hyperlink
  link.href = element.textContent.substring(index + 2, linkEnd);

  //Create new element to hold remaning text
  let remainText = document.createElement("p");
  remainText.textContent = element.textContent.substring(linkEnd + 1);
  //Remove the redundant text
  element.textContent = element.textContent.substring(0, nameStart);
  element.appendChild(link);
  element.appendChild(remainText);
}
