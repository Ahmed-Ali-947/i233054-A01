import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

import { ATTENDANCE_THRESHOLD, isUpcomingAssignment, type Course } from '@/data/courses';

const colors = {
  ink: '#1D3028',
  muted: '#79877E',
  green: '#34765C',
  red: '#B7554D',
  surface: '#FFFFFF',
  chartGrid: '#E8ECE6',
};

type AttendanceEntryProps = {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  entryMode: 'attendance' | 'mark';
  onChangeMode: (mode: 'attendance' | 'mark') => void;
  markInput: string;
  onChangeMark: (value: string) => void;
  onRecordAttendance: (present: boolean) => void;
  onUpdateMark: () => void;
  feedback: string;
};

export type DashboardView = 'overview' | 'courses' | 'assignments';

const dashboardViews: { id: DashboardView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'assignments', label: 'Assignments' },
];

export function ViewSwitcher({
  selectedView,
  onSelectView,
}: {
  selectedView: DashboardView;
  onSelectView: (view: DashboardView) => void;
}) {
  return (
    <View style={styles.viewSwitcher} accessibilityRole="tablist">
      {dashboardViews.map((view) => {
        const isSelected = selectedView === view.id;
        return (
          <Pressable
            key={view.id}
            onPress={() => onSelectView(view.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.viewButton,
              isSelected && styles.viewButtonSelected,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.viewButtonText, isSelected && styles.viewButtonTextSelected]}>
              {view.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DashboardHeader({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandLine}>
        <View style={styles.brandMark}>
          <View style={styles.brandMarkBar} />
          <View style={[styles.brandMarkBar, styles.brandMarkBarTall]} />
          <View style={[styles.brandMarkBar, styles.brandMarkBarMid]} />
        </View>
        <Text style={styles.brand}>STUDENT PULSE</Text>
        <Text style={styles.termBadge}>FALL &apos;26</Text>
      </View>
      <View style={styles.headerTitleRow}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.greeting}>YOUR ACADEMIC DASHBOARD</Text>
          <Text style={styles.headline}>A semester in{'\n'}good rhythm.</Text>
          <Text style={styles.headerCaption}>See what’s on track — and what needs a nudge.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SP</Text>
        </View>
      </View>
      <Pressable
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Restore sample dashboard data"
        style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
        <Text style={styles.resetSymbol}>↺</Text>
        <Text style={styles.resetText}>Reset demo</Text>
      </Pressable>
    </View>
  );
}

export function AcademicSummary({
  courses,
  upcomingCount,
}: {
  courses: Course[];
  upcomingCount: number;
}) {
  const totalAttended = courses.reduce((total, course) => total + course.classesAttended, 0);
  const totalClasses = courses.reduce((total, course) => total + course.classesHeld, 0);
  const averageAttendance = totalClasses === 0 ? 0 : Math.round((totalAttended / totalClasses) * 100);
  const averageMark =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((total, course) => total + course.marks[course.marks.length - 1], 0) /
            courses.length,
        );

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIntro}>
        <Text style={styles.summaryEyebrow}>YOUR SEMESTER AT A GLANCE</Text>
        <Text style={styles.summaryMessage}>You’ve got this.</Text>
        <Text style={styles.summarySubtext}>A quick look at how things are moving.</Text>
      </View>
      <View style={styles.statsRow}>
        <SummaryStat
          label="ATTENDANCE"
          value={`${averageAttendance}%`}
          note="across all courses"
          tone={averageAttendance < ATTENDANCE_THRESHOLD ? 'warning' : 'normal'}
        />
        <View style={styles.statDivider} />
        <SummaryStat label="LATEST MARKS" value={`${averageMark}%`} note="course average" />
        <View style={styles.statDivider} />
        <SummaryStat
          label="UPCOMING"
          value={String(upcomingCount).padStart(2, '0')}
          note="assignments"
        />
      </View>
    </View>
  );
}

function SummaryStat({
  label,
  value,
  note,
  tone = 'normal',
}: {
  label: string;
  value: string;
  note: string;
  tone?: 'normal' | 'warning';
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tone === 'warning' && styles.statValueWarning]}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDetail}>{detail}</Text>
    </View>
  );
}

export function WarningBanner({ course }: { course: Course }) {
  const attendance = Math.round((course.classesAttended / course.classesHeld) * 100);
  return (
    <View style={styles.warningBanner}>
      <View style={styles.warningIcon}>
        <Text style={styles.warningIconText}>!</Text>
      </View>
      <View style={styles.warningCopy}>
        <Text style={styles.warningTitle}>{course.name}</Text>
        <Text style={styles.warningDetail}>
          {attendance}% attendance · {course.classesHeld - course.classesAttended} classes missed
        </Text>
      </View>
      <Text style={styles.warningCode}>{course.code}</Text>
    </View>
  );
}

export function AcademicChart({ courses, width }: { courses: Course[]; width: number }) {
  const attendanceData = {
    labels: courses.map((course) => course.code),
    datasets: [
      {
        data: courses.map((course) =>
          course.classesHeld === 0
            ? 0
            : Math.round((course.classesAttended / course.classesHeld) * 100),
        ),
      },
    ],
  };
  const marksByAssessment = useMemo(
    () =>
      [0, 1, 2, 3].map((assessmentIndex) => {
        const marks = courses
          .map((course) => course.marks[assessmentIndex])
          .filter((mark): mark is number => mark !== undefined);
        return marks.length === 0
          ? 0
          : Math.round(marks.reduce((total, mark) => total + mark, 0) / marks.length);
      }),
    [courses],
  );
  const marksData = {
    labels: ['Quiz 1', 'Quiz 2', 'Midterm', 'Latest'],
    datasets: [{ data: marksByAssessment }],
  };
  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 118, 92, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(112, 127, 117, ${opacity})`,
    propsForBackgroundLines: {
      stroke: colors.chartGrid,
      strokeDasharray: '',
    },
    propsForLabels: {
      fontSize: 9,
      origin: undefined,
    },
    fillShadowGradient: '#83B69A',
    fillShadowGradientOpacity: 0.2,
  };

  return (
    <View style={styles.chartStack}>
      <View style={styles.chartCard}>
        <View style={styles.chartHeading}>
          <View>
            <Text style={styles.chartTitle}>Attendance by course</Text>
            <Text style={styles.chartSubtitle}>Compare courses against the 75% target</Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>ATTENDANCE</Text>
          </View>
        </View>
        {courses.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={attendanceData}
              width={Math.max(width, courses.length * 66)}
              height={214}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero
              segments={4}
              showValuesOnTopOfBars
              withInnerLines
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ScrollView>
        ) : (
          <EmptyChartMessage />
        )}
        <View style={styles.targetNote}>
          <View style={styles.targetDash} />
          <Text style={styles.targetText}>Aim for {ATTENDANCE_THRESHOLD}% or higher</Text>
        </View>
      </View>
      <View style={styles.chartCard}>
        <View style={styles.chartHeading}>
          <View>
            <Text style={styles.chartTitle}>Marks over time</Text>
            <Text style={styles.chartSubtitle}>Average across your courses</Text>
          </View>
          <Text style={styles.chartTag}>4 ASSESSMENTS</Text>
        </View>
        {courses.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={marksData}
              width={Math.max(width, 300)}
              height={205}
              yAxisSuffix="%"
              fromZero
              segments={4}
              bezier
              withDots={false}
              withShadow={false}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </ScrollView>
        ) : (
          <EmptyChartMessage />
        )}
      </View>
    </View>
  );
}

function EmptyChartMessage() {
  return (
    <View style={styles.emptyChart}>
      <Text style={styles.emptyChartText}>No course data to chart yet.</Text>
    </View>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const attendance = Math.round((course.classesAttended / course.classesHeld) * 100);
  const latestMark = course.marks[course.marks.length - 1];
  const isAtRisk = attendance < ATTENDANCE_THRESHOLD;
  const dueDate = course.assignmentDue ? new Date(`${course.assignmentDue}T12:00:00`) : null;
  const hasUpcomingAssignment = isUpcomingAssignment(course.assignmentDue);

  return (
    <View style={styles.courseCard}>
      <View style={styles.courseTopRow}>
        <View style={[styles.courseAccent, { backgroundColor: course.accent }]} />
        <View style={styles.courseTitleBlock}>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseMetadata}>{course.code}  ·  {course.instructor}</Text>
        </View>
        <View style={[styles.courseCodeBadge, { backgroundColor: `${course.accent}14` }]}>
          <Text style={[styles.courseCodeText, { color: course.accent }]}>
            {course.code.split(/(?=\d)/)[0]}
          </Text>
        </View>
      </View>

      <View style={styles.courseMetrics}>
        <View style={styles.attendanceMetric}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>ATTENDANCE</Text>
            <Text style={[styles.attendanceValue, isAtRisk && styles.atRiskText]}>{attendance}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(attendance, 100)}%`, backgroundColor: isAtRisk ? '#C26B55' : course.accent },
              ]}
            />
          </View>
          <Text style={styles.metricFootnote}>
            {course.classesAttended} of {course.classesHeld} classes
          </Text>
        </View>
        <View style={styles.markMetric}>
          <Text style={styles.metricLabel}>LATEST MARK</Text>
          <Text style={styles.markValue}>{latestMark}<Text style={styles.markPercent}>%</Text></Text>
          <Text style={styles.metricFootnote}>most recent assessment</Text>
        </View>
      </View>

      <View style={styles.assignmentStrip}>
        <View style={styles.assignmentIcon}>
          <Text style={styles.assignmentIconText}>↗</Text>
        </View>
        <View style={styles.assignmentCopy}>
          <Text style={styles.assignmentLabel}>
            {hasUpcomingAssignment ? 'NEXT ASSIGNMENT' : course.assignmentDue ? 'PAST DUE' : 'COURSEWORK'}
          </Text>
          <Text style={styles.assignmentName} numberOfLines={1}>
            {course.assignmentDue ? course.assignmentTitle : 'No upcoming assignment'}
          </Text>
        </View>
        <Text style={styles.assignmentDue}>
          {dueDate
            ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'All caught up'}
        </Text>
      </View>
    </View>
  );
}

export function AttendanceEntry({
  courses,
  selectedCourseId,
  onSelectCourse,
  entryMode,
  onChangeMode,
  markInput,
  onChangeMark,
  onRecordAttendance,
  onUpdateMark,
  feedback,
}: AttendanceEntryProps) {
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  return (
    <View style={styles.entryCard}>
      <View style={styles.modeSwitch}>
        <ModeButton
          title="Record attendance"
          active={entryMode === 'attendance'}
          onPress={() => onChangeMode('attendance')}
        />
        <ModeButton
          title="Update a mark"
          active={entryMode === 'mark'}
          onPress={() => onChangeMode('mark')}
        />
      </View>

      <Text style={styles.inputLabel}>CHOOSE A COURSE</Text>
      <View style={styles.coursePicker}>
        {courses.map((course) => (
          <Pressable
            key={course.id}
            onPress={() => onSelectCourse(course.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: course.id === selectedCourseId }}
            style={({ pressed }) => [
              styles.coursePill,
              course.id === selectedCourseId && styles.coursePillSelected,
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.coursePillText,
                course.id === selectedCourseId && styles.coursePillTextSelected,
              ]}>
              {course.code}
            </Text>
          </Pressable>
        ))}
      </View>

      {entryMode === 'attendance' ? (
        <View style={styles.attendanceActions}>
          <Pressable
            onPress={() => onRecordAttendance(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.presentButton, pressed && styles.pressed]}>
            <Text style={styles.presentSymbol}>✓</Text>
            <Text style={styles.presentButtonText}>Present</Text>
          </Pressable>
          <Pressable
            onPress={() => onRecordAttendance(false)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.absentButton, pressed && styles.pressed]}>
            <Text style={styles.absentSymbol}>−</Text>
            <Text style={styles.absentButtonText}>Absent</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Text style={styles.inputLabel}>LATEST ASSESSMENT MARK</Text>
          <View style={styles.markInputRow}>
            <TextInput
              value={markInput}
              onChangeText={(value) => onChangeMark(value.replace(/[^\d.]/g, '').slice(0, 5))}
              placeholder={selectedCourse ? String(selectedCourse.marks.at(-1) ?? '') : 'e.g. 82'}
              placeholderTextColor="#9DA79F"
              keyboardType="decimal-pad"
              accessibilityLabel="New assessment mark from 0 to 100"
              maxLength={5}
              style={styles.markInput}
            />
            <Text style={styles.markInputSuffix}>/ 100</Text>
            <Pressable
              onPress={onUpdateMark}
              accessibilityRole="button"
              style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
              <Text style={styles.saveButtonText}>Save mark</Text>
            </Pressable>
          </View>
          <Text style={styles.inputHint}>Use a number from 0 to 100. One decimal place is okay.</Text>
        </View>
      )}
      {feedback.length > 0 && (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            styles.feedback,
            feedback.startsWith('Enter') && styles.feedbackError,
          ]}>
          {feedback}
        </Text>
      )}
    </View>
  );
}

function ModeButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.modeButton,
        active && styles.modeButtonActive,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{title}</Text>
    </Pressable>
  );
}

export function EmptyState({
  query,
  message,
  title,
}: {
  query: string;
  message?: string;
  title?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateMark}>{message ? '✓' : '⌕'}</Text>
      <Text style={styles.emptyStateTitle}>
        {title ?? (message ? 'All clear' : 'No courses found')}
      </Text>
      <Text style={styles.emptyStateDetail}>
        {message ?? `No course matches “${query}”. Try a different name or course code.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  viewSwitcher: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E6EAE3',
    borderRadius: 15,
    backgroundColor: '#EEF1EB',
  },
  viewButton: {
    minHeight: 39,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 11,
  },
  viewButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#20382D',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  viewButtonText: {
    color: '#75847A',
    fontSize: 11,
    fontWeight: '600',
  },
  viewButtonTextSelected: {
    color: '#315C45',
    fontWeight: '700',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 22,
  },
  brandLine: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 22,
    height: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    padding: 4,
    borderRadius: 7,
    backgroundColor: '#E1EDE4',
  },
  brandMarkBar: {
    width: 3,
    height: 6,
    borderRadius: 2,
    backgroundColor: colors.green,
  },
  brandMarkBarTall: {
    height: 12,
  },
  brandMarkBarMid: {
    height: 9,
  },
  brand: {
    color: '#355A48',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  termBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 9,
    paddingVertical: 5,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#E9EEE7',
    color: '#6F8173',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  headerTitleRow: {
    minHeight: 148,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  headerTextBlock: {
    flex: 1,
  },
  greeting: {
    color: '#7D8B80',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  headline: {
    marginTop: 8,
    color: '#1C3429',
    fontSize: 35,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -1.3,
  },
  headerCaption: {
    maxWidth: 270,
    marginTop: 9,
    color: '#76837A',
    fontSize: 12,
    lineHeight: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#DCE8DD',
    borderRadius: 26,
    backgroundColor: '#E7F0E7',
  },
  avatarText: {
    color: '#3E7054',
    fontSize: 14,
    fontWeight: '800',
  },
  resetButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E6DD',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  resetSymbol: {
    color: colors.green,
    fontSize: 14,
  },
  resetText: {
    color: '#5C7465',
    fontSize: 10,
    fontWeight: '700',
  },
  summaryCard: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#244D3B',
  },
  summaryIntro: {
    paddingHorizontal: 20,
    paddingTop: 19,
    paddingBottom: 17,
  },
  summaryEyebrow: {
    color: '#BBD2C0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  summaryMessage: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  summarySubtext: {
    marginTop: 3,
    color: '#D0E1D2',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 17,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  statLabel: {
    color: '#BDD2C2',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  statValue: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  statValueWarning: {
    color: '#FFD0A5',
  },
  statNote: {
    color: '#B9CDBD',
    fontSize: 9,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sectionHeading: {
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: '#84958A',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  sectionDetail: {
    marginTop: 3,
    color: '#7D8980',
    fontSize: 11,
    lineHeight: 16,
  },
  warningBanner: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F0E0D3',
    borderRadius: 15,
    backgroundColor: '#FFF8F2',
  },
  warningIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#F8E8D9',
  },
  warningIconText: {
    color: '#B97448',
    fontSize: 14,
    fontWeight: '800',
  },
  warningCopy: {
    flex: 1,
    gap: 3,
  },
  warningTitle: {
    color: '#423A32',
    fontSize: 12,
    fontWeight: '700',
  },
  warningDetail: {
    color: '#967E6E',
    fontSize: 10,
  },
  warningCode: {
    color: '#A28A78',
    fontSize: 9,
    fontWeight: '700',
  },
  chartStack: {
    gap: 12,
  },
  chartCard: {
    overflow: 'hidden',
    paddingTop: 17,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECE6',
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  chartHeading: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 7,
  },
  chartTitle: {
    color: '#24372E',
    fontSize: 13,
    fontWeight: '700',
  },
  chartSubtitle: {
    marginTop: 3,
    color: '#89958C',
    fontSize: 9,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#68A080',
  },
  legendText: {
    color: '#819087',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  chartTag: {
    color: '#7C8D81',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  chart: {
    paddingRight: 16,
    paddingLeft: 0,
  },
  targetNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 17,
    paddingTop: 1,
  },
  targetDash: {
    width: 13,
    height: 1,
    backgroundColor: '#D39466',
  },
  targetText: {
    color: '#879188',
    fontSize: 9,
  },
  emptyChart: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyChartText: {
    color: colors.muted,
    fontSize: 12,
  },
  courseCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8EBE5',
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  courseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  courseAccent: {
    width: 3,
    height: 34,
    borderRadius: 3,
  },
  courseTitleBlock: {
    flex: 1,
    gap: 4,
  },
  courseName: {
    color: '#23362C',
    fontSize: 13,
    fontWeight: '700',
  },
  courseMetadata: {
    color: '#849087',
    fontSize: 9,
  },
  courseCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  courseCodeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  courseMetrics: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
    paddingBottom: 13,
  },
  attendanceMetric: {
    flex: 1.1,
    gap: 5,
  },
  markMetric: {
    minWidth: 100,
    flex: 0.75,
    gap: 4,
    paddingLeft: 13,
    borderLeftWidth: 1,
    borderLeftColor: '#E9ECE7',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#87938A',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  attendanceValue: {
    color: '#446B53',
    fontSize: 13,
    fontWeight: '800',
  },
  atRiskText: {
    color: colors.red,
  },
  progressTrack: {
    height: 5,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: '#EDF0EB',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  metricFootnote: {
    color: '#929C94',
    fontSize: 8,
  },
  markValue: {
    color: '#293D32',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  markPercent: {
    color: '#75857A',
    fontSize: 11,
    fontWeight: '600',
  },
  assignmentStrip: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#EEF0EB',
  },
  assignmentIcon: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F4EE',
  },
  assignmentIconText: {
    color: '#698171',
    fontSize: 13,
    fontWeight: '700',
  },
  assignmentCopy: {
    flex: 1,
    gap: 2,
  },
  assignmentLabel: {
    color: '#98A198',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  assignmentName: {
    color: '#48584D',
    fontSize: 9,
    fontWeight: '600',
  },
  assignmentDue: {
    color: '#66796C',
    fontSize: 9,
    fontWeight: '700',
  },
  entryCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E6EAE3',
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    marginBottom: 17,
    borderRadius: 12,
    backgroundColor: '#F2F4F0',
  },
  modeButton: {
    minHeight: 35,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 9,
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#20382D',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  modeButtonText: {
    color: '#829087',
    fontSize: 10,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#315C45',
    fontWeight: '700',
  },
  inputLabel: {
    marginBottom: 8,
    color: '#87938A',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  coursePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 16,
  },
  coursePill: {
    minWidth: 65,
    minHeight: 31,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E6EAE4',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  coursePillSelected: {
    borderColor: '#34765C',
    backgroundColor: '#EAF2EC',
  },
  coursePillText: {
    color: '#7D8A80',
    fontSize: 9,
    fontWeight: '700',
  },
  coursePillTextSelected: {
    color: '#34765C',
  },
  attendanceActions: {
    flexDirection: 'row',
    gap: 9,
  },
  presentButton: {
    minHeight: 43,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    backgroundColor: '#34765C',
  },
  presentSymbol: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  presentButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  absentButton: {
    minHeight: 43,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9DDD8',
    borderRadius: 12,
    backgroundColor: '#FFF9F7',
  },
  absentSymbol: {
    color: '#AD6557',
    fontSize: 15,
    fontWeight: '700',
  },
  absentButtonText: {
    color: '#986B61',
    fontSize: 11,
    fontWeight: '700',
  },
  markInputRow: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: '#E4E9E2',
    borderRadius: 12,
    backgroundColor: '#FBFCFA',
  },
  markInput: {
    minWidth: 45,
    flex: 1,
    paddingVertical: 10,
    color: '#23362C',
    fontSize: 15,
    fontWeight: '700',
  },
  markInputSuffix: {
    paddingRight: 12,
    color: '#99A39B',
    fontSize: 11,
  },
  saveButton: {
    minHeight: 39,
    justifyContent: 'center',
    paddingHorizontal: 13,
    marginRight: 4,
    borderRadius: 9,
    backgroundColor: '#34765C',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  inputHint: {
    marginTop: 7,
    color: '#96A098',
    fontSize: 9,
  },
  feedback: {
    marginTop: 12,
    color: '#377553',
    fontSize: 10,
    fontWeight: '600',
  },
  feedbackError: {
    color: '#B34E45',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 29,
    borderWidth: 1,
    borderColor: '#E8EBE5',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  emptyStateMark: {
    color: '#8A9D8E',
    fontSize: 21,
  },
  emptyStateTitle: {
    marginTop: 7,
    color: '#314639',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyStateDetail: {
    maxWidth: 260,
    marginTop: 5,
    color: '#8A958D',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
