const stringTrim = (strToTrim, lengthOfStr, delim, ellipsis) => {
  if (strToTrim.length <= lengthOfStr) return strToTrim;

  let trimmedStr = strToTrim.substr(0, lengthOfStr + delim.length);

  const lastDelimIndex = trimmedStr.lastIndexOf(delim);
  if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);

  if (trimmedStr) trimmedStr += ellipsis;
  return trimmedStr;
};

export default stringTrim;
