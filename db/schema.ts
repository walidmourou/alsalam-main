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
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// Lookup Tables
// ============================================

export const genders = mysqlTable("genders", {
  id: tinyint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
});

export const maritalStatuses = mysqlTable("marital_statuses", {
  id: tinyint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
});

export const relationshipTypes = mysqlTable("relationship_types", {
  id: tinyint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
});

export const enrollmentStatuses = mysqlTable("enrollment_statuses", {
  id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
  label: varchar("label", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
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
    genderId: tinyint("gender_id", { unsigned: true })
      .notNull()
      .references(() => genders.id),
    birthDate: date("birth_date"),
    phone: varchar("phone", { length: 100 }),
    phone2: varchar("phone2", { length: 100 }),
    address: varchar("address", { length: 255 }),
    maritalStatusId: tinyint("marital_status_id", { unsigned: true })
      .notNull()
      .default(1)
      .references(() => maritalStatuses.id),
    bank: varchar("bank", { length: 255 }),
    iban: varchar("iban", { length: 255 }),
    bic: varchar("bic", { length: 100 }),
    password: varchar("password", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    genderIdx: index("users_gender_idx").on(table.genderId),
    maritalStatusIdx: index("users_marital_status_idx").on(
      table.maritalStatusId,
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: uniqueIndex("teachers_user_idx").on(table.userId),
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
    genderId: tinyint("gender_id", { unsigned: true })
      .notNull()
      .references(() => genders.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    genderIdx: index("students_gender_idx").on(table.genderId),
    nameIdx: index("students_name_idx").on(table.lastName, table.firstName),
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
    statusId: smallint("status_id", { unsigned: true })
      .notNull()
      .references(() => enrollmentStatuses.id),
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
    statusIdx: index("class_students_status_idx").on(table.statusId),
  }),
);

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
    courseStart: time("course_start").notNull(),
    courseEnd: time("course_end").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    classScheduleIdx: index("class_schedule_idx").on(
      table.classId,
      table.weekDayId,
    ),
    teacherScheduleIdx: index("teacher_schedule_idx").on(
      table.teacherId,
      table.weekDayId,
    ),
    roomScheduleIdx: index("room_schedule_idx").on(
      table.roomId,
      table.weekDayId,
    ),
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

export const incomingTransactions = mysqlTable(
  "incoming_transactions",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id),
    amount: decimal("amount", { precision: 12, scale: 2 }),
    currencyId: smallint("currency_id", { unsigned: true })
      .notNull()
      .references(() => currencies.id),
    transactionRef: varchar("transaction_ref", { length: 255 }),
    note: text("note"),
    incomingTypeId: smallint("incoming_type_id", { unsigned: true })
      .notNull()
      .references(() => incomingTypes.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: index("incoming_user_idx").on(table.userId),
    createdAtIdx: index("incoming_created_at_idx").on(table.createdAt),
    typeIdx: index("incoming_type_idx").on(table.incomingTypeId),
  }),
);

export const purchaseCategories = mysqlTable(
  "purchase_categories",
  {
    id: smallint("id", { unsigned: true }).primaryKey().autoincrement(),
    label: varchar("label", { length: 255 }).notNull(),
    parentCategoryId: smallint("parent_category_id", {
      unsigned: true,
    }).references(() => purchaseCategories.id),
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
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id),
    amount: decimal("amount", { precision: 12, scale: 2 }),
    currencyId: smallint("currency_id", { unsigned: true })
      .notNull()
      .references(() => currencies.id),
    purchaseCategoryId: smallint("purchase_category_id", {
      unsigned: true,
    })
      .notNull()
      .references(() => purchaseCategories.id),
    note: text("note"),
    photoLink: text("photo_link"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdx: index("purchases_user_idx").on(table.userId),
    categoryIdx: index("purchases_category_idx").on(table.purchaseCategoryId),
    createdAtIdx: index("purchases_created_at_idx").on(table.createdAt),
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
  gender: one(genders, {
    fields: [users.genderId],
    references: [genders.id],
  }),
  maritalStatus: one(maritalStatuses, {
    fields: [users.maritalStatusId],
    references: [maritalStatuses.id],
  }),
  teacher: one(teachers, {
    fields: [users.id],
    references: [teachers.userId],
  }),
  memberships: many(memberships),
  studentGuardians: many(studentGuardians),
  incomingTransactions: many(incomingTransactions),
  purchases: many(purchases),
  createdArticles: many(articles, { relationName: "createdBy" }),
  updatedArticles: many(articles, { relationName: "updatedBy" }),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  classCourseRooms: many(classCourseRooms),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  gender: one(genders, {
    fields: [students.genderId],
    references: [genders.id],
  }),
  classStudents: many(classStudents),
  guardians: many(studentGuardians),
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
  status: one(enrollmentStatuses, {
    fields: [classStudents.statusId],
    references: [enrollmentStatuses.id],
  }),
}));

export const classCourseRoomsRelations = relations(
  classCourseRooms,
  ({ one }) => ({
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
}));

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

// ============================================
// Export Types (Singular Entities)
// ============================================

export type Gender = typeof genders.$inferSelect;
export type NewGender = typeof genders.$inferInsert;
export type MaritalStatus = typeof maritalStatuses.$inferSelect;
export type NewMaritalStatus = typeof maritalStatuses.$inferInsert;
export type RelationshipType = typeof relationshipTypes.$inferSelect;
export type NewRelationshipType = typeof relationshipTypes.$inferInsert;
export type EnrollmentStatus = typeof enrollmentStatuses.$inferSelect;
export type NewEnrollmentStatus = typeof enrollmentStatuses.$inferInsert;
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