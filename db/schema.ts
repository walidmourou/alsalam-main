// db/schema.ts
import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  date,
  time,
  tinyint,
  smallint,
  int,
  decimal,
  boolean,
  uniqueIndex,
  index,
  mysqlEnum,
  type AnyMySqlColumn,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import {
  GENDERS,
  MARITAL_STATUSES,
  ADMISSION_STATUSES,
  TEACHER_STATUSES,
  ATTENDANCE_STATUSES,
} from "@/lib/enums";

// ============================================
// Lookup Tables
// ============================================

export {
  GENDERS,
  MARITAL_STATUSES,
  ADMISSION_STATUSES,
  TEACHER_STATUSES,
  ATTENDANCE_STATUSES,
};
export type {
  Gender,
  MaritalStatus,
  AdmissionStatus,
  TeacherStatus,
  AttendanceStatus,
} from "@/lib/enums";

export const relationshipTypes = mysqlTable("relationship_types", {
  id: tinyint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
});

export const membershipStatuses = mysqlTable("membership_statuses", {
  id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
});

export const currencies = mysqlTable(
  "currencies",
  {
    id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
    code: varchar("code", { length: 100 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("currencies_code_idx").on(table.code),
  }),
);

export const incomingTypes = mysqlTable("incoming_types", {
  id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ============================================
// Education Tables
// ============================================

export const educationYears = mysqlTable("education_years", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const educationLevels = mysqlTable("education_levels", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const classes = mysqlTable(
  "classes",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    educationYearId: bigint("education_year_id", {
      mode: "number",
      unsigned: true,
    }).references(() => educationYears.id),
    educationLevelId: bigint("education_level_id", {
      mode: "number",
      unsigned: true,
    }).references(() => educationLevels.id),
    label: varchar("label", { length: 255 }),
    maxStudents: int("max_students"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    yearIdx: index("classes_year_idx").on(table.educationYearId),
    levelIdx: index("classes_level_idx").on(table.educationLevelId),
  }),
);

export const educationalCourses = mysqlTable("educational_courses", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const classRooms = mysqlTable("class_rooms", {
  id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ============================================
// Users and Teachers
// ============================================

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    gender: mysqlEnum("gender", GENDERS).notNull().default("Keine Angabe"),
    birthDate: date("birth_date"),
    phone: varchar("phone", { length: 100 }),
    phone2: varchar("phone2", { length: 100 }),
    address: varchar("address", { length: 255 }),
    maritalStatus: mysqlEnum("marital_status", MARITAL_STATUSES)
      .notNull()
      .default("Ledig"),
    bank: varchar("bank", { length: 255 }),
    iban: varchar("iban", { length: 255 }),
    bic: varchar("bic", { length: 100 }),
    bankAccountHolder: varchar("bank_account_holder", { length: 255 }),
    sepaMandateAccepted: boolean("sepa_mandate_accepted")
      .notNull()
      .default(false),
    password: varchar("password", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    genderIdx: index("users_gender_idx").on(table.gender),
    maritalStatusIdx: index("users_marital_status_idx").on(
      table.maritalStatus,
    ),
    nameBirthUniqueIdx: uniqueIndex("users_name_birth_unique_idx").on(
      table.firstName,
      table.lastName,
      table.birthDate,
    ),
  }),
);

export const teachers = mysqlTable(
  "teachers",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    specialization: text("specialization"),
    qualifications: text("qualifications"),
    status: mysqlEnum("status", TEACHER_STATUSES)
      .notNull()
      .default("Antrag ausstehend"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: uniqueIndex("teachers_user_idx").on(table.userId),
    statusIdx: index("teachers_status_idx").on(table.status),
  }),
);

export const students = mysqlTable(
  "students",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    birthDate: date("birth_date").notNull(),
    notes: text("notes"),
    estimatedLevel: varchar("estimated_level", { length: 50 }),
    gender: mysqlEnum("gender", GENDERS).notNull().default("Keine Angabe"),
    admissionStatus: mysqlEnum("admission_status", ADMISSION_STATUSES)
      .notNull()
      .default("Zulassungsantrag"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    genderIdx: index("students_gender_idx").on(table.gender),
    admissionStatusIdx: index("students_admission_status_idx").on(
      table.admissionStatus,
    ),
    nameIdx: index("students_name_idx").on(table.lastName, table.firstName),
    nameBirthUniqueIdx: uniqueIndex("students_name_birth_unique_idx").on(
      table.firstName,
      table.lastName,
      table.birthDate,
    ),
  }),
);

// ============================================
// Student - Class Junction & Schedules
// ============================================

export const classStudents = mysqlTable(
  "class_students",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    studentId: bigint("student_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: bigint("class_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    studentClassIdx: uniqueIndex("student_class_unique_idx").on(
      table.studentId,
      table.classId,
    ),
    classIdx: index("class_students_class_idx").on(table.classId),
  }),
);

export const scheduleTimeSlots = mysqlTable("schedule_time_slots", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  weekDayId: tinyint("week_day_id", { unsigned: true }).notNull(),
  weekDay: mysqlEnum("week_day", [
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
    "Sonntag",
  ]).notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const classCourseRooms = mysqlTable(
  "class_course_rooms",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    classId: bigint("class_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    courseId: bigint("course_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => educationalCourses.id),
    roomId: smallint("room_id", { unsigned: true })
      .notNull()
      .references(() => classRooms.id),
    teacherId: bigint("teacher_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => teachers.id),
    scheduleTimeSlotId: bigint("schedule_time_slot_id", {
      mode: "number",
      unsigned: true,
    })
      .notNull()
      .references(() => scheduleTimeSlots.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    classScheduleIdx: index("class_schedule_idx").on(
      table.classId,
      table.scheduleTimeSlotId,
    ),
    teacherScheduleIdx: index("teacher_schedule_idx").on(
      table.teacherId,
      table.scheduleTimeSlotId,
    ),
    roomScheduleIdx: index("room_schedule_idx").on(
      table.roomId,
      table.scheduleTimeSlotId,
    ),
  }),
);

export const lectureSessions = mysqlTable(
  "lecture_sessions",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    classCourseRoomId: bigint("class_course_room_id", {
      mode: "number",
      unsigned: true,
    })
      .notNull()
      .references(() => classCourseRooms.id, { onDelete: "cascade" }),
    sessionDate: date("session_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    classCourseRoomDateIdx: index("lecture_sessions_class_course_room_date_idx").on(
      table.classCourseRoomId,
      table.sessionDate,
    ),
  }),
);

export const sessionStudents = mysqlTable(
  "session_students",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    sessionId: bigint("session_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => lectureSessions.id, { onDelete: "cascade" }),
    studentId: bigint("student_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    attendance: mysqlEnum("attendance", ATTENDANCE_STATUSES)
      .notNull()
      .default("present"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    sessionStudentIdx: uniqueIndex("session_student_unique_idx").on(
      table.sessionId,
      table.studentId,
    ),
    studentIdx: index("session_students_student_idx").on(table.studentId),
  }),
);

export const studentGuardians = mysqlTable(
  "student_guardians",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    studentId: bigint("student_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    relationshipTypeId: tinyint("relationship_type_id", {
      unsigned: true,
    })
      .notNull()
      .references(() => relationshipTypes.id),
    isPrimary: boolean("is_primary").notNull().default(false),
    canPickup: boolean("can_pickup").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userStudentUniqueIdx: uniqueIndex("user_student_unique_idx").on(
      table.userId,
      table.studentId,
    ),
    studentIdx: index("student_guardians_student_idx").on(table.studentId),
  }),
);

// ============================================
// Membership Tables
// ============================================

export const membershipTypes = mysqlTable("membership_types", {
  id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  annualFee: decimal("annual_fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const memberships = mysqlTable(
  "memberships",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    membershipTypeId: smallint("membership_type_id", {
      unsigned: true,
    })
      .notNull()
      .references(() => membershipTypes.id),
    membershipStatusId: smallint("membership_status_id", {
      unsigned: true,
    })
      .notNull()
      .references(() => membershipStatuses.id),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: index("memberships_user_idx").on(table.userId),
    statusIdx: index("memberships_status_idx").on(table.membershipStatusId),
  }),
);

// ============================================
// Financial Tables
// ============================================

export const financeImports = mysqlTable("finance_imports", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  filename: varchar("filename", { length: 255 }).notNull(),
  importedByUserId: bigint("imported_by_user_id", {
    mode: "number",
    unsigned: true,
  })
    .notNull()
    .references(() => users.id),
  totalRows: int("total_rows").notNull().default(0),
  insertedRows: int("inserted_rows").notNull().default(0),
  skippedRows: int("skipped_rows").notNull().default(0),
  importedAt: timestamp("imported_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const incomingTransactions = mysqlTable(
  "incoming_transactions",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).references(
      () => users.id,
    ),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currencyId: smallint("currency_id", { unsigned: true })
      .notNull()
      .references(() => currencies.id),
    transactionRef: varchar("transaction_ref", { length: 255 }),
    note: text("note"),
    incomingTypeId: smallint("incoming_type_id", { unsigned: true })
      .notNull()
      .references(() => incomingTypes.id),
    bookingDate: date("booking_date"),
    valueDate: date("value_date"),
    bookingText: varchar("booking_text", { length: 255 }),
    counterpartyName: varchar("counterparty_name", { length: 255 }),
    counterpartyIban: varchar("counterparty_iban", { length: 255 }),
    counterpartyBic: varchar("counterparty_bic", { length: 100 }),
    importId: bigint("import_id", { mode: "number", unsigned: true }).references(
      () => financeImports.id,
    ),
    dedupHash: varchar("dedup_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: index("incoming_user_idx").on(table.userId),
    createdAtIdx: index("incoming_created_at_idx").on(table.createdAt),
    typeIdx: index("incoming_type_idx").on(table.incomingTypeId),
    bookingDateIdx: index("incoming_booking_date_idx").on(table.bookingDate),
    dedupHashIdx: uniqueIndex("incoming_dedup_hash_idx").on(table.dedupHash),
  }),
);

export const purchaseCategories = mysqlTable(
  "purchase_categories",
  {
    id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
    label: varchar("label", { length: 255 }).notNull(),
    parentCategoryId: smallint("parent_category_id", {
      unsigned: true,
    }).references((): AnyMySqlColumn => purchaseCategories.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    parentCategoryIdx: index("purchase_category_parent_idx").on(
      table.parentCategoryId,
    ),
  }),
);

export const purchases = mysqlTable(
  "purchases",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).references(
      () => users.id,
    ),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currencyId: smallint("currency_id", { unsigned: true })
      .notNull()
      .references(() => currencies.id),
    purchaseCategoryId: smallint("purchase_category_id", {
      unsigned: true,
    }).references(() => purchaseCategories.id),
    note: text("note"),
    photoLink: text("photo_link"),
    bookingDate: date("booking_date"),
    valueDate: date("value_date"),
    bookingText: varchar("booking_text", { length: 255 }),
    counterpartyName: varchar("counterparty_name", { length: 255 }),
    counterpartyIban: varchar("counterparty_iban", { length: 255 }),
    counterpartyBic: varchar("counterparty_bic", { length: 100 }),
    importId: bigint("import_id", { mode: "number", unsigned: true }).references(
      () => financeImports.id,
    ),
    dedupHash: varchar("dedup_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: index("purchases_user_idx").on(table.userId),
    categoryIdx: index("purchases_category_idx").on(table.purchaseCategoryId),
    createdAtIdx: index("purchases_created_at_idx").on(table.createdAt),
    bookingDateIdx: index("purchases_booking_date_idx").on(table.bookingDate),
    dedupHashIdx: uniqueIndex("purchases_dedup_hash_idx").on(table.dedupHash),
  }),
);

// ============================================
// Articles Table
// ============================================

export const articles = mysqlTable(
  "articles",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    title: varchar("title", { length: 255 }),
    content: text("content"),
    isPublished: boolean("is_published").notNull().default(true),
    publishedDate: date("published_date"),
    createdByUserId: bigint("created_by_user_id", {
      mode: "number",
      unsigned: true,
    })
      .notNull()
      .references(() => users.id),
    updatedByUserId: bigint("updated_by_user_id", {
      mode: "number",
      unsigned: true,
    })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    isPublishedIdx: index("articles_published_idx").on(table.isPublished),
    createdByIdx: index("articles_created_by_idx").on(table.createdByUserId),
  }),
);

// ============================================
// Relations
// ============================================

export const purchaseCategoriesRelations = relations(
  purchaseCategories,
  ({ one }) => ({
    parentCategory: one(purchaseCategories, {
      fields: [purchaseCategories.parentCategoryId],
      references: [purchaseCategories.id],
    }),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [users.id],
    references: [teachers.userId],
  }),
  memberships: many(memberships),
  studentGuardians: many(studentGuardians),
  incomingTransactions: many(incomingTransactions),
  purchases: many(purchases),
  financeImports: many(financeImports),
  createdArticles: many(articles, { relationName: "createdBy" }),
  updatedArticles: many(articles, { relationName: "updatedBy" }),
  authTokens: many(authTokens),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  classCourseRooms: many(classCourseRooms),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  classStudents: many(classStudents),
  guardians: many(studentGuardians),
  sessionStudents: many(sessionStudents),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  educationYear: one(educationYears, {
    fields: [classes.educationYearId],
    references: [educationYears.id],
  }),
  educationLevel: one(educationLevels, {
    fields: [classes.educationLevelId],
    references: [educationLevels.id],
  }),
  classStudents: many(classStudents),
  classCourseRooms: many(classCourseRooms),
}));

export const classStudentsRelations = relations(classStudents, ({ one }) => ({
  student: one(students, {
    fields: [classStudents.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [classStudents.classId],
    references: [classes.id],
  }),
}));

export const classCourseRoomsRelations = relations(
  classCourseRooms,
  ({ one, many }) => ({
    class: one(classes, {
      fields: [classCourseRooms.classId],
      references: [classes.id],
    }),
    course: one(educationalCourses, {
      fields: [classCourseRooms.courseId],
      references: [educationalCourses.id],
    }),
    room: one(classRooms, {
      fields: [classCourseRooms.roomId],
      references: [classRooms.id],
    }),
    teacher: one(teachers, {
      fields: [classCourseRooms.teacherId],
      references: [teachers.id],
    }),
    scheduleTimeSlot: one(scheduleTimeSlots, {
      fields: [classCourseRooms.scheduleTimeSlotId],
      references: [scheduleTimeSlots.id],
    }),
    lectureSessions: many(lectureSessions),
  }),
);

export const lectureSessionsRelations = relations(
  lectureSessions,
  ({ one, many }) => ({
    classCourseRoom: one(classCourseRooms, {
      fields: [lectureSessions.classCourseRoomId],
      references: [classCourseRooms.id],
    }),
    sessionStudents: many(sessionStudents),
  }),
);

export const sessionStudentsRelations = relations(
  sessionStudents,
  ({ one }) => ({
    session: one(lectureSessions, {
      fields: [sessionStudents.sessionId],
      references: [lectureSessions.id],
    }),
    student: one(students, {
      fields: [sessionStudents.studentId],
      references: [students.id],
    }),
  }),
);

export const studentGuardiansRelations = relations(
  studentGuardians,
  ({ one }) => ({
    user: one(users, {
      fields: [studentGuardians.userId],
      references: [users.id],
    }),
    student: one(students, {
      fields: [studentGuardians.studentId],
      references: [students.id],
    }),
    relationshipType: one(relationshipTypes, {
      fields: [studentGuardians.relationshipTypeId],
      references: [relationshipTypes.id],
    }),
  }),
);

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  membershipType: one(membershipTypes, {
    fields: [memberships.membershipTypeId],
    references: [membershipTypes.id],
  }),
  membershipStatus: one(membershipStatuses, {
    fields: [memberships.membershipStatusId],
    references: [membershipStatuses.id],
  }),
}));

export const incomingTransactionsRelations = relations(
  incomingTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [incomingTransactions.userId],
      references: [users.id],
    }),
    currency: one(currencies, {
      fields: [incomingTransactions.currencyId],
      references: [currencies.id],
    }),
    incomingType: one(incomingTypes, {
      fields: [incomingTransactions.incomingTypeId],
      references: [incomingTypes.id],
    }),
    import: one(financeImports, {
      fields: [incomingTransactions.importId],
      references: [financeImports.id],
    }),
  }),
);

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [purchases.currencyId],
    references: [currencies.id],
  }),
  purchaseCategory: one(purchaseCategories, {
    fields: [purchases.purchaseCategoryId],
    references: [purchaseCategories.id],
  }),
  import: one(financeImports, {
    fields: [purchases.importId],
    references: [financeImports.id],
  }),
}));

export const financeImportsRelations = relations(
  financeImports,
  ({ one, many }) => ({
    importedBy: one(users, {
      fields: [financeImports.importedByUserId],
      references: [users.id],
    }),
    incomingTransactions: many(incomingTransactions),
    purchases: many(purchases),
  }),
);

export const articlesRelations = relations(articles, ({ one }) => ({
  createdBy: one(users, {
    fields: [articles.createdByUserId],
    references: [users.id],
    relationName: "createdBy",
  }),
  updatedBy: one(users, {
    fields: [articles.updatedByUserId],
    references: [users.id],
    relationName: "updatedBy",
  }),
}));

// ============================================
// Auth: Topics and Permissions
// ============================================

export const authTokens = mysqlTable(
  "auth_tokens",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    tokenType: varchar("token_type", { length: 50 }).notNull().default("magic_link"),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("auth_tokens_user_idx").on(table.userId),
    tokenIdx: uniqueIndex("auth_tokens_token_idx").on(table.token),
    expiresAtIdx: index("auth_tokens_expires_at_idx").on(table.expiresAt),
  }),
);

export const topics = mysqlTable("topics", {
  id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
});

export const userTopics = mysqlTable("user_topics", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  topicId: smallint("topic_id", { unsigned: true })
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  canCreate: boolean("can_create").notNull().default(false),
  canRead: boolean("can_read").notNull().default(true),
  canUpdate: boolean("can_update").notNull().default(false),
  canDelete: boolean("can_delete").notNull().default(false),
});

export const userTopicsRelations = relations(userTopics, ({ one }) => ({
  user: one(users, {
    fields: [userTopics.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [userTopics.topicId],
    references: [topics.id],
  }),
}));

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.id],
  }),
}));

// ============================================
// Export Types (Singular Entities)
// ============================================

export type RelationshipType = typeof relationshipTypes.$inferSelect;
export type NewRelationshipType = typeof relationshipTypes.$inferInsert;
export type MembershipStatus = typeof membershipStatuses.$inferSelect;
export type NewMembershipStatus = typeof membershipStatuses.$inferInsert;
export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
export type IncomingType = typeof incomingTypes.$inferSelect;
export type NewIncomingType = typeof incomingTypes.$inferInsert;
export type EducationYear = typeof educationYears.$inferSelect;
export type NewEducationYear = typeof educationYears.$inferInsert;
export type EducationLevel = typeof educationLevels.$inferSelect;
export type NewEducationLevel = typeof educationLevels.$inferInsert;
export type EducationalCourse = typeof educationalCourses.$inferSelect;
export type NewEducationalCourse = typeof educationalCourses.$inferInsert;
export type ClassRoom = typeof classRooms.$inferSelect;
export type NewClassRoom = typeof classRooms.$inferInsert;
export type MembershipType = typeof membershipTypes.$inferSelect;
export type NewMembershipType = typeof membershipTypes.$inferInsert;
export type PurchaseCategory = typeof purchaseCategories.$inferSelect;
export type NewPurchaseCategory = typeof purchaseCategories.$inferInsert;

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type IncomingTransaction = typeof incomingTransactions.$inferSelect;
export type NewIncomingTransaction = typeof incomingTransactions.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type FinanceImport = typeof financeImports.$inferSelect;
export type NewFinanceImport = typeof financeImports.$inferInsert;
export type ScheduleTimeSlot = typeof scheduleTimeSlots.$inferSelect;
export type NewScheduleTimeSlot = typeof scheduleTimeSlots.$inferInsert;
export type LectureSession = typeof lectureSessions.$inferSelect;
export type NewLectureSession = typeof lectureSessions.$inferInsert;
export type SessionStudent = typeof sessionStudents.$inferSelect;
export type NewSessionStudent = typeof sessionStudents.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;