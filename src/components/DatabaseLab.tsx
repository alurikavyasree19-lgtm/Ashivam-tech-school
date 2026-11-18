import React, { useEffect, useState } from 'react';
import { Database, Play, Table, KeyRound, AlertCircle, BookOpen } from 'lucide-react';
import { DbSchemaResponse, DbSchemaTable } from '../types';

interface DatabaseLabProps {
  token: string;
}

const SQL_LESSONS: {
  title: string;
  concept: string;
  sql: string;
}[] = [
  {
    title: '01. INNER JOIN: Students & Tuition Ledger',
    concept: 'Combines rows from students and fees using the foreign key f.student_id = s.id.',
    sql: `SELECT s.roll_number, s.full_name, s.class_grade || '-' || s.section AS class_sec, f.total_amount, f.paid_amount, f.status
FROM students s
INNER JOIN fees f ON f.student_id = s.id
ORDER BY s.roll_number ASC
LIMIT 20;`
  },
  {
    title: '02. GROUP BY: Section Strength & Avg Attendance',
    concept: 'Aggregates students by grade and section using COUNT() and AVG().',
    sql: `SELECT class_grade || '-' || section AS class_section,
       COUNT(*) AS student_count,
       ROUND(AVG(attendance_percentage), 1) AS avg_attendance_pct
FROM students
GROUP BY class_grade, section
ORDER BY class_grade ASC, section ASC;`
  },
  {
    title: '03. WHERE + ORDER BY: Pending Fee Balances',
    concept: 'Filters unpaid/partial fee records and calculates remaining balance.',
    sql: `SELECT s.roll_number, s.full_name, f.class_section, f.total_amount, f.paid_amount,
       (f.total_amount - f.paid_amount) AS balance_due
FROM fees f
JOIN students s ON s.id = f.student_id
WHERE f.status = 'Pending'
ORDER BY balance_due DESC, s.roll_number ASC;`
  },
  {
    title: '04. Top Exam Scorers Across Grades',
    concept: 'Queries the results table ordered by marks_obtained descending.',
    sql: `SELECT r.student_name, r.class_section, r.subject, r.marks_obtained, r.max_marks, r.grade
FROM results r
ORDER BY r.marks_obtained DESC, r.student_name ASC
LIMIT 15;`
  },
  {
    title: '05. Faculty & Assigned Sections',
    concept: 'Inspects teacher directory records and their JSON assigned_classes column.',
    sql: `SELECT teacher_id, name, designation, subject, email, assigned_classes_json
FROM teachers
ORDER BY teacher_id ASC;`
  },
  {
    title: '06. Student Login Accounts Mapping',
    concept: 'Verifies how student emails map between users and students (password hashes masked).',
    sql: `SELECT u.email AS login_email, u.role, s.full_name, s.class_grade || '-' || s.section AS class_sec, u.password_hash
FROM users u
LEFT JOIN students s ON s.student_id = u.student_id
WHERE u.role = 'student'
ORDER BY s.roll_number ASC
LIMIT 20;`
  }
];

export default function DatabaseLab({ token }: DatabaseLabProps) {
  const [schema, setSchema] = useState<DbSchemaResponse | null>(null);
  const [selectedTable, setSelectedTable] = useState<DbSchemaTable | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState('');

  const [sqlText, setSqlText] = useState(SQL_LESSONS[0].sql);
  const [activeLessonConcept, setActiveLessonConcept] = useState(SQL_LESSONS[0].concept);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: Record<string, any>[];
    totalRows: number;
    truncated: boolean;
    durationMs: number;
  } | null>(null);

  useEffect(() => {
    loadSchema();
  }, [token]);

  const loadSchema = async () => {
    setSchemaLoading(true);
    setSchemaError('');
    try {
      const res = await fetch('/api/database/schema', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load database schema');
      setSchema(data);
      if (data.tables?.length > 0 && !selectedTable) {
        const defaultTbl = data.tables.find((t: DbSchemaTable) => t.name === 'students') || data.tables[0];
        setSelectedTable(defaultTbl);
      }
      await runSql(SQL_LESSONS[0].sql);
    } catch (err: any) {
      setSchemaError(err.message);
    } finally {
      setSchemaLoading(false);
    }
  };

  const runSql = async (sqlToRun: string) => {
    setQueryLoading(true);
    setQueryError('');
    try {
      const res = await fetch('/api/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sql: sqlToRun })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query execution failed');
      setQueryResult(data);
    } catch (err: any) {
      setQueryError(err.message);
      setQueryResult(null);
    } finally {
      setQueryLoading(false);
    }
  };

  const handlePreviewTable = (tableName: string) => {
    const previewSql = `SELECT * FROM ${tableName} LIMIT 15;`;
    setSqlText(previewSql);
    setActiveLessonConcept(`Inspecting live rows inside the "${tableName}" SQLite table.`);
    runSql(previewSql);
  };

  const totalRecords = schema?.tables.reduce((acc, t) => acc + t.rowCount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Database className="w-4 h-4" />
              <span>Relational SQLite Database & Learning Lab</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Live School Database Architecture & SQL Sandbox
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Explore all normalized relational tables backing this ERP, inspect foreign-key relationships, and practice read-only SQL queries directly against live school records.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs shrink-0">
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Engine</span>
              <span className="font-mono font-semibold text-slate-900">SQLite 3</span>
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Tables</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">{schema?.tables.length ?? '—'}</span>
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Total Rows</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">{totalRecords}</span>
            </div>
          </div>
        </div>

        {schema && (
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span>
              Storage file: <code className="font-mono text-slate-900">{schema.storagePath}</code>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Foreign Keys: <strong className="text-emerald-700">{schema.foreignKeysEnabled ? 'Enforced (ON DELETE CASCADE)' : 'Off'}</strong>
            </span>
          </div>
        )}
      </div>

      {schemaError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{schemaError}</span>
        </div>
      )}

      {/* Main Split: Schema Browser + Interactive SQL Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Schema Explorer */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-700" />
              <span>Database Tables</span>
            </h3>
            <span className="text-xs text-slate-500">Select to inspect schema</span>
          </div>

          {schemaLoading ? (
            <div className="p-6 text-xs text-slate-500">Loading SQLite schema...</div>
          ) : (
            <div className="divide-y divide-slate-200">
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5 bg-slate-50">
                {schema?.tables.map(tbl => {
                  const active = selectedTable?.name === tbl.name;
                  return (
                    <button
                      type="button"
                      key={tbl.name}
                      onClick={() => setSelectedTable(tbl)}
                      className={`px-3 py-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between border ${
                        active
                          ? 'bg-white border-blue-600 text-blue-800 font-semibold shadow-sm'
                          : 'bg-white/70 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-mono truncate">{tbl.name}</span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums ml-2">{tbl.rowCount}</span>
                    </button>
                  );
                })}
              </div>

              {selectedTable && (
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-mono text-sm font-bold text-slate-900">{selectedTable.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedTable.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePreviewTable(selectedTable.name)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap"
                    >
                      Preview Rows
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Column</th>
                          <th className="py-2 px-3 font-semibold">Type</th>
                          <th className="py-2 px-3 font-semibold">Constraints</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedTable.columns.map(col => (
                          <tr key={col.name} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-medium text-slate-900 flex items-center gap-1.5">
                              {col.primaryKey && <KeyRound className="w-3 h-3 text-amber-600 shrink-0" />}
                              <span>{col.name}</span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">{col.type}</td>
                            <td className="py-2 px-3 text-slate-500">
                              {[
                                col.primaryKey ? 'PK' : '',
                                col.notNull ? 'NOT NULL' : ''
                              ]
                                .filter(Boolean)
                                .join(' · ') || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedTable.foreignKeys.length > 0 && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <p className="font-semibold text-slate-800">Foreign Key Relationships</p>
                      {selectedTable.foreignKeys.map((fk, idx) => (
                        <p key={idx} className="font-mono text-[11px] text-slate-700">
                          {fk.from} → {fk.toTable}({fk.toColumn}) [ON DELETE {fk.onDelete}]
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Interactive SQL Learning Lab */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>SQL Query Practice Lab (Read-Only)</span>
            </h3>
            {queryResult && (
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {queryResult.totalRows} row{queryResult.totalRows === 1 ? '' : 's'} · {queryResult.durationMs} ms
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Guided Lessons */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">Guided SQL Examples</p>
              <div className="flex flex-wrap gap-1.5">
                {SQL_LESSONS.map(lesson => (
                  <button
                    type="button"
                    key={lesson.title}
                    onClick={() => {
                      setSqlText(lesson.sql);
                      setActiveLessonConcept(lesson.concept);
                      runSql(lesson.sql);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      sqlText.trim() === lesson.sql.trim()
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lesson.title}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600">{activeLessonConcept}</p>
            </div>

            {/* Editor */}
            <div className="space-y-2">
              <label htmlFor="sql-editor" className="sr-only">SQL Query Editor</label>
              <textarea
                id="sql-editor"
                rows={5}
                value={sqlText}
                onChange={e => setSqlText(e.target.value)}
                spellCheck={false}
                className="w-full p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">
                  Supports read-only SELECT, JOIN, GROUP BY, ORDER BY, and PRAGMA inspection queries.
                </p>
                <button
                  type="button"
                  disabled={queryLoading}
                  onClick={() => runSql(sqlText)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{queryLoading ? 'Running...' : 'Run SQL Query'}</span>
                </button>
              </div>
            </div>

            {queryError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-mono">{queryError}</span>
              </div>
            )}

            {/* Results Table */}
            {queryResult && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {queryResult.rows.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Query succeeded and returned 0 matching rows.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                          {queryResult.columns.map(col => (
                            <th key={col} className="py-2.5 px-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {queryResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {queryResult.columns.map(col => {
                              const val = row[col];
                              const isNum = typeof val === 'number';
                              return (
                                <td
                                  key={col}
                                  className={`py-2 px-3 text-slate-800 whitespace-nowrap ${
                                    isNum ? 'font-mono tabular-nums' : ''
                                  }`}
                                >
                                  {val === null || val === undefined ? <span className="text-slate-400">NULL</span> : String(val)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {queryResult.truncated && (
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
                    Showing first 100 of {queryResult.totalRows} rows.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
