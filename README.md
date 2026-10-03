# Student Pulse

Student Pulse is a focused academic dashboard that helps students notice attendance and coursework risks early. It runs on local sample data; no account, backend, or network connection is required.

## Features

- Semester summary for attendance, latest marks, and upcoming assignments.
- Automatic attendance warnings for courses below the 75% threshold.
- Course cards with attendance progress, latest mark, and assignment deadline.
- Bar chart comparing attendance by course and line chart showing average marks across recent assessments.
- Search by course name or code, with a clear no-results state.
- Quick controls to record a class as present or absent, or update a latest mark from 0 to 100.
- Immediate validation and feedback, empty deadline handling, and a sample-data reset.
- Three focused in-page views—Overview, Courses, and Assignments—selected using top buttons and conditional rendering, without side or bottom navigation bars.

## Problem statement

Students can miss early signs that attendance is slipping or assignments are approaching when academic information is scattered. Student Pulse brings those signals into one mobile-friendly view so a student can check course status and take a small corrective action quickly.

## Sample data and calculations

Sample courses, attendance totals, assessment marks, and assignment dates are defined in [`src/data/courses.ts`](./src/data/courses.ts). The dashboard derives its summaries, warnings, cards, and charts from the same in-memory course state.

The attendance warning threshold is `75%`. Overall attendance is weighted by the number of classes held, while the latest-mark summary is the unweighted average of each course's most recent mark. Recording a class increases the total held classes and, for a present entry, the attended count. Updating a mark replaces that course's latest assessment value. Reset demo restores the original sample values.

All sample dates are for Fall 2026. Changes are held in app state and reset when the app reloads.

## React concepts demonstrated

- `src/app/index.tsx` owns course, search, selected-course, form, and feedback state using React state hooks.
- `src/data/courses.ts` defines the course objects, reusable `Course` type, and the easy-to-change attendance threshold.
- `src/components/student-pulse.tsx` contains reusable components that receive data and handlers through props.
- Lists and charts are rendered from course arrays; attendance and marks updates recalculate the summary, warnings, cards, and chart data.
- Search filtering, conditional warnings, validation feedback, no-results feedback, and empty/past/upcoming assignment states demonstrate conditional rendering and array methods.
- The top Overview, Courses, and Assignments buttons change the visible content using conditional rendering in the same screen.

## Run the app

Install dependencies and start Expo:

```bash
npm install
npx expo start
```

Then open the project in Expo Go on a compatible phone, an Android/iOS emulator, or press `w` in the Expo terminal to run the web version. The charts use `react-native-chart-kit` and Expo-compatible `react-native-svg`.

Useful checks:

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
```

The dashboard source typechecks, the dashboard files pass ESLint, and Expo Doctor passes its project checks. Browser testing also covered course search (including no matches), attendance updates, invalid and valid marks, sample-data reset, and deadline states.

## Submission materials

- Source code and setup instructions: this repository.
- Screenshots/demo: capture the dashboard and its interactions on the intended phone or emulator, then add the images/video to the submission or repository before submitting.
- AI assistance disclosure: see AI USAGE REPORT.docx
