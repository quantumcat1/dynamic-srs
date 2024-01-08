import { ref, watchEffect, toValue } from "vue"
import * as fractions from "../utils/fractions"

export function useFraction(initialNumerator = null, initialDenominator = null) {
  var colour = ref("");
  var n = ref(initialNumerator);
  var d = ref(initialDenominator);

  console.log("fraction: n = " + n.value + " and d = " + d.value);

  var fraction = fractions.simplify({n: n.value, d: d.value}); //if anything is null, 'simplify' will return null
  if(fraction !== null) {
    n.value = toValue(fraction.n);
    d.value = toValue(fraction.d);
    colour.value = toValue(fractions.getColour(fraction));
  }

  return { n, d, colour };
}
