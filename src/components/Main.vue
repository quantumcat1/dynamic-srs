<template>
  <v-container class="fill-height fill-width">
    <v-responsive
      class="align-center text-center fill-height"
      style="padding: 0px; overflow: unset"
    >
      <h1>Session {{ rating.currentSessionIndex + 1 }}</h1>
      <v-btn
        prepend-icon="mdi-chevron-left"
        :disabled="
          rating.currentSessionIndex == null || rating.currentSessionIndex == 0
        "
        @click="rating.previousSession()"
        >Previous session</v-btn
      >
      <v-btn append-icon="mdi-chevron-right" @click="rating.nextSession()"
        >Next session</v-btn
      >
      <p v-if="rating.numberSessions == 0">
        No sessions yet (click 'Next Session' to create one)
      </p>
      <Session @new-rating="(scaleIndex) => newRating(scaleIndex)" />
      <p style="margin-top: 50px"><Charts ref="chartsRef" /></p>
    </v-responsive>
  </v-container>
</template>

<script setup>
import Session from "./Session.vue";
import Charts from "./Charts.vue";
import { reactive, ref } from "vue";
import { useRating } from "../composables/Rating";

const rating = reactive(useRating());
const chartsRef = ref(null);

const newRating = (scaleIndex) => {
  chartsRef.value.updateChart(scaleIndex);
};
</script>
