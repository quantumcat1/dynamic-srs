
  export const get = (fraction) => {
    return fraction.n / fraction.d;
  }

  export const add = (fraction1, fraction2) => {
    //console.log("in 'add'. fraction1 = " + JSON.stringify(fraction1) + " and fraction2 = " + JSON.stringify(fraction2));
    let gcd = findGcd(fraction1.d, fraction2.d);
    return {
      n: ((fraction1.n * fraction2.d) + (fraction1.d * fraction2.n))/gcd,
      d: (fraction1.d * fraction2.d)/gcd
    }
  }

  export const multiply = (fraction1, fraction2) => {
    //console.log("in 'multiply'. fraction1 = " + JSON.stringify(fraction1) + " and fraction2 = " + JSON.stringify(fraction2));
    return simplify({n: fraction1.n * fraction2.n, d: fraction1.d * fraction2.d});
  }

  export const subtract = (fraction1, fraction2) => {
    //console.log("in 'subtract'. fraction1 = " + JSON.stringify(fraction1) + " and fraction2 = " + JSON.stringify(fraction2));
    return add(fraction1, multiply(fraction2, { n: -1, d: 1 }));
  }

  export const divide = (fraction1, fraction2) => {
    //console.log("in 'divide'. fraction1 = " + JSON.stringify(fraction1) + " and fraction2 = " + JSON.stringify(fraction2));
    return multiply(fraction1, { n: fraction2.d, d: fraction2.n }); //multiply by reciprocal
  }

  export const greaterOrEqual = (fraction1, fraction2) => {
    var temp = subtract(fraction1, fraction2);
    var topPos = temp.n < 0;
    var bottomPos = temp.d < 0; //returns true if both negative or both positive
    return !(topPos != bottomPos);
  }

  export const scaleAmt = (distance) => {
    //console.log("in 'scaleAmt'. distance = " + JSON.stringify(distance));
    return { n: distance.d, d: distance.n + distance.d };
  }

  export const scale = (fraction, distance) => {
    //console.log("in 'scale'. fraction = " + JSON.stringify(fraction) + " and distance = " + JSON.stringify(distance));
    return multiply(fraction, scaleAmt(distance));
  }

  export const findGcd = (a, b) => {
    //console.log("in 'findGcd'. a = " + JSON.stringify(a) + " and b = " + JSON.stringify(b));
    return b ? findGcd(b, a % b) : a;
  }

  export const simplify = (fraction) => {
    //console.log("in 'simplify'. fraction = " + JSON.stringify(fraction));
    if(fraction == null || fraction.n == null || fraction.d == null) return null;
    const gcd = findGcd(fraction.n, fraction.d);
    return { n: fraction.n / gcd, d: fraction.d / gcd };
  }

  export const getColour = (fraction) => {
    //console.log("in 'getColour'. fraction = " + JSON.stringify(fraction));
    var rgb = [255, 255, 0]; //yellow zone default
    if (fraction.n / fraction.d < 1 / 3) {
      //red zone
      rgb = pickHex([255, 255, 0], [255, 0, 0], (fraction.n / fraction.d) * 3);
    } else if (fraction.n / fraction.d > 2 / 3) {
      //green zone
      rgb = pickHex(
        [0, 255, 0],
        [255, 255, 0],
        (fraction.n / fraction.d - 2 / 3) * 3
      );
    }
    return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
  }
  //got this function from here: https://jsfiddle.net/vksn3yLL/
  export const pickHex = (colour1, colour2, weight) => {
    console.log("pickHex with colours " + JSON.stringify(colour1) + " and " + JSON.stringify(colour2) + " and weight = " + JSON.stringify(weight));
    var w1 = weight;
    var w2 = 1 - w1;
    var rgb = [
      Math.round(colour1[0] * w1 + colour2[0] * w2),
      Math.round(colour1[1] * w1 + colour2[1] * w2),
      Math.round(colour1[2] * w1 + colour2[2] * w2),
    ];
    return rgb;
  }
