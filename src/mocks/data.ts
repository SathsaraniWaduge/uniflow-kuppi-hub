// Mock data store - replaces Supabase backend
// All data is stored in memory and persisted to localStorage

const STORAGE_KEY = "uniflow_mock_db";

// ============= Types =============
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "student" | "organizer";
  current_year: number | null;
  current_semester: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  module_code: string;
  module_name: string;
  year: number;
  semester: number;
  created_at: string;
}

export interface StudentModule {
  id: string;
  student_id: string;
  module_id: string;
  enrolled_semester: string | null;
  created_at: string;
}

export interface KuppiNotice {
  id: string;
  title: string;
  module_id: string;
  description: string | null;
  google_form_url: string | null;
  created_by: string;
  created_at: string;
}

export interface KuppiRegistration {
  id: string;
  notice_id: string;
  student_id: string | null;
  student_name: string;
  student_email: string;
  registered_at: string;
}

export interface KuppiSession {
  id: string;
  notice_id: string;
  session_date: string;
  session_time: string;
  platform: string;
  meeting_link: string;
  covered_parts: string | null;
  organizer_id: string;
  reminder_sent: boolean;
  meeting_room_url: string | null;
  meeting_room_name: string | null;
  recording_status: string;
  created_at: string;
}

export interface KuppiRecording {
  id: string;
  session_id: string;
  title: string;
  file_url: string;
  uploaded_at: string;
}

export interface KuppiFeedback {
  id: string;
  session_id: string;
  student_id: string;
  comment: string | null;
  rating: number;
  created_at: string;
}

export interface MockDB {
  users: User[];
  modules: Module[];
  student_modules: StudentModule[];
  kuppi_notices: KuppiNotice[];
  kuppi_registrations: KuppiRegistration[];
  kuppi_sessions: KuppiSession[];
  kuppi_recordings: KuppiRecording[];
  kuppi_feedback: KuppiFeedback[];
}

// ============= Helper =============
function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ============= Seed Data =============
function createSeedData(): MockDB {
  const orgId = "b0c771d7-a1d4-45f6-9467-d233f8e9d966";
  const org2Id = "27b9e252-fdb0-4b8b-90a0-eed1782c8583";
  const studentId = "e5eab347-3f85-4cc2-8240-7468178b3dac";

  const users: User[] = [
    { id: orgId, email: "ikrathnayaka@gmail.com", password: "123456", name: "Indika", role: "organizer", current_year: null, current_semester: null, avatar_url: null, created_at: "2026-03-04T03:33:46.281Z", updated_at: "2026-03-04T03:33:46.845Z" },
    { id: org2Id, email: "org2@sliit.lk", password: "123456", name: "Kumara", role: "organizer", current_year: null, current_semester: null, avatar_url: null, created_at: "2026-03-04T03:33:46.281Z", updated_at: "2026-03-04T03:33:46.845Z" },
    { id: studentId, email: "sathsarani@sliit.lk", password: "123456", name: "Sathsarani Waduge", role: "student", current_year: 2, current_semester: 1, avatar_url: null, created_at: "2026-03-04T03:33:46.281Z", updated_at: "2026-03-04T03:33:46.845Z" },
  ];

  const modules: Module[] = [
    { id: "a1b2c3d4-0001-4000-8000-000000000001", module_code: "IT1010", module_name: "Introduction to Programming", year: 1, semester: 1, created_at: "2026-03-04T03:39:04.159Z" },
    { id: "a1b2c3d4-0002-4000-8000-000000000002", module_code: "IT1020", module_name: "Computer Organization", year: 1, semester: 1, created_at: "2026-03-04T03:39:04.159Z" },
    { id: "a1b2c3d4-0008-4000-8000-000000000008", module_code: "IT1030", module_name: "Mathematics for Computing", year: 1, semester: 2, created_at: "2026-03-04T03:39:04.159Z" },
    { id: "a1b2c3d4-0003-4000-8000-000000000003", module_code: "IT2030", module_name: "Data Structures & Algorithms", year: 2, semester: 1, created_at: "2026-03-04T03:39:04.159Z" },
    { id: "a1b2c3d4-0004-4000-8000-000000000004", module_code: "IT2040", module_name: "Object Oriented Programming", year: 2, semester: 1, created_at: "2026-03-04T03:39:04.159Z" },
    { id: "a1b2c3d4-0007-4000-8000-000000000007", module_code: "IT2050", module_name: "Web Application Development", year: 2, semester: 2, created_at: "2026-03-04T03:39:04.159Z" },
    { id: "a1b2c3d4-0005-4000-8000-000000000005", module_code: "IT3050", module_name: "Database Management Systems", year: 3, semester: 1, created_at: "2026-03-04T03:39:04.159Z" },
    { id: "a1b2c3d4-0006-4000-8000-000000000006", module_code: "IT3060", module_name: "Software Engineering", year: 3, semester: 2, created_at: "2026-03-04T03:39:04.159Z" },
  ];

  const student_modules: StudentModule[] = [
    { id: uuid(), student_id: studentId, module_id: "a1b2c3d4-0001-4000-8000-000000000001", enrolled_semester: "2025-S1", created_at: "2026-03-04T03:39:11.519Z" },
    { id: uuid(), student_id: studentId, module_id: "a1b2c3d4-0003-4000-8000-000000000003", enrolled_semester: "2025-S1", created_at: "2026-03-04T03:39:11.519Z" },
    { id: uuid(), student_id: studentId, module_id: "a1b2c3d4-0004-4000-8000-000000000004", enrolled_semester: "2025-S1", created_at: "2026-03-04T03:39:11.519Z" },
    { id: uuid(), student_id: studentId, module_id: "a1b2c3d4-0007-4000-8000-000000000007", enrolled_semester: "2025-S2", created_at: "2026-03-04T03:39:11.519Z" },
  ];

  const kuppi_notices: KuppiNotice[] = [
    { id: "b1000001-0001-4000-8000-000000000001", title: "Data Structures Revision Kuppi", module_id: "a1b2c3d4-0003-4000-8000-000000000003", description: "Covering linked lists, stacks, and queues. Bring your laptops for coding exercises.", google_form_url: null, created_by: org2Id, created_at: "2026-03-04T03:39:27.930Z" },
    { id: "b1000001-0002-4000-8000-000000000002", title: "OOP Concepts Deep Dive", module_id: "a1b2c3d4-0004-4000-8000-000000000004", description: "Inheritance, polymorphism, abstraction. Hands-on Java examples.", google_form_url: null, created_by: org2Id, created_at: "2026-03-04T03:39:27.930Z" },
    { id: "b1000001-0003-4000-8000-000000000003", title: "Intro to Programming - Final Prep", module_id: "a1b2c3d4-0001-4000-8000-000000000001", description: "Last-minute revision for the IT1010 final exam. Focus on loops and functions.", google_form_url: null, created_by: orgId, created_at: "2026-03-04T03:39:27.930Z" },
    { id: "b1000001-0004-4000-8000-000000000004", title: "DBMS Normalization Kuppi", module_id: "a1b2c3d4-0005-4000-8000-000000000005", description: "1NF, 2NF, 3NF with examples and past paper discussion.", google_form_url: null, created_by: org2Id, created_at: "2026-03-04T03:39:27.930Z" },
    { id: "b1000001-0005-4000-8000-000000000005", title: "Web Dev - React Basics", module_id: "a1b2c3d4-0007-4000-8000-000000000007", description: "Introduction to React components, hooks, and state management.", google_form_url: null, created_by: orgId, created_at: "2026-03-04T03:39:27.930Z" },
    { id: "b1000001-0006-4000-8000-000000000006", title: "Computer Organization - CPU Architecture", module_id: "a1b2c3d4-0002-4000-8000-000000000002", description: "Understanding CPU pipeline, registers, and instruction sets.", google_form_url: null, created_by: orgId, created_at: "2026-03-04T03:39:27.930Z" },
  ];

  const kuppi_registrations: KuppiRegistration[] = [
    { id: uuid(), notice_id: "b1000001-0001-4000-8000-000000000001", student_id: studentId, student_name: "Sathsarani Waduge", student_email: "sathsarani@sliit.lk", registered_at: "2026-03-05T10:00:00Z" },
    { id: uuid(), notice_id: "b1000001-0003-4000-8000-000000000003", student_id: studentId, student_name: "Sathsarani Waduge", student_email: "sathsarani@sliit.lk", registered_at: "2026-03-05T11:00:00Z" },
    { id: uuid(), notice_id: "b1000001-0005-4000-8000-000000000005", student_id: studentId, student_name: "Sathsarani Waduge", student_email: "sathsarani@sliit.lk", registered_at: "2026-03-05T12:00:00Z" },
  ];

  const kuppi_sessions: KuppiSession[] = [
    { id: "c1000001-0001-4000-8000-000000000001", notice_id: "b1000001-0001-4000-8000-000000000001", session_date: "2026-03-10", session_time: "14:00", platform: "Zoom", meeting_link: "https://zoom.us/j/111222333", covered_parts: "Linked Lists, Stacks", organizer_id: org2Id, reminder_sent: false, meeting_room_url: null, meeting_room_name: null, recording_status: "none", created_at: "2026-03-04T03:39:46.344Z" },
    { id: "c1000001-0002-4000-8000-000000000002", notice_id: "b1000001-0002-4000-8000-000000000002", session_date: "2026-03-12", session_time: "10:00", platform: "Google Meet", meeting_link: "https://meet.google.com/abc-defg-hij", covered_parts: "Inheritance, Polymorphism", organizer_id: org2Id, reminder_sent: false, meeting_room_url: null, meeting_room_name: null, recording_status: "none", created_at: "2026-03-04T03:39:46.344Z" },
    { id: "c1000001-0003-4000-8000-000000000003", notice_id: "b1000001-0002-4000-8000-000000000002", session_date: "2026-03-15", session_time: "16:00", platform: "Zoom", meeting_link: "https://zoom.us/j/444555666", covered_parts: "Abstraction, Encapsulation", organizer_id: org2Id, reminder_sent: false, meeting_room_url: null, meeting_room_name: null, recording_status: "none", created_at: "2026-03-04T03:39:46.344Z" },
    { id: "c1000001-0004-4000-8000-000000000004", notice_id: "b1000001-0003-4000-8000-000000000003", session_date: "2026-03-08", session_time: "09:00", platform: "MS Teams", meeting_link: "https://teams.microsoft.com/l/meetup/123", covered_parts: "Loops, Functions, Arrays", organizer_id: orgId, reminder_sent: false, meeting_room_url: null, meeting_room_name: null, recording_status: "none", created_at: "2026-03-04T03:39:46.344Z" },
    { id: "c1000001-0005-4000-8000-000000000005", notice_id: "b1000001-0005-4000-8000-000000000005", session_date: "2026-03-20", session_time: "15:00", platform: "Zoom", meeting_link: "https://zoom.us/j/111222333", covered_parts: "React Components, JSX", organizer_id: orgId, reminder_sent: false, meeting_room_url: "/meeting?room=kuppi-c1000001&host=true", meeting_room_name: "kuppi-c1000001", recording_status: "none", created_at: "2026-03-04T03:39:46.344Z" },
  ];

  const kuppi_recordings: KuppiRecording[] = [
    { id: uuid(), session_id: "c1000001-0001-4000-8000-000000000001", title: "DSA Kuppi - Linked Lists & Stacks", file_url: "https://example.com/recordings/dsa-part1.mp4", uploaded_at: "2026-03-04T03:39:46.344Z" },
    { id: uuid(), session_id: "c1000001-0003-4000-8000-000000000003", title: "OOP - Inheritance & Polymorphism", file_url: "https://example.com/recordings/oop-session1.mp4", uploaded_at: "2026-03-04T03:39:46.344Z" },
    { id: uuid(), session_id: "c1000001-0004-4000-8000-000000000004", title: "Intro Programming - Final Prep Recording", file_url: "https://example.com/recordings/it1010-final.mp4", uploaded_at: "2026-03-04T03:39:46.344Z" },
  ];

  const kuppi_feedback: KuppiFeedback[] = [
    { id: uuid(), session_id: "c1000001-0001-4000-8000-000000000001", student_id: studentId, comment: "Very helpful session, loved the coding examples!", rating: 5, created_at: "2026-03-11T10:00:00Z" },
    { id: uuid(), session_id: "c1000001-0004-4000-8000-000000000004", student_id: studentId, comment: "Good revision but could use more practice problems.", rating: 4, created_at: "2026-03-09T15:00:00Z" },
  ];

  return { users, modules, student_modules, kuppi_notices, kuppi_registrations, kuppi_sessions, kuppi_recordings, kuppi_feedback };
}

// ============= Store singleton =============
let _db: MockDB | null = null;

function loadDB(): MockDB {
  if (_db) return _db;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      _db = JSON.parse(stored);
      return _db!;
    }
  } catch { /* ignore */ }
  _db = createSeedData();
  saveDB();
  return _db;
}

function saveDB() {
  if (_db) localStorage.setItem(STORAGE_KEY, JSON.stringify(_db));
}

export function resetDB() {
  _db = createSeedData();
  saveDB();
}

export function getDB(): MockDB {
  return loadDB();
}

// ============= Generic CRUD helpers =============
type CollectionName = keyof MockDB;

export function getAll<T>(collection: CollectionName): T[] {
  return [...(loadDB()[collection] as unknown as T[])];
}

export function getById<T extends { id: string }>(collection: CollectionName, id: string): T | undefined {
  return (loadDB()[collection] as unknown as T[]).find((item) => item.id === id);
}

export function query<T>(collection: CollectionName, predicate: (item: T) => boolean): T[] {
  return (loadDB()[collection] as unknown as T[]).filter(predicate);
}

export function insert<T extends { id?: string }>(collection: CollectionName, item: Omit<T, "id"> & { id?: string }): T {
  const db = loadDB();
  const newItem = { ...item, id: item.id || uuid() } as T;
  (db[collection] as unknown as T[]).push(newItem);
  saveDB();
  return newItem;
}

export function update<T extends { id: string }>(collection: CollectionName, id: string, updates: Partial<T>): T | undefined {
  const db = loadDB();
  const arr = db[collection] as unknown as T[];
  const idx = arr.findIndex((item) => item.id === id);
  if (idx === -1) return undefined;
  arr[idx] = { ...arr[idx], ...updates };
  saveDB();
  return arr[idx];
}

export function remove(collection: CollectionName, id: string): boolean {
  const db = loadDB();
  const arr = db[collection] as unknown as { id: string }[];
  const idx = arr.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  arr.splice(idx, 1);
  saveDB();
  return true;
}

export function count(collection: CollectionName, predicate?: (item: any) => boolean): number {
  const arr = loadDB()[collection] as unknown as any[];
  return predicate ? arr.filter(predicate).length : arr.length;
}

// ============= Auth helpers =============
const AUTH_KEY = "uniflow_mock_auth";

export function mockSignIn(email: string, password: string): User {
  const db = loadDB();
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid login credentials");
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function mockSignUp(email: string, password: string, name: string, role: "student" | "organizer"): User {
  const db = loadDB();
  if (db.users.find((u) => u.email === email)) throw new Error("User already registered");
  const newUser: User = {
    id: uuid(),
    email,
    password,
    name,
    role,
    current_year: null,
    current_semester: null,
    avatar_url: null,
    created_at: now(),
    updated_at: now(),
  };
  db.users.push(newUser);
  saveDB();
  localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  return newUser;
}

export function mockSignOut() {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// ============= Relationship helpers =============
export function getModuleById(id: string): Module | undefined {
  return getById<Module>("modules", id);
}

export function getNoticeWithModule(noticeId: string) {
  const notice = getById<KuppiNotice>("kuppi_notices", noticeId);
  if (!notice) return null;
  const mod = getModuleById(notice.module_id);
  return { ...notice, modules: mod ? { module_code: mod.module_code, module_name: mod.module_name, year: mod.year, semester: mod.semester } : null };
}

export function getSessionWithRelations(sessionId: string) {
  const session = getById<KuppiSession>("kuppi_sessions", sessionId);
  if (!session) return null;
  const notice = getById<KuppiNotice>("kuppi_notices", session.notice_id);
  const mod = notice ? getModuleById(notice.module_id) : null;
  const recordings = query<KuppiRecording>("kuppi_recordings", (r) => r.session_id === sessionId);
  return {
    ...session,
    kuppi_notices: notice ? {
      title: notice.title,
      modules: mod ? { module_code: mod.module_code, module_name: mod.module_name } : null,
    } : null,
    kuppi_recordings: recordings,
  };
}
