<style scoped>
hr {
  border: none;
  border-top: 3px double #333;
  color: #333;
  overflow: visible;
  text-align: center;
  height: 5px;
  z-index: 2;
  position: relative;
}
.rating-item {
  position: absolute;
  z-index: 2;
  max-width: 60px;
}
.white-circle-background {
  border-radius: 50%;
  background: #fff;
  padding: 0;
}
.line {
  position: relative;
  display: inline-block;
  width: calc(100% - 185px);
}
.left-text,
.right-text {
  display: inline-block;
  max-width: 90px;
  position: absolute;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  font-size: smaller;
}
.left-text {
  left: 0px;
}
.right-text {
  right: 0px;
}
.background {
  position: absolute;
  z-index: 1;
  width: 33.333%;
  height: 50px;
  top: -25px;
}
h4 {
  margin-bottom: 25px;
}
.rating-description {
  margin-top: 50px;
  width: calc(100% - 185px);
  margin-left: auto;
  margin-right: auto;
}
.btn-move {
  width: calc(20% - 8px);
  margin: 4px;
}
.arrow-right {
  position: relative;
  left: -10%;
  padding: 0;
}
.arrow-left {
  position: relative;
  right: -10%;
  padding: 0;
}
</style>


<template>
  <h4 :style="{ marginTop: scaleIndex == 0 ? 'initial' : '70px' }">
    {{ rating.arrayScales[scaleIndex].title }}
  </h4>
  <div class="left-text">
    {{ rating.arrayScales[scaleIndex].leftText }}
  </div>
  <div class="line">
    <hr id="hr" />
    <div
      @click="clickLeft()"
      class="background"
      :style="{
        left: '0px',
        background:
          'linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0))',
      }"
    />
    <div
      @click="clickMiddle()"
      class="background"
      :style="{ left: '33.333%', background: 'yellow' }"
    />
    <div
      @click="clickRight()"
      class="background"
      :style="{
        left: '66.667%',
        background:
          'linear-gradient(to left, rgb(0, 255, 0), rgb(255, 255, 0))',
      }"
    />
    <span
      :style="{
        display: ratingItem ? '' : 'none',
        left: ratingItem
          ? (ratingItem.fraction.n / ratingItem.fraction.d) * 100 + '%'
          : 0,
        top: ratingItem ? addTop(index, -10) + 'px' : 0,
      }"
      class="rating-item"
      v-for="(ratingItem, index) in ratings"
      :key="index"
      @click="clickRating(index)"
    >
      <v-icon
        v-if="index == rightMost"
        :icon="isMuchWorse ? 'mdi-chevron-double-left' : 'mdi-chevron-left'"
        class="arrow-left"
      ></v-icon>
      <span class="white-circle-background"
        ><v-icon
          :icon="
            index == rating.currentSessionIndex
              ? 'mdi-lightbulb-on-outline'
              : index == selectedRatingIndex
              ? 'mdi-lightbulb-question'
              : 'mdi-lightbulb'
          "
        ></v-icon
      ></span>
      <v-icon
        v-if="index == leftMost"
        :icon="isMuchBetter ? 'mdi-chevron-double-right' : 'mdi-chevron-right'"
        class="arrow-right"
      ></v-icon>
    </span>
  </div>
  <div class="right-text">
    {{ rating.arrayScales[scaleIndex].rightText }}
  </div>
  <v-sheet
    v-if="selectedRatingIndex != null"
    class="rating-description"
    :color="rating.getScaleRatingColour(scaleIndex, selectedRatingIndex)"
  >
    <v-btn
      v-if="!doesRatingExist()"
      @click="muchWorseClicked()"
      class="btn-move"
      size="x-small"
      prepend-icon="mdi-chevron-double-left"
      >Much worse</v-btn
    >
    <v-btn
      v-if="!doesRatingExist()"
      @click="worseClicked()"
      class="btn-move"
      size="x-small"
      prepend-icon="mdi-chevron-left"
      >Worse</v-btn
    >
    <v-btn
      v-if="!doesRatingExist()"
      @click="similar"
      class="btn-move"
      size="x-small"
      >Similar</v-btn
    >
    <v-btn
      v-if="!doesRatingExist()"
      @click="betterClicked()"
      class="btn-move"
      size="x-small"
      append-icon="mdi-chevron-right"
      >Better</v-btn
    >
    <v-btn
      v-if="!doesRatingExist()"
      @click="muchBetterClicked()"
      class="btn-move"
      size="x-small"
      append-icon="mdi-chevron-double-right"
      >Much better</v-btn
    >
    <v-text-field
      v-model="selectedRatingSessionNote"
      label="This rating's session note"
      :disabled="true"
    ></v-text-field>
    <v-text-field
      v-model="newClientNote"
      label="Your rating notes"
    ></v-text-field>
    <v-text-field
      v-model="newTherapistNote"
      label="Optional - note to share with therapist"
    ></v-text-field>
  </v-sheet>
</template>

<script setup>
//TODO: only one scale's rating should be selectable at a time - the other one needs to have no selected rating if we click a different one (not urgent)
import { ref, reactive, watch, defineEmits } from "vue";
import { useRating } from "@/composables/Rating";
import * as fractions from "../utils/fractions.js";
const rating = reactive(useRating());
const props = defineProps(["scaleIndex"]);

const selectedRatingIndex = ref(null);
const ratings = ref(rating.getScaleRatings(props.scaleIndex)); //an array which will hold the ratings for this scale, and update when the currentSessionIndex changes.

//these two variables determine where the new rating will be placed. Will be an integer for the rating index.
//LeftMost is updated when the client clicks 'better' or 'much better' (since we are moving further to the right each time)
//Likewise, rightMost is updated when the client clicks 'worse' or 'much worse'.
//When we have both of these set, then we know to place the new rating in between them.
const leftMost = ref(-1);
const rightMost = ref(-1);

//these two are whether they clicked 'much' or not. Should probably combine this with the above but oh well.
const isMuchBetter = ref(false);
const isMuchWorse = ref(false);

const newClientNote = ref("");
const newTherapistNote = ref("");
const selectedRatingSessionNote = ref("");

const emit = defineEmits(["newRating"]);

const doesRatingExist = () => {
  return (
    typeof ratings.value[rating.currentSessionIndex] !== "undefined" &&
    ratings.value[rating.currentSessionIndex] !== null
  );
};

const addTop = (index, add) => {
  if (
    ratings.value.length > 1 &&
    ratings.value[index].left !== null &&
    ratings.value[index].right !== null &&
    ratings.value[index].left == ratings.value[index].right
  ) {
    add += 10;
    var newIndex = ratings.value[index].left;
    return addTop(newIndex, add);
  }
  return add;
};

const addNewRating = () => {
  rating.newRating(
    props.scaleIndex,
    leftMost.value,
    rightMost.value,
    isMuchBetter.value,
    isMuchWorse.value
  );
  leftMost.value = -1;
  rightMost.value = -1;
  refreshRatings();
};

const refreshRatings = () => {
  selectedRatingIndex.value = rating.currentSessionIndex; //show new rating created
  getNewRatings();
  emit("newRating", props.scaleIndex);
};

const getNewRatings = () => {
  ratings.value = rating.getScaleRatings(props.scaleIndex); //get new ratings
  newClientNote.value =
    selectedRatingIndex.value != null
      ? ratings.value[selectedRatingIndex.value].clientNote
      : "";
  newTherapistNote.value =
    selectedRatingIndex.value != null
      ? ratings.value[selectedRatingIndex.value].therapistNote
      : "";
};

const clickLeft = () => {
  if (
    /*typeof ratings.value[rating.currentSessionIndex] !== "undefined" &&
    ratings.value[rating.currentSessionIndex] !== null*/
    doesRatingExist()
  )
    return; //only if we don't already have a rating for this session
  var foundLeft = false;
  var smallest = null; //'smallest' will be the index for the 'right' parameter of the new rating (if there are no ratings in the first third)
  if (ratings.value.length > 0) {
    smallest = 0;
    //index 0 might be null so find first non-null. They won't be all null, or the array would be empty
    for (var j = 0; j < ratings.value.length; j++) {
      if (ratings.value[j] !== null) {
        smallest = j;
        break;
      }
    }
    for (var i = 0; i < ratings.value.length; i++) {
      if (
        ratings.value[i] !== null &&
        fractions.get(ratings.value[smallest].fraction) >
          fractions.get(ratings.value[i].fraction)
      ) {
        smallest = i;
      }
      if (
        ratings.value[i] !== null &&
        fractions.get(ratings.value[i].fraction) < 1.0 / 3.0
      ) {
        foundLeft = true;
        break; //only adding a new rating if there aren't any in the first third so no need to continue looking
      }
    }
  }
  if (!foundLeft) {
    rating.newSideRating(props.scaleIndex, true, smallest);
    refreshRatings();
  }
};

const clickMiddle = () => {
  if (doesRatingExist()) {
    return; //only if we don't already have a rating for this session
  }

  var foundMiddle = false;
  var right = null; //smallest one that isn't in the middle third
  var left = null; //largest one that isn't in the middle third
  for (var i = 0; i < ratings.value.length; i++) {
    var thisDecimal = fractions.get(ratings.value[i].fraction);
    //the following two bits are because we only want left and right to equal valid indices that are in the right third and stay null if there aren't any
    if (thisDecimal > 2.0 / 3.0 && right == null) {
      right = i;
    }
    if (thisDecimal < 1.0 / 3.0 && left == null) {
      left = i;
    }
    var rightDecimal =
      right == null ? 0.0 : fractions.get(ratings.value[right].fraction);
    var leftDecimal =
      left == null ? 1.0 : fractions.get(ratings.value[left].fraction);
    if (thisDecimal > 2.0 / 3.0 && thisDecimal < rightDecimal) {
      right = i;
    }
    if (thisDecimal < 1.0 / 3.0 && thisDecimal > leftDecimal) {
      left = i;
    }
    if (thisDecimal > 1.0 / 3.0 && thisDecimal < 2.0 / 3.0) {
      foundMiddle = true;
      break; //only adding a new rating if there aren't any in the middle third so no need to continue looking
    }
  }
  if (!foundMiddle) {
    rating.newMiddleRating(props.scaleIndex, left, right);
    refreshRatings();
  }
};

const clickRight = () => {
  if (doesRatingExist()) return; //only if we don't already have a rating for this session
  var foundRight = false;
  var largest = null; //'largest' will be the index for the 'left' parameter of the new rating (if there are no ratings in the last third)
  if (ratings.value.length > 0) {
    largest = 0;
    //index 0 might be null so find first non-null. They won't be all null, or the array would be empty
    for (var j = 0; j < ratings.value.length; j++) {
      if (ratings.value[j] !== null) {
        largest = j;
        break;
      }
    }
    for (var i = 0; i < ratings.value.length; i++) {
      if (
        ratings.value[i] != null &&
        fractions.get(ratings.value[largest].fraction) <
          fractions.get(ratings.value[i].fraction)
      ) {
        largest = i;
      }
      if (
        ratings.value[i] != null &&
        fractions.get(ratings.value[i].fraction) > 2.0 / 3.0
      ) {
        foundRight = true;
        break; //only adding a new rating if there aren't any in the first third so no need to continue looking
      }
    }
  }
  if (!foundRight) {
    rating.newSideRating(props.scaleIndex, false, largest);
    refreshRatings();
  }
};

watch(
  () => rating.currentSessionIndex,
  (newSessionIndex, oldSessionIndex) => {
    if (newSessionIndex != oldSessionIndex) {
      selectedRatingSessionNote.value = "";
      selectedRatingIndex.value = null;
      getNewRatings();
    }
  }
);

watch(
  () => newClientNote.value,
  (newVal) => {
    rating.updateNote(
      props.scaleIndex,
      selectedRatingIndex.value,
      true,
      newVal
    );
    emit("newRating", props.scaleIndex);
  }
);

watch(
  () => newTherapistNote.value,
  (newVal) => {
    rating.updateNote(
      props.scaleIndex,
      selectedRatingIndex.value,
      false,
      newVal
    );
    emit("newRating", props.scaleIndex);
  }
);

const clickRating = (item) => {
  selectedRatingIndex.value = item;
  newClientNote.value = ratings.value[item].clientNote;
  newTherapistNote.value = ratings.value[item].therapistNote;
  selectedRatingSessionNote.value =
    rating.sessionsArr()[selectedRatingIndex.value].sessionNote;
};

const nextSmallest = (index) => {
  var fraction = ratings.value[index].fraction;
  var nextSmallest = -1;
  for (var i = 0; i < ratings.value.length; i++) {
    if (
      index != i &&
      ratings.value[i] !== null &&
      fractions.greaterOrEqual(fraction, ratings.value[i].fraction)
    ) {
      if (
        typeof ratings.value[nextSmallest] === "undefined" ||
        fractions.greaterOrEqual(
          ratings.value[i].fraction,
          ratings.value[nextSmallest].fraction
        )
      ) {
        nextSmallest = i;
      }
    }
  }
  return nextSmallest;
};

const nextLargest = (index) => {
  var fraction = ratings.value[index].fraction;
  var nextLargest = -1;
  for (var i = 0; i < ratings.value.length; i++) {
    if (
      index != i &&
      ratings.value[i] !== null &&
      fractions.greaterOrEqual(ratings.value[i].fraction, fraction)
    ) {
      if (
        typeof ratings.value[nextLargest] === "undefined" ||
        fractions.greaterOrEqual(
          ratings.value[nextLargest].fraction,
          ratings.value[i].fraction
        )
      ) {
        nextLargest = i;
      }
    }
  }
  return nextLargest;
};

const similar = () => {
  leftMost.value = selectedRatingIndex.value;
  rightMost.value = selectedRatingIndex.value;
  addNewRating();
};

const better = () => {
  leftMost.value = selectedRatingIndex.value;
  var next = nextLargest(selectedRatingIndex.value);
  if (rightMost.value == leftMost.value) {
    rightMost.value = -1; //user changed their mind
  }
  if (rightMost.value >= 0) {
    var rightRating = rating.getScaleRating(props.scaleIndex, rightMost.value);
    var leftRating = rating.getScaleRating(props.scaleIndex, leftMost.value);
    if (fractions.greaterOrEqual(rightRating.fraction, leftRating.fraction)) {
      addNewRating();
    } else {
      rightMost.value = -1;
    }
    //} else if (isLargest(selectedRatingIndex.value)) {
  } else if (next == -1) {
    rightMost.value = -1;
    addNewRating();
  } else {
    selectedRatingIndex.value = next;
  }
};

const worse = () => {
  rightMost.value = selectedRatingIndex.value;
  var next = nextSmallest(selectedRatingIndex.value);
  if (rightMost.value == leftMost.value) {
    leftMost.value = -1; //user changed their mind
  }
  if (leftMost.value >= 0) {
    var rightRating = rating.getScaleRating(props.scaleIndex, rightMost.value);
    var leftRating = rating.getScaleRating(props.scaleIndex, leftMost.value);
    if (fractions.greaterOrEqual(rightRating.fraction, leftRating.fraction)) {
      addNewRating();
    } else {
      leftMost.value = -1;
    }
    //} else if (isSmallest(selectedRatingIndex.value)) {
  } else if (next == -1) {
    leftMost.value = -1;
    addNewRating();
  } else {
    selectedRatingIndex.value = next;
  }
};

const betterClicked = () => {
  console.log("clicked 'better'");
  isMuchBetter.value = false;
  better();
};
const worseClicked = () => {
  console.log("clicked 'worse'");
  isMuchWorse.value = false;
  worse();
};

const muchBetterClicked = () => {
  console.log("clicked 'much better'");
  isMuchBetter.value = true;
  better();
};
const muchWorseClicked = () => {
  console.log("clicked 'much worse'");
  isMuchWorse.value = true;
  worse();
};
</script>
