
//I am SOOOO SICK of typing 'JSON.stringify' and having it be hard to read in the console anyway. This makes it easy and also readable:
export const q = (thing) => {
  //return JSON.stringify(thing);
  var thingStr = JSON.stringify(thing);
  var line = "";
  var spaces = 1;
  thingStr.split('').forEach(c => {
    if(c == '{' || c == '[') {
      line += '\n';
      line += (' '.repeat(spaces));
      spaces++;
      line += c + '\n';
      line += (' '.repeat(spaces));
    }
    else if(c == ']' || c == '}') {
      line += '\n';
      spaces --;
      line += (' '.repeat(spaces));
      line += c + '\n';
      line += (' '.repeat(spaces));
    }
    else if(c == ':') {
      line += c + " ";
    } else if (c == ',') {
      line += c + '\n' + (' '.repeat(spaces));
    }
    else {
      line += c;
    }
  });
  return line;
}
