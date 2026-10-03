import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  AcademicChart,
  AcademicSummary,
  AttendanceEntry,
  CourseCard,
  DashboardHeader,
  EmptyState,
  SectionHeading,
  ViewSwitcher,
  WarningBanner,
  type DashboardView,
} from '@/components/student-pulse';
import {
  INITIAL_COURSES,
  ATTENDANCE_THRESHOLD,
  isUpcomingAssignment,
  type Course,
} from '@/data/courses';

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(INITIAL_COURSES[0].id);
  const [entryMode, setEntryMode] = useState<'attendance' | 'mark'>('attendance');
  const [markInput, setMarkInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const scrollViewRef = useRef<ScrollViewType>(null);
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(260, Math.min(width - 60, 620));

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter(
      ({ name, code }) => name.toLowerCase().includes(query) || code.toLowerCase().includes(query),
    );
  }, [courses, search]);

  const upcomingAssignments = useMemo(
    () =>
      courses
        .filter((course) => isUpcomingAssignment(course.assignmentDue))
        .slice()
        .sort((a, b) => {
          if (a.assignmentDue === null || b.assignmentDue === null) return 0;
          return a.assignmentDue.localeCompare(b.assignmentDue);
        }),
    [courses],
  );

  const recordAttendance = (present: boolean) => {
    setCourses((current) =>
      current.map((course) =>
        course.id === selectedCourseId
          ? {
              ...course,
              classesHeld: course.classesHeld + 1,
              classesAttended: course.classesAttended + (present ? 1 : 0),
            }
          : course,
      ),
    );
    const courseName = courses.find((course) => course.id === selectedCourseId)?.code ?? 'Course';
    setFeedback(`${present ? 'Present' : 'Absent'} recorded for ${courseName}.`);
  };

  const updateMark = () => {
    const normalizedMark = markInput.trim();
    const parsedMark = Number(normalizedMark);
    if (
      !/^\d{1,3}(?:\.\d)?$/.test(normalizedMark) ||
      !Number.isFinite(parsedMark) ||
      parsedMark < 0 ||
      parsedMark > 100
    ) {
      setFeedback('Enter a mark from 0 to 100 with at most one decimal place.');
      return;
    }

    setCourses((current) =>
      current.map((course) =>
        course.id === selectedCourseId
          ? { ...course, marks: [...course.marks.slice(0, -1), parsedMark] }
          : course,
      ),
    );
    const courseName = courses.find((course) => course.id === selectedCourseId)?.code ?? 'Course';
    setFeedback(`Latest mark updated for ${courseName}.`);
    setMarkInput('');
  };

  const resetDemo = () => {
    setCourses(INITIAL_COURSES.map((course) => ({ ...course, marks: [...course.marks] })));
    setSelectedCourseId(INITIAL_COURSES[0].id);
    setSearch('');
    setMarkInput('');
    setFeedback('Sample data restored.');
  };

  const atRiskCourses = courses.filter(
    (course) => (course.classesAttended / course.classesHeld) * 100 < ATTENDANCE_THRESHOLD,
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.dashboard}>
            <DashboardHeader onReset={resetDemo} />
            <ViewSwitcher
              selectedView={activeView}
              onSelectView={(view) => {
                setActiveView(view);
                scrollViewRef.current?.scrollTo({ y: 0, animated: false });
              }}
            />

            {activeView === 'overview' && (
              <View>
                <AcademicSummary courses={courses} upcomingCount={upcomingAssignments.length} />

                <View style={styles.section}>
                  <SectionHeading
                    eyebrow="A LITTLE ATTENTION NOW"
                    title="Risk check"
                    detail={`${atRiskCourses.length} course${atRiskCourses.length === 1 ? '' : 's'} below ${ATTENDANCE_THRESHOLD}% attendance`}
                  />
                  {atRiskCourses.length > 0 ? (
                    <View style={styles.warningList}>
                      {atRiskCourses.map((course) => (
                        <WarningBanner key={course.id} course={course} />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.safeNotice}>
                      <Text style={styles.safeNoticeMark}>✓</Text>
                      <Text style={styles.safeNoticeText}>
                        Looking good — every course is above the {ATTENDANCE_THRESHOLD}% attendance
                        threshold.
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.section}>
                  <SectionHeading
                    eyebrow="YOUR SEMESTER, IN FOCUS"
                    title="Academic trends"
                    detail="Attendance by course and marks across recent assessments"
                  />
                  <AcademicChart courses={courses} width={chartWidth} />
                </View>
              </View>
            )}

            {activeView === 'courses' && (
              <View>
                <View style={styles.section}>
                  <SectionHeading
                    eyebrow="THIS SEMESTER"
                    title="Your courses"
                    detail={`${courses.length} courses · search by name or course code`}
                  />
                  <CourseSearch value={search} onChangeText={setSearch} />
                  {filteredCourses.length > 0 ? (
                    <View style={styles.courseList}>
                      {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </View>
                  ) : (
                    <EmptyState query={search} />
                  )}
                </View>

                <View style={styles.section}>
                  <SectionHeading
                    eyebrow="KEEP IT UP TO DATE"
                    title="Quick update"
                    detail="Log a class or adjust your latest assessment mark"
                  />
                  <AttendanceEntry
                    courses={courses}
                    selectedCourseId={selectedCourseId}
                    onSelectCourse={setSelectedCourseId}
                    entryMode={entryMode}
                    onChangeMode={(mode) => {
                      setEntryMode(mode);
                      setFeedback('');
                    }}
                    markInput={markInput}
                    onChangeMark={setMarkInput}
                    onRecordAttendance={recordAttendance}
                    onUpdateMark={updateMark}
                    feedback={feedback}
                  />
                </View>
              </View>
            )}

            {activeView === 'assignments' && (
              <View style={styles.section}>
                <SectionHeading
                  eyebrow="PLAN AHEAD"
                  title="Assignment deadlines"
                  detail={`${upcomingAssignments.length} upcoming · earliest due first`}
                />
                {upcomingAssignments.length > 0 ? (
                  <View style={styles.deadlineList}>
                    {upcomingAssignments.map((course) => (
                      <DeadlineRow key={course.id} course={course} />
                    ))}
                  </View>
                ) : (
                  <EmptyState
                    query=""
                    title="No upcoming assignments"
                    message="You’re all caught up. Check back when new deadlines are added."
                  />
                )}
              </View>
            )}

            <Text style={styles.footer}>
              STUDENT PULSE <Text style={styles.footerDot}>·</Text> DEMO DATA STORED ON THIS DEVICE
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CourseSearch({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.searchShell}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Try “Data Structures” or “CS301”"
        placeholderTextColor="#9BA3AE"
        accessibilityLabel="Search courses by name or course code"
        returnKeyType="search"
        style={styles.searchInput}
      />
      {value.length > 0 && (
        <Text onPress={() => onChangeText('')} style={styles.clearSearch} accessibilityRole="button">
          Clear
        </Text>
      )}
    </View>
  );
}

function DeadlineRow({ course }: { course: Course }) {
  if (!course.assignmentDue) return null;
  const dueDate = new Date(`${course.assignmentDue}T12:00:00`);
  return (
    <View style={styles.deadlineRow}>
      <View style={styles.deadlineDate}>
        <Text style={styles.deadlineMonth}>
          {dueDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
        </Text>
        <Text style={styles.deadlineDay}>{dueDate.getDate()}</Text>
      </View>
      <View style={styles.deadlineInfo}>
        <Text style={styles.deadlineTitle}>{course.assignmentTitle}</Text>
        <Text style={styles.deadlineCourse}>{course.code} · {course.name}</Text>
      </View>
      <Text style={styles.deadlineChevron}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6F2',
  },
  flex: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  dashboard: {
    width: '100%',
    maxWidth: 680,
  },
  section: {
    marginTop: 32,
  },
  warningList: {
    gap: 10,
  },
  safeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#E7F2EA',
  },
  safeNoticeMark: {
    color: '#2F7852',
    fontSize: 18,
    fontWeight: '800',
  },
  safeNoticeText: {
    flex: 1,
    color: '#315840',
    fontSize: 13,
    lineHeight: 19,
  },
  courseList: {
    gap: 12,
  },
  searchShell: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E8E2',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    color: '#60716A',
    fontSize: 23,
    lineHeight: 28,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#192B25',
    fontSize: 13,
  },
  clearSearch: {
    color: '#34765C',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 10,
  },
  deadlineList: {
    gap: 0,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  deadlineRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9ECE7',
  },
  deadlineDate: {
    width: 42,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 11,
    backgroundColor: '#F1F4EE',
  },
  deadlineMonth: {
    color: '#688071',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  deadlineDay: {
    marginTop: 1,
    color: '#203C30',
    fontSize: 19,
    fontWeight: '800',
  },
  deadlineInfo: {
    flex: 1,
    gap: 4,
  },
  deadlineTitle: {
    color: '#1D2F28',
    fontSize: 13,
    fontWeight: '700',
  },
  deadlineCourse: {
    color: '#839087',
    fontSize: 11,
  },
  deadlineChevron: {
    color: '#9BA69F',
    fontSize: 23,
  },
  footer: {
    marginTop: 32,
    color: '#9AA39C',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  footerDot: {
    color: '#73A287',
  },
});
