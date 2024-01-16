# Dynamic Session Rating Scale

The Session Rating Scale is a short questionnaire with analogue responses, used as a therapeutic alliance measure. It is short enough to be feasible clinically while still maintaining some of the reliability of the longer questionnaires used in research. The SRS is given on paper. The response area for each question is a line with two opposite responses on either end. The client makes a mark along that line to indicate where their response falls between them. The clinician records the response as a number between 0 and 10, by placing a 10-centimetre scale along each line to find where the mark falls.

There are two problems with it. The first is that the meaning of the statements at each end are subjectively defined by the client. This isn't a problem if they stay static, because it is the trend over time, and and identifying outliers, that are important rather than any absolute number. However, if the meaning changes from session to session (as experience grows or expectations change) then objective comparisons can't be made. For example, a client may have no idea what to expect and rate an early session 'Goals and Topics' as a 7, because the therapist asked what the client wanted to discuss (which seemed to the client like it must be a good thing), but then didn't cover it in any depth and instead changed the topic and spent the rest of the session on something the client wasn't that concerned about (and the client doesn't know they can expect better). Then a few months later, 'Goals and Topics' is rated only 6, when an agenda was made at the beginning, but only three of the four topics raised had time to be discussed. But the latter session was much better than the former one. 

The second problem is that without access to previous ratings, if a client wants to express that a rating for a session be higher or lower than a particular one they remember, they need to have an idea how they rated it. Then they need to rate this one much higher or lower than that, to ensure it is ends up actually higher or lower. With no numbers, they are relying on spatial memory which might be a bit more difficult to be accurate about. They could quickly end up near one of the extreme ends, having not intended to rate this aspect as the best or worst possible.

In this implementation of the SRS, instead of the client having to choose an exact place to put their mark, they can instead say it was better or worse than a previous session. The previous ratings will change to accomodate the new one. It solves Problem 1 by allowing the meanings of the extreme ends to change over time, as the previous ratings change to match the new scale. It solves Problem 2 by always being able to make a rating relative to others, and never run out of scale and be stuck at the extreme end. The client can mark a new rating as 'much better', 'better', 'similar', 'worse', or 'much worse' relative to two other ratings, or one on an extreme end. If 'better' and 'worse' are used, the new rating is placed halfway between them. If one is 'much' and the other not, the distance between the ratings is increased by 50%, and the new rating placed at the 2/3 mark. If both are 'much', the distance between the two is doubled, and the new rating placed halfway. In both cases the line is then scaled back to unit length.

The demo is in Vue 3 with Vuetify components, and uses vue-chartjs for the chart at the bottom. There is a version here: https://main--jocular-elf-25dbde.netlify.app/ to play with.

## Project setup

Install dependencies:
```npm install```

To run locally:
```npm run dev```

To run on an express server:
```npm run build```
```node server.js```
