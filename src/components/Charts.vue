<template>
  <p>
    <Line :options="options" :data="data" :key="data.labels.length" />
  </p>
</template>

<!--<script setup>-->
<script>
//TODO: when there are sessions skipped, the line does not connect - maybe need to remove null rating items and session numbers that don't exist from the dataset (computed) before it is sent to the line component
import { Line } from "vue-chartjs";
import { reactive, ref, defineExpose, computed } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as fractions from "../utils/fractions.js";
import { useRating } from "../composables/Rating";

export default {
  components: {
    Line,
  },
  setup() {
    const rating = reactive(useRating());

    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );

    const options = ref({
      responsive: true,
      spanGaps: true,
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context) {
              return "Session " + context[0].label;
            },
            label: function (context) {
              var line = "Rating: " + context.formattedValue;
              var lines = [];
              lines.push(line);
              var note = rating.getScaleRating(
                context.datasetIndex,
                context.dataIndex
              ).therapistNote;
              if (note) {
                lines.push("Note: " + note);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        y: {
          title: {
            text: "Rating",
            display: true,
          },
          max: 10,
          min: 0,
        },
        x: {
          title: {
            text: "Session",
            display: true,
          },
          min: 0,
        },
      },
    });
    var scales = rating.arrayScales;
    var colours = [
      "magenta",
      "cyan",
      "lime",
      "red",
      "yellow",
      "purple",
      "black",
      "orange",
    ];

    const datasets = reactive([]);
    const labels = reactive([]);

    const data = computed(() => {
      var tempDatasets = JSON.parse(JSON.stringify(datasets));
      var tempLabels = JSON.parse(JSON.stringify(labels));
      return { datasets: tempDatasets, labels: tempLabels };
    });

    labels.push(
      ...rating.sessionsArr().map((item, index) => {
        return index + 1;
      })
    );
    for (var i = 0; i < scales.length; i++) {
      var ratings = rating.getScaleRatings(i);
      var dataset = {
        label: scales[i].title,
        data: ratings.map((item) => fractions.get(item.fraction) * 10.0),
        pointRadius: ratings.map((item) => (item.therapistNote ? 10 : 5)),
        backgroundColor: colours[i % colours.length],
        borderColor: colours[i % colours.length],
      };
      datasets.push(dataset);
    }

    const updateChart = (scaleIndex) => {
      var ratings = rating.getScaleRatings(scaleIndex);
      var allLabels = rating.sessionsArr().map((item, index) => {
        return index + 1;
      });
      var newLabels = allLabels.filter((item) => !labels.includes(item));
      labels.push(...newLabels);
      datasets[scaleIndex].data = ratings.map((item) =>
        item ? fractions.get(item.fraction) * 10.0 : null
      );
      datasets[scaleIndex].pointRadius = ratings.map((item) =>
        item ? (item.therapistNote ? 10 : 5) : 0
      );
    };
    defineExpose({ updateChart });
    return { updateChart, data, options };
  },
};
</script>
