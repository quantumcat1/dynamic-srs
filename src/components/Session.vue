<template>
  <v-text-field
    v-model="rating.currentSession.sessionNote"
    label="Your session notes"
  ></v-text-field>
  <Scale
    v-for="scale in rating.numberScales"
    :key="scale"
    :scaleIndex="scale - 1"
    @new-rating="(scaleIndex) => newRating(scaleIndex)"
  />
</template>

<script setup>
//
import Scale from "./Scale.vue";
import { reactive, defineEmits } from "vue";
import { useRating } from "@/composables/Rating";
const emit = defineEmits(["newRating"]);
const rating = reactive(useRating());

const newRating = (scaleIndex) => {
  emit("newRating", scaleIndex);
};
</script>
