
import * as fractions from "../utils/fractions.js"
import { ref, reactive, watch } from 'vue'

//at some point can separate these out into their own composables - they don't need to all be in the one, since the data is now separated

const sessions = reactive(new Map());
const scales = reactive(new Map());
const ratings = reactive(new Map());

//sessions keys = index of session number (0-based, so add 1 for displaying session number)
//scales keys = index for scales (will be same in every session)
//ratings keys = object of (scale = the scale index, index = the session number)
//ratings left and right are the index of the rating to the immediate left and right of it

//TODO: A bug: sometimes doing much worse/much better results in the new rating being placed over the right-hand one, but the right-hand one not moving.

sessions.set(0, {sessionNote: "test session note"});
sessions.set(1, {sessionNote: ""});
scales.set(0, {title: "Relationship", leftText: "I did not feel heard, understood or respected.", rightText: "I felt heard, understood, and respected."});
scales.set(1, {title: "Goals and Topics", leftText: "We did not work on or talk about what I wanted to work on or talk about.", rightText: "We worked on and talked about what I wanted to work on or talk about."});
scales.set(2, {title: "Approach or Method", leftText: "The therapist's approach is not a good fit for me.", rightText: "The therapist's approach is a good fit for me."});
scales.set(3, {title: "Overall", leftText: "There was something missing in the session today.", rightText: "Overall, today's session was right for me."});
ratings.set({scale: 1, index: 0}, {fraction: fractions.simplify({n: 1, d: 2}), left: null, right: 1, clientNote: "test client note", therapistNote: "test therapist note"});
ratings.set({scale: 1, index: 1}, {fraction: fractions.simplify({n: 3, d: 4}), left: 0, right: null, clientNote: "test client note 2", therapistNote: "test therapist note 2"});

const currentSession = ref([]);
const numberSessions = ref(0);
const arrayScales = ref([]);
const numberScales = ref(0);
const currentSessionIndex = ref(0); //integer index for a session in the array

export function useRating() {

  const refreshData = () => {
    currentSession.value = sessions.get(currentSessionIndex.value);
    numberSessions.value = sessions.size;
    arrayScales.value = [...scales.values()];
    numberScales.value = scales.size;
  }

  watch(currentSessionIndex, (newVal, oldVal) => {
    if(newVal !== oldVal) {
      refreshData();
    }
  });

  refreshData();

  function sessionsArr() {
    return [...sessions.entries()].sort((a, b) => a[0] > b[0]).map(item => item[1]); //sort them just in case they get added out of order somehow
  }

  function nextSession() {
    if(currentSessionIndex.value == (numberSessions.value - 1)) {
      sessions.set(numberSessions.value, {sessionNote: ""});
    }
    currentSessionIndex.value ++;
  }

  function previousSession() {
    if(currentSessionIndex.value > 0) {
      currentSessionIndex.value --;
    }
  }
  function getScaleRating(scaleIndex, ratingIndex) {
    var temp = [...ratings].filter(item => item[0].scale == scaleIndex && item[0].index == ratingIndex);
    if(temp.length > 0) {
      return temp[0][1];
    }
    return null;
  }

  function getScaleRatingColour(scaleIndex, ratingIndex) {
    var rating = getScaleRating(scaleIndex, ratingIndex);
    return rating ? fractions.getColour(rating.fraction) : "rgb(255, 255, 255)";
  }
  function getScale(scaleIndex) {
    return scales.get(scaleIndex);
  }
  function getScaleRatings(scaleIndex) {
    var temp = [...ratings.entries()].filter(item => item[0].scale == scaleIndex).sort((a, b) => a[0].index > b[0].index);//.map(item => item[1]);

    //just in case there are missing sessions in the middle:
    if(temp.length == 0) return []; //don't go further if there is nothing there
    if(temp[0][0].index != 0) { //check the first one first because the loop only looks at the next one and not the one it is on
      temp = [[{scale: scaleIndex, index: 0}, null], ...temp];
    }
    for(var i = 0; i < temp.length; i ++) {//need to look at the next one so that we will still get to it when going through the array
      if((i < temp.length - 1) && temp[i + 1][0].index != (i + 1)) {
        temp = [...temp.slice(0, (i + 1)), [{scale: scaleIndex, index: (i + 1)}, null], ...temp.slice(i + 1)];
      }
    }
    return temp.map(item => item[1]);
  }

  function updateNote(scaleIndex, ratingIndex, isClient, note) {
    for (let [key, value] of ratings) {
        if(key.scale == scaleIndex && key.index == ratingIndex) {
        var rating = value;
        isClient ? rating.clientNote = note : rating.therapistNote = note;
        ratings.set(key, value);
        break;
      }
    }
  }

  function addToRight(amount, scaleIndex, ratingIndex) {
    //'amount' is a fraction object i.e. {n: integer numerator, d: integer denominator}
    console.log("in addToRight for rating index " + ratingIndex);
    var right = null;
    for (let [key, value] of ratings) {
        if(key.scale == scaleIndex && key.index == ratingIndex) {
        var rating = value;
        right = rating.right;
        rating.fraction = fractions.add(rating.fraction, amount);
        ratings.set(key, rating);
        break;
      }
    }
    if(right) { //keep going until we get to the last one
      addToRight(amount, scaleIndex, right);
    }
  }

  function newMiddleRating(scaleIndex, left, right) {
    var newKey = {scale: scaleIndex, index: currentSessionIndex.value};
    var newRating = {
      fraction: {n:1, d:2},
      left: left,
      right: right,
      clientNote: "",
      therapistNote: ""
    }
    ratings.set(newKey, newRating);
  }

  function newSideRating(scaleIndex, isLeft, other) {

    var newKey = {scale: scaleIndex, index: currentSessionIndex.value};
    var newRating = {
      left: null,
      right: null,
      clientNote: "",
      therapistNote: ""
    }
    if(isLeft) {
      newRating.fraction = {n: 1, d: 6}; //halfway in the first third
      newRating.right = other;
    } else {
      newRating.fraction = {n: 5, d: 6}; //halfway in the last third
      newRating.left = other;
    }
    ratings.set(newKey, newRating);
    if(other !== null) { //if it is zero then 'is other' returns false (eyeroll)
      for (let [key, value] of ratings) {
        if(key.scale == scaleIndex && key.index == other) {
          var rating = value;
          if(isLeft) {
            //if the 'left' of the other rating is not null, then something went wrong (the new rating should be the leftmost to be using this). So let us know:
            console.assert(rating.left == null, "the new rating should be the leftmost so the rating at index " + other + " (which should be the previous leftmost before adding the new one) should have a 'left' index of null but it actually has a left index of: " + rating.left);
            rating.left = currentSessionIndex.value;
          } else {
            //if the 'right' of the other rating is not null, then something went wrong (the new rating should be the rightmost to be using this). So let us know:
            console.assert(rating.right == null, "the new rating should be the rightmost so the rating at index " + other + " (which should be the previous rightmost before adding the new one) should have a 'right' index of null but it actually has a right index of: " + rating.right);
            rating.right = currentSessionIndex.value;
          }
          ratings.set(key, rating);
          break;
        }
      }
    }
  }

  function newRating(scaleIndex, leftMost, rightMost, isMuchBetter, isMuchWorse) {
    var newKey = {scale: scaleIndex, index: currentSessionIndex.value};

    //scaleIndex, leftMost, rightMost are integer indices
    //isMuchBetter, isMuchWorse are booleans

    var leftRating = {fraction: {n: 0, d: 1}};
    var rightRating = {fraction: {n: 1, d: 1}};

    if(leftMost >= 0) {
      leftRating = getScaleRating(scaleIndex, leftMost);
    } else {
      //we have a rightmost but no leftmost - can only be 'much worse' can't be 'much better'
      isMuchBetter = false;
    }
    if(rightMost >= 0) {
      rightRating = getScaleRating(scaleIndex, rightMost);
    } else {
      //we have a leftmost but no rightmost - can only be 'much better' can't be 'much worse'
      isMuchWorse = false;
    }


    if(leftMost == rightMost) { //picked 'similar'
      var sameRating = {
        fraction: leftRating.fraction,
        left: leftMost,
        right: leftMost,
        clientNote: "",
        therapistNote: ""
      }

      ratings.set(newKey, sameRating);
      return;
    }



    //1. get distance between the points
    var distance = fractions.subtract(rightRating.fraction, leftRating.fraction);

    //2. a) if one option is 'much', add half this distance to all points on the right
    //   b) if both options are 'much' add 100% this distance
    //   c) otherwise (just better and worse and no 'much') we are not adding any distance

    var addAmt = {n:0, d:1};
    if(isMuchBetter !== isMuchWorse){
      addAmt = fractions.multiply(distance, {n:1, d:2});
    } else if (isMuchBetter && isMuchWorse) {
      addAmt = distance;
    }

    var newFraction = rightRating.fraction;

    if(addAmt.n > 0) addToRight(addAmt, scaleIndex, rightMost);

    //3. place new rating: Where do we place new point?
    //   a) If 'much better' = always where the rightmost point was originally (doesn't matter about much worse).
    //      If it is just 'much better' then we are going 2/3 of the way along which equals 100% of the original distance (where rightmost point was)
    //      If it is 'much better' AND 'much worse' then we are going halfway between, but the distance has doubled, so still 100% the distance
    //   b) If otherwise (either 'much worse' AND only 'better' or only 'worse' and only 'better') then halfway between the original points


    var halfDistance = fractions.multiply(distance, {n: 1, d: 2});
    if(!isMuchBetter) {
      newFraction = fractions.add(leftRating.fraction, halfDistance);
    }

    var newRating = {
      fraction: newFraction,
      left: leftMost,
      right: rightMost,
      clientNote: "",
      therapistNote: ""
    }

    ratings.set(newKey, newRating);

    //4. Update left and right for the leftMost and rightMost ratings (to the new rating)
    for (let [key, value] of ratings) {
      var updatedLeft = false;
      var updatedRight = false;
      if(key.scale == scaleIndex) {
        var rating = value;
        if(key.index == leftMost) {
          rating.right = newKey.index;
          ratings.set(key, rating);
          updatedLeft = true;
        } else if (key.index == rightMost) {
          rating.left = newKey.index;
          ratings.set(key, rating);
          updatedRight = true;
        }
        if(updatedRight && updatedLeft) {
          break;
        }
      }
    }

    //5. If at least one was 'much' (i.e. we added space), scale all points back down to unit length: add distance from step one to 1, convert to fraction, divide ALL ratings by this amount
    if(addAmt.n > 0) {
      ratings.forEach((value, key) => {
        if(key.scale == scaleIndex) {
          var rating = value;
          rating.fraction = fractions.scale(rating.fraction,addAmt);
          ratings.set(key, rating);
        }
      })
    }
    return;
  }

  return {
    sessionsArr,
    currentSessionIndex,
    currentSession,
    numberSessions,
    arrayScales,
    numberScales,
    nextSession,
    previousSession,
    getScaleRating,
    getScaleRatingColour,
    getScale,
    getScaleRatings,
    newRating,
    updateNote,
    newSideRating,
    newMiddleRating,
    refreshData
  }
}
