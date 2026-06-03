"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartInstance } from "chart.js";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Database,
  Dumbbell,
  FileUp,
  Folder,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  Smartphone,
  Target,
  Trash2,
  Users,
  Watch,
  X,
} from "lucide-react";
import { Badge as CatalystBadge } from "@/components/catalyst/badge";
import { Button } from "@/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from "@/components/catalyst/dialog";
import { Input } from "@/components/catalyst/input";
import {
  ExercisePrescription,
  Phase,
  Program,
  RoleplayScenario,
  WorkoutTemplate,
  prTrend,
  roleplayRubric,
  roleplayScenarios,
  scheduledSessions,
  seedProgram,
  strongReferenceSummary,
  trainingMethods,
} from "@/lib/protocol";

const storageKey = "gym-roleplay-training-program";

type SessionLog = Record<
  string,
  {
    weight: string;
    reps: string;
    completed: boolean;
  }
>;

type CalendarCell = {
  iso: string;
  day: number;
  inMonth: boolean;
  status?: "planned" | "completed" | "missed" | "moved";
  name?: string;
};

type TemplateDraft = {
  name: string;
  day: string;
  focus: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function bumpRevision(program: Program): Program {
  return {
    ...program,
    revision: `web-r${Date.now().toString().slice(-8)}`,
    updatedAt: new Date().toISOString(),
  };
}

function formatStamp(iso: string) {
  return iso.slice(0, 16).replace("T", " ");
}

function makeMonthGrid(year: number, monthIndex: number): CalendarCell[] {
  const firstDay = new Date(year, monthIndex, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const firstCell = new Date(year, monthIndex, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCell);
    date.setDate(firstCell.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const session = scheduledSessions.find((item) => item.date === iso);

    return {
      iso,
      day: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
      status: session?.status,
      name: session?.name,
    };
  });
}

function defaultExercise(): ExercisePrescription {
  return {
    id: `ex-${Date.now()}`,
    name: "New Exercise",
    sets: 3,
    reps: "8-12",
    rest: "2 min",
    method: "Straight Sets",
    optional: false,
    notes: "Define intent, progression, and substitution rules.",
  };
}

function criterionKey(scenarioId: string, index: number) {
  return `${scenarioId}-${index}`;
}

function Badge({
  children,
  tone = "zinc",
}: {
  children: React.ReactNode;
  tone?: "red" | "emerald" | "amber" | "zinc" | "blue";
}) {
  return <CatalystBadge color={tone}>{children}</CatalystBadge>;
}

function SectionTitle({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-xl font-semibold leading-7 text-zinc-950">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
    </label>
  );
}

function MetricStrip() {
  const metrics = [
    ["Strong sessions", strongReferenceSummary.sessions.toString()],
    ["Exercise names", strongReferenceSummary.exercises.toString()],
    ["Workout names", strongReferenceSummary.workoutNames.toString()],
    ["Sync format", "v1 packet"],
  ];

  return (
    <dl className="grid gap-px overflow-hidden rounded-lg bg-zinc-200 ring-1 ring-zinc-200 md:grid-cols-4">
      {metrics.map(([label, value]) => (
        <div key={label} className="bg-white px-5 py-4">
          <dt className="text-xs font-medium uppercase tracking-normal text-zinc-500">
            {label}
          </dt>
          <dd className="mt-2 text-2xl font-semibold leading-none text-zinc-950">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function RoleplayLab({
  scenarios,
  selectedScenario,
  linkedWorkoutName,
  checkedCriteria,
  response,
  completedRuns,
  onSelectScenario,
  onToggleCriterion,
  onResponseChange,
  onCompleteRun,
  onResetRun,
}: {
  scenarios: RoleplayScenario[];
  selectedScenario: RoleplayScenario;
  linkedWorkoutName: string;
  checkedCriteria: Record<string, boolean>;
  response: string;
  completedRuns: number;
  onSelectScenario: (id: string) => void;
  onToggleCriterion: (key: string) => void;
  onResponseChange: (value: string) => void;
  onCompleteRun: () => void;
  onResetRun: () => void;
}) {
  const completedCriteria = selectedScenario.successCriteria.filter(
    (_, index) => checkedCriteria[criterionKey(selectedScenario.id, index)],
  ).length;
  const readinessScore = Math.min(
    100,
    Math.round(
      (completedCriteria / selectedScenario.successCriteria.length) * 70 +
        (response.trim().length > 0 ? 30 : 0),
    ),
  );

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
      <SectionTitle
        title="Gym roleplay training"
        eyebrow="Coach practice lab"
        action={<Badge tone="emerald">{completedRuns} completed runs</Badge>}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="space-y-3">
          <p className="text-sm font-semibold text-zinc-950">Scenario deck</p>
          {scenarios.map((scenario) => {
            const active = scenario.id === selectedScenario.id;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onSelectScenario(scenario.id)}
                className={cx(
                  "w-full rounded-lg border p-4 text-left transition",
                  active
                    ? "border-red-200 bg-red-50"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-zinc-950">
                    {scenario.title}
                  </span>
                  <Badge
                    tone={
                      scenario.difficulty === "Performance"
                        ? "red"
                        : scenario.difficulty === "Retention"
                          ? "amber"
                          : "blue"
                    }
                  >
                    {scenario.difficulty}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  {scenario.audience}
                </p>
              </button>
            );
          })}
        </aside>

        <div className="space-y-5">
          <div className="rounded-lg border border-zinc-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold leading-8 text-zinc-950">
                  {selectedScenario.title}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                  {selectedScenario.situation}
                </p>
              </div>
              <Badge tone="zinc">Template {linkedWorkoutName}</Badge>
            </div>

            <div className="mt-5 rounded-lg bg-zinc-950 p-4 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4 text-red-300" aria-hidden="true" />
                Member opening line
              </div>
              <p className="mt-3 text-base leading-7 text-zinc-100">
                &quot;{selectedScenario.openingLine}&quot;
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                  <Target className="size-4 text-red-600" aria-hidden="true" />
                  Coach objective
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {selectedScenario.coachObjective}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                  <Users className="size-4 text-blue-600" aria-hidden="true" />
                  Member signals
                </div>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-600">
                  {selectedScenario.memberSignals.map((signal) => (
                    <li key={signal} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 p-5">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-950">
                Coach response
              </span>
              <textarea
                value={response}
                onChange={(event) => onResponseChange(event.target.value)}
                rows={6}
                placeholder="Write the exact words the coach says next."
                className="mt-3 w-full resize-y rounded-lg border-0 px-4 py-3 text-sm leading-6 text-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-300 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-red-500"
              />
            </label>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-lg font-semibold text-red-700 ring-1 ring-red-600/15">
                  {readinessScore}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">
                    Practice score
                  </p>
                  <p className="text-xs text-zinc-500">
                    {completedCriteria}/{selectedScenario.successCriteria.length} criteria checked
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onResetRun} outline>
                  <RotateCcw data-slot="icon" aria-hidden="true" />
                  Reset
                </Button>
                <Button type="button" onClick={onCompleteRun} color="red">
                  <ShieldCheck data-slot="icon" aria-hidden="true" />
                  Complete run
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-zinc-200 p-5">
            <p className="text-sm font-semibold text-zinc-950">
              Success checklist
            </p>
            <div className="mt-4 space-y-3">
              {selectedScenario.successCriteria.map((criterion, index) => {
                const key = criterionKey(selectedScenario.id, index);

                return (
                  <label
                    key={criterion}
                    className="flex cursor-pointer gap-3 rounded-lg border border-zinc-200 p-3 text-sm leading-6 text-zinc-700 hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedCriteria[key])}
                      onChange={() => onToggleCriterion(key)}
                      className="mt-1 size-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                    />
                    <span>{criterion}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 p-5">
            <p className="text-sm font-semibold text-zinc-950">Coach cues</p>
            <div className="mt-4 space-y-3">
              {selectedScenario.coachCues.map((cue) => (
                <div key={cue} className="flex gap-3 text-sm leading-6 text-zinc-700">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  {cue}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900 ring-1 ring-amber-600/20">
              {selectedScenario.rescueLine}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 p-5">
            <p className="text-sm font-semibold text-zinc-950">Rubric</p>
            <dl className="mt-4 space-y-3">
              {roleplayRubric.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-semibold uppercase tracking-normal text-zinc-500">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-zinc-700">
                    {item.target}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CalendarPanel() {
  const cells = useMemo(() => makeMonthGrid(2026, 4), []);
  const completedCount = scheduledSessions.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
      <SectionTitle
        title="May 2026"
        eyebrow="Dashboard"
        action={<Badge tone="red">{completedCount} workout days</Badge>}
      />
      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-zinc-500">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div key={`${day}-${index}`} className="pb-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-lg ring-1 ring-zinc-200">
            {cells.map((cell) => (
              <div
                key={cell.iso}
                className={cx(
                  "min-h-24 border-r border-b border-zinc-200 p-3 last:border-r-0",
                  !cell.inMonth && "bg-zinc-50 text-zinc-300",
                  cell.status === "completed" && "bg-red-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cx(
                      "flex size-7 items-center justify-center rounded-full text-sm font-medium",
                      cell.status === "completed"
                        ? "bg-red-600 text-white"
                        : cell.inMonth
                          ? "text-zinc-900"
                          : "text-zinc-300",
                    )}
                  >
                    {cell.day}
                  </span>
                  {cell.status === "planned" ? (
                    <CircleDot
                      className="size-4 text-blue-500"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                {cell.name ? (
                  <p
                    className={cx(
                      "mt-4 truncate text-xs font-medium",
                      cell.status === "completed"
                        ? "text-red-800"
                        : "text-zinc-600",
                    )}
                  >
                    {cell.name}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <p className="text-sm font-semibold text-zinc-950">
              Next planned session
            </p>
            <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">
              Workout B
            </p>
            <p className="mt-2 text-sm text-zinc-600">May 14, Phase 1</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 ring-1 ring-red-600/15">
            <p className="text-sm font-semibold text-red-950">Phase review</p>
            <p className="mt-2 text-sm leading-6 text-red-800">
              Review week 3 after May 25 before advancing, repeating, or
              deloading.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-red-600" />
              Completed
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" />
              Planned
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function TemplateFolders({
  phases,
  selectedPhaseId,
  selectedWorkoutId,
  onSelectPhase,
  onSelectWorkout,
  onAddTemplate,
}: {
  phases: Phase[];
  selectedPhaseId: string;
  selectedWorkoutId: string;
  onSelectPhase: (id: string) => void;
  onSelectWorkout: (id: string) => void;
  onAddTemplate: (phaseId: string) => void;
}) {
  return (
    <section className="space-y-6">
      <SectionTitle title="Program folders" eyebrow="Templates by phase" />
      <div className="grid gap-5 xl:grid-cols-3">
        {phases.map((phase) => {
          const active = phase.id === selectedPhaseId;

          return (
            <div
              key={phase.id}
              className={cx(
                "rounded-lg bg-white p-5 shadow-sm ring-1 transition",
                active ? "ring-red-200" : "ring-zinc-950/5",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectPhase(phase.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                <div
                  className={cx(
                    "flex size-10 items-center justify-center rounded-md",
                    active ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-500",
                  )}
                >
                  <Folder className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-zinc-950">{phase.name}</p>
                    <Badge
                      tone={
                        phase.status === "active"
                          ? "red"
                          : phase.status === "next"
                            ? "blue"
                            : "zinc"
                      }
                    >
                      {phase.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{phase.weeks}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {phase.goal}
                  </p>
                </div>
              </button>

              <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4">
                {phase.workouts.map((workout) => (
                  <button
                    key={workout.id}
                    type="button"
                    onClick={() => {
                      onSelectPhase(phase.id);
                      onSelectWorkout(workout.id);
                    }}
                    className={cx(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",
                      workout.id === selectedWorkoutId
                        ? "bg-zinc-950 text-white"
                        : "text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    <span>
                      <span className="block font-medium">{workout.name}</span>
                      <span
                        className={cx(
                          "mt-0.5 block text-xs",
                          workout.id === selectedWorkoutId
                            ? "text-zinc-300"
                            : "text-zinc-500",
                        )}
                      >
                        {workout.scheduledDay} · {workout.exercises.length}{" "}
                        exercises
                      </span>
                    </span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                ))}
                <Button
                  type="button"
                  onClick={() => onAddTemplate(phase.id)}
                  outline
                  className="mt-3"
                >
                  <Plus data-slot="icon" aria-hidden="true" />
                  Add template
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AddTemplateModal({
  open,
  phase,
  draft,
  onClose,
  onChange,
  onCreate,
}: {
  open: boolean;
  phase: Phase;
  draft: TemplateDraft;
  onClose: () => void;
  onChange: (draft: TemplateDraft) => void;
  onCreate: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} size="xl">
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
              {phase.name}
            </p>
            <DialogTitle className="mt-2 text-xl">
              Add workout template
            </DialogTitle>
          </div>
          <Button
            type="button"
            onClick={onClose}
            plain
            className="-mr-2 -mt-2"
            aria-label="Close"
          >
            <X data-slot="icon" aria-hidden="true" />
          </Button>
        </div>
        <DialogBody className="space-y-4">
          <TextInput
            label="Template name"
            value={draft.name}
            placeholder="Workout C"
            onChange={(name) => onChange({ ...draft, name })}
          />
          <TextInput
            label="Scheduled day"
            value={draft.day}
            placeholder="Saturday"
            onChange={(day) => onChange({ ...draft, day })}
          />
          <TextInput
            label="Focus"
            value={draft.focus}
            placeholder="Upper volume + calves"
            onChange={(focus) => onChange({ ...draft, focus })}
          />
        </DialogBody>
        <DialogActions>
          <Button
            type="button"
            onClick={onClose}
            plain
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onCreate}
            color="dark"
          >
            Create template
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}

function StrongStyleChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartInstance | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvas, {
      type: "line",
      data: {
        labels: prTrend.map((point) => point.label),
        datasets: [
          {
            label: "Incline Bench",
            data: prTrend.map((point) => point.incline),
            borderColor: "#dc2626",
            backgroundColor: "#dc2626",
            tension: 0.32,
            spanGaps: true,
            pointRadius: 4,
            pointHoverRadius: 5,
          },
          {
            label: "Squat",
            data: prTrend.map((point) => point.squat),
            borderColor: "#059669",
            backgroundColor: "#059669",
            tension: 0.32,
            spanGaps: true,
            pointRadius: 4,
            pointHoverRadius: 5,
          },
          {
            label: "Deadlift",
            data: prTrend.map((point) => point.deadlift),
            borderColor: "#2563eb",
            backgroundColor: "#2563eb",
            tension: 0.32,
            spanGaps: true,
            pointRadius: 4,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: {
            position: "bottom",
            align: "start",
            labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true },
          },
          tooltip: {
            backgroundColor: "#18181b",
            padding: 12,
            titleColor: "#fafafa",
            bodyColor: "#fafafa",
            displayColors: true,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#71717a" },
            border: { display: false },
          },
          y: {
            grid: { color: "#e4e4e7" },
            ticks: { color: "#71717a" },
            border: { display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
      <SectionTitle
        title="PR graph"
        eyebrow="Chart.js prototype"
        action={<Badge tone="emerald">Strong-style history</Badge>}
      />
      <div className="mt-8 h-80">
        <canvas ref={canvasRef} aria-label="Personal record trend chart" />
      </div>
    </section>
  );
}

function ExerciseEditor({
  workout,
  onUpdate,
  onAdd,
  onRemove,
}: {
  workout: WorkoutTemplate;
  onUpdate: (exerciseId: string, patch: Partial<ExercisePrescription>) => void;
  onAdd: () => void;
  onRemove: (exerciseId: string) => void;
}) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
      <SectionTitle
        title={`${workout.name} template`}
        eyebrow={workout.focus}
        action={
          <Button
            type="button"
            onClick={onAdd}
            color="dark"
          >
            <Plus data-slot="icon" aria-hidden="true" />
            Add exercise
          </Button>
        }
      />
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead>
            <tr>
              {["Exercise", "Sets", "Reps", "Rest", "Method", "Optional", ""].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-normal text-zinc-500"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {workout.exercises.map((exercise) => (
              <tr key={exercise.id}>
                <td className="min-w-72 px-3 py-4 align-top">
                  <input
                    value={exercise.name}
                    onChange={(event) =>
                      onUpdate(exercise.id, { name: event.target.value })
                    }
                    className="w-full rounded-md border-0 px-3 py-2 text-sm font-medium text-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-300 outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                  />
                  <textarea
                    value={exercise.notes}
                    onChange={(event) =>
                      onUpdate(exercise.id, { notes: event.target.value })
                    }
                    rows={2}
                    className="mt-2 w-full rounded-md border-0 px-3 py-2 text-xs leading-5 text-zinc-700 shadow-sm ring-1 ring-inset ring-zinc-200 outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                  />
                </td>
                <td className="w-24 px-3 py-4 align-top">
                  <input
                    type="number"
                    min={1}
                    value={exercise.sets}
                    onChange={(event) =>
                      onUpdate(exercise.id, {
                        sets: Number(event.target.value) || 1,
                      })
                    }
                    className="w-20 rounded-md border-0 px-3 py-2 text-sm text-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-300 outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                  />
                </td>
                <td className="w-36 px-3 py-4 align-top">
                  <input
                    value={exercise.reps}
                    onChange={(event) =>
                      onUpdate(exercise.id, { reps: event.target.value })
                    }
                    className="w-32 rounded-md border-0 px-3 py-2 text-sm text-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-300 outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                  />
                </td>
                <td className="w-32 px-3 py-4 align-top">
                  <input
                    value={exercise.rest}
                    onChange={(event) =>
                      onUpdate(exercise.id, { rest: event.target.value })
                    }
                    className="w-28 rounded-md border-0 px-3 py-2 text-sm text-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-300 outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                  />
                </td>
                <td className="w-56 px-3 py-4 align-top">
                  <select
                    value={exercise.method}
                    onChange={(event) =>
                      onUpdate(exercise.id, {
                        method: event.target
                          .value as ExercisePrescription["method"],
                      })
                    }
                    className="w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-300 outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                  >
                    {trainingMethods.map((method) => (
                      <option key={method}>{method}</option>
                    ))}
                  </select>
                </td>
                <td className="w-28 px-3 py-4 align-top">
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={exercise.optional}
                      onChange={(event) =>
                        onUpdate(exercise.id, {
                          optional: event.target.checked,
                        })
                      }
                      className="size-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                    />
                    Optional
                  </label>
                </td>
                <td className="w-16 px-3 py-4 align-top">
                  <button
                    type="button"
                    onClick={() => onRemove(exercise.id)}
                    className="rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${exercise.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WorkoutRunner({
  workout,
  sessionLog,
  onLog,
}: {
  workout: WorkoutTemplate;
  sessionLog: SessionLog;
  onLog: (exerciseId: string, patch: Partial<SessionLog[string]>) => void;
}) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
      <SectionTitle
        title="Run template"
        eyebrow="Prescribed vs actual"
        action={<Badge tone="amber">Web execution MVP</Badge>}
      />
      <div className="mt-6 space-y-4">
        {workout.exercises.map((exercise) => {
          const log = sessionLog[exercise.id] ?? {
            weight: "",
            reps: "",
            completed: false,
          };

          return (
            <div
              key={exercise.id}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-6 text-zinc-950">
                    {exercise.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={exercise.optional ? "zinc" : "red"}>
                      {exercise.optional ? "optional" : "required"}
                    </Badge>
                    <Badge tone="blue">{exercise.method}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {exercise.sets} sets x {exercise.reps} reps, rest{" "}
                    {exercise.rest}
                  </p>
                </div>
                <label className="inline-flex shrink-0 items-center gap-2 pt-1 text-sm font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={log.completed}
                    onChange={(event) =>
                      onLog(exercise.id, { completed: event.target.checked })
                    }
                    className="size-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                  />
                  Done
                </label>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <TextInput
                  label="Weight"
                  value={log.weight}
                  placeholder="lb"
                  onChange={(weight) => onLog(exercise.id, { weight })}
                />
                <TextInput
                  label="Reps"
                  value={log.reps}
                  placeholder="actual"
                  onChange={(reps) => onLog(exercise.id, { reps })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TrainingMvp() {
  const [program, setProgram] = useState<Program>(seedProgram);
  const [hydrated, setHydrated] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState(
    seedProgram.phases[0].id,
  );
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(
    seedProgram.phases[0].workouts[0].id,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sessionLog, setSessionLog] = useState<SessionLog>({});
  const [importName, setImportName] = useState("No Strong export selected");
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    roleplayScenarios[0].id,
  );
  const [roleplayResponse, setRoleplayResponse] = useState("");
  const [roleplayChecks, setRoleplayChecks] = useState<Record<string, boolean>>(
    {},
  );
  const [completedRoleplays, setCompletedRoleplays] = useState(0);
  const [templateModalPhaseId, setTemplateModalPhaseId] = useState<
    string | null
  >(null);
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft>({
    name: "Workout C",
    day: "Saturday",
    focus: "Add the intent for this template",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(storageKey);

      if (stored) {
        try {
          setProgram(JSON.parse(stored) as Program);
        } catch {
          setProgram(seedProgram);
        }
      }

      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(program));
  }, [hydrated, program]);

  const selectedPhase =
    program.phases.find((phase) => phase.id === selectedPhaseId) ??
    program.phases[0];

  const selectedWorkout =
    selectedPhase.workouts.find((workout) => workout.id === selectedWorkoutId) ??
    selectedPhase.workouts[0];

  const selectedScenario =
    roleplayScenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    roleplayScenarios[0];

  const linkedScenarioWorkout =
    program.phases
      .flatMap((phase) => phase.workouts)
      .find((workout) => workout.id === selectedScenario.linkedWorkoutId) ??
    selectedWorkout;

  const modalPhase =
    program.phases.find((phase) => phase.id === templateModalPhaseId) ??
    selectedPhase;

  const completedLogged = selectedWorkout.exercises.filter(
    (exercise) => sessionLog[exercise.id]?.completed,
  ).length;

  const compiledPacket = useMemo(
    () => ({
      sessionPacketVersion: 1,
      programId: program.id,
      programRevisionId: program.revision,
      generatedFrom: "web-editor",
      scheduledSessionId: `scheduled-${selectedWorkout.id}-2026-05-14`,
      phase: {
        id: selectedPhase.id,
        name: selectedPhase.name,
        weeks: selectedPhase.weeks,
      },
      workout: {
        id: selectedWorkout.id,
        name: selectedWorkout.name,
        focus: selectedWorkout.focus,
      },
      targetDevices: ["phone", "watch"],
      exercises: selectedWorkout.exercises.map((exercise, index) => ({
        order: index + 1,
        id: exercise.id,
        name: exercise.name,
        required: !exercise.optional,
        prescription: {
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          method: exercise.method,
        },
      })),
    }),
    [program.id, program.revision, selectedPhase, selectedWorkout],
  );

  function updateProgramName(name: string) {
    setProgram((current) => bumpRevision({ ...current, name }));
  }

  function updatePhase(patch: Partial<Pick<Phase, "goal" | "reviewPrompt">>) {
    setProgram((current) =>
      bumpRevision({
        ...current,
        phases: current.phases.map((phase) =>
          phase.id === selectedPhase.id ? { ...phase, ...patch } : phase,
        ),
      }),
    );
  }

  function updateExercise(
    exerciseId: string,
    patch: Partial<ExercisePrescription>,
  ) {
    setProgram((current) =>
      bumpRevision({
        ...current,
        phases: current.phases.map((phase) => ({
          ...phase,
          workouts: phase.workouts.map((workout) =>
            workout.id === selectedWorkout.id
              ? {
                  ...workout,
                  exercises: workout.exercises.map((exercise) =>
                    exercise.id === exerciseId
                      ? { ...exercise, ...patch }
                      : exercise,
                  ),
                }
              : workout,
          ),
        })),
      }),
    );
  }

  function addExercise() {
    const exercise = defaultExercise();

    setProgram((current) =>
      bumpRevision({
        ...current,
        phases: current.phases.map((phase) => ({
          ...phase,
          workouts: phase.workouts.map((workout) =>
            workout.id === selectedWorkout.id
              ? { ...workout, exercises: [...workout.exercises, exercise] }
              : workout,
          ),
        })),
      }),
    );
  }

  function removeExercise(exerciseId: string) {
    setProgram((current) =>
      bumpRevision({
        ...current,
        phases: current.phases.map((phase) => ({
          ...phase,
          workouts: phase.workouts.map((workout) =>
            workout.id === selectedWorkout.id
              ? {
                  ...workout,
                  exercises: workout.exercises.filter(
                    (exercise) => exercise.id !== exerciseId,
                  ),
                }
              : workout,
          ),
        })),
      }),
    );
  }

  function createTemplate() {
    const phaseId = templateModalPhaseId;
    if (!phaseId) return;

    const template: WorkoutTemplate = {
      id: `workout-${Date.now()}`,
      name: templateDraft.name.trim() || "New Workout",
      scheduledDay: templateDraft.day.trim() || "Unscheduled",
      focus: templateDraft.focus.trim() || "Define this template's focus",
      exercises: [defaultExercise()],
    };

    setProgram((current) =>
      bumpRevision({
        ...current,
        phases: current.phases.map((phase) =>
          phase.id === phaseId
            ? { ...phase, workouts: [...phase.workouts, template] }
            : phase,
        ),
      }),
    );
    setSelectedPhaseId(phaseId);
    setSelectedWorkoutId(template.id);
    setTemplateModalPhaseId(null);
    setTemplateDraft({
      name: "Workout C",
      day: "Saturday",
      focus: "Add the intent for this template",
    });
  }

  function updateSessionLog(
    exerciseId: string,
    patch: Partial<SessionLog[string]>,
  ) {
    setSessionLog((current) => ({
      ...current,
      [exerciseId]: {
        weight: current[exerciseId]?.weight ?? "",
        reps: current[exerciseId]?.reps ?? "",
        completed: current[exerciseId]?.completed ?? false,
        ...patch,
      },
    }));
  }

  function selectScenario(scenarioId: string) {
    setSelectedScenarioId(scenarioId);
    setRoleplayResponse("");
    const scenario = roleplayScenarios.find((item) => item.id === scenarioId);
    const phaseWithWorkout = program.phases.find((phase) =>
      phase.workouts.some((workout) => workout.id === scenario?.linkedWorkoutId),
    );

    if (scenario && phaseWithWorkout) {
      setSelectedPhaseId(phaseWithWorkout.id);
      setSelectedWorkoutId(scenario.linkedWorkoutId);
    }
  }

  function toggleRoleplayCriterion(key: string) {
    setRoleplayChecks((current) => ({ ...current, [key]: !current[key] }));
  }

  function completeRoleplayRun() {
    setCompletedRoleplays((current) => current + 1);
  }

  function resetRoleplayRun() {
    setRoleplayResponse("");
    setRoleplayChecks((current) => {
      const next = { ...current };
      selectedScenario.successCriteria.forEach((_, index) => {
        delete next[criterionKey(selectedScenario.id, index)];
      });
      return next;
    });
  }

  const navigation = [
    { name: "Roleplay", icon: MessageSquare, current: true },
    { name: "Dashboard", icon: LayoutDashboard, current: false },
    { name: "Programs", icon: Dumbbell, current: false },
    { name: "Calendar", icon: CalendarDays, current: false },
    { name: "PR Graphs", icon: BarChart3, current: false },
    { name: "Sync", icon: RefreshCw, current: false },
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-white text-zinc-950 ring-1 ring-zinc-950/5">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
          <Dumbbell className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">Gym Roleplay</p>
          <p className="text-xs text-zinc-500">Coach training</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-3">
        {navigation.map((item) => (
          <a
            key={item.name}
            href="#"
            className={cx(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              item.current
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
            )}
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.name}
          </a>
        ))}
      </nav>
      <div className="p-5">
        <div className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-200">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-950">
            <Database className="size-4 text-emerald-600" aria-hidden="true" />
            Local save active
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Template edits produce versioned packets for later phone and Watch
            sync.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        {sidebar}
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-zinc-950/55"
          />
          <div className="relative h-full w-72 shadow-2xl">{sidebar}</div>
        </div>
      ) : null}

      <AddTemplateModal
        open={Boolean(templateModalPhaseId)}
        phase={modalPhase}
        draft={templateDraft}
        onClose={() => setTemplateModalPhaseId(null)}
        onChange={setTemplateDraft}
        onCreate={createTemplate}
      />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/95 backdrop-blur">
          <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
                Roleplay training surface
              </p>
              <h1 className="mt-1 truncate text-2xl font-semibold leading-8 text-zinc-950">
                Gym Roleplay Training
              </h1>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <Badge tone="emerald">Saved {formatStamp(program.updatedAt)}</Badge>
              <Button
                type="button"
                outline
              >
                <Settings data-slot="icon" aria-hidden="true" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-12 px-5 py-10 sm:px-8">
          <RoleplayLab
            scenarios={roleplayScenarios}
            selectedScenario={selectedScenario}
            linkedWorkoutName={linkedScenarioWorkout.name}
            checkedCriteria={roleplayChecks}
            response={roleplayResponse}
            completedRuns={completedRoleplays}
            onSelectScenario={selectScenario}
            onToggleCriterion={toggleRoleplayCriterion}
            onResponseChange={setRoleplayResponse}
            onCompleteRun={completeRoleplayRun}
            onResetRun={resetRoleplayRun}
          />

          <CalendarPanel />
          <MetricStrip />

          <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <TemplateFolders
                phases={program.phases}
                selectedPhaseId={selectedPhase.id}
                selectedWorkoutId={selectedWorkout.id}
                onSelectPhase={setSelectedPhaseId}
                onSelectWorkout={setSelectedWorkoutId}
                onAddTemplate={(phaseId) => {
                  setSelectedPhaseId(phaseId);
                  setTemplateModalPhaseId(phaseId);
                }}
              />
              <div className="grid gap-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 lg:grid-cols-2">
                <TextInput
                  label="Program name"
                  value={program.name}
                  onChange={updateProgramName}
                />
                <TextInput
                  label={`${selectedPhase.name} goal`}
                  value={selectedPhase.goal}
                  onChange={(goal) => updatePhase({ goal })}
                />
                <div className="lg:col-span-2">
                  <TextInput
                    label="Phase review reminder"
                    value={selectedPhase.reviewPrompt}
                    onChange={(reviewPrompt) => updatePhase({ reviewPrompt })}
                  />
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
                <SectionTitle
                  title="Selected template"
                  eyebrow="Current focus"
                  action={
                    <Badge tone="red">
                      {completedLogged}/{selectedWorkout.exercises.length} done
                    </Badge>
                  }
                />
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-3xl font-semibold leading-none text-zinc-950">
                      {selectedWorkout.name}
                    </p>
                    <p className="mt-2 text-sm text-zinc-600">
                      {selectedWorkout.scheduledDay} · {selectedWorkout.focus}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4 ring-1 ring-red-600/15">
                    <div className="flex gap-3">
                      <Clock3
                        className="mt-0.5 size-5 text-red-600"
                        aria-hidden="true"
                      />
                      <p className="text-sm leading-6 text-red-800">
                        Review this phase after week 3 before changing future
                        templates.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
                <SectionTitle
                  title="Strong import"
                  eyebrow="Reference loaded"
                  action={<Badge tone="emerald">CSV shape</Badge>}
                />
                <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center hover:border-red-300 hover:bg-red-50">
                  <FileUp className="size-8 text-zinc-500" aria-hidden="true" />
                  <span className="mt-3 text-sm font-semibold text-zinc-950">
                    Upload Strong export later
                  </span>
                  <span className="mt-1 text-xs text-zinc-600">{importName}</span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(event) =>
                      setImportName(
                        event.target.files?.[0]?.name ??
                          "No Strong export selected",
                      )
                    }
                  />
                </label>
                <dl className="mt-5 divide-y divide-zinc-100 rounded-lg bg-zinc-50 px-4 py-1">
                  {[
                    ["Rows", strongReferenceSummary.rows.toLocaleString()],
                    ["Sessions", strongReferenceSummary.sessions.toString()],
                    ["Exercises", strongReferenceSummary.exercises.toString()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-3">
                      <dt className="text-sm text-zinc-600">{label}</dt>
                      <dd className="text-sm font-semibold text-zinc-950">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </aside>
          </section>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <ExerciseEditor
              workout={selectedWorkout}
              onUpdate={updateExercise}
              onAdd={addExercise}
              onRemove={removeExercise}
            />
            <WorkoutRunner
              workout={selectedWorkout}
              sessionLog={sessionLog}
              onLog={updateSessionLog}
            />
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <StrongStyleChart />
            <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5">
              <SectionTitle
                title="Compiled session packet"
                eyebrow="Phone and Watch contract"
                action={
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="blue">
                      <Smartphone className="mr-1 size-3" aria-hidden="true" />
                      phone
                    </Badge>
                    <Badge tone="blue">
                      <Watch className="mr-1 size-3" aria-hidden="true" />
                      watch
                    </Badge>
                  </div>
                }
              />
              <pre className="mt-6 max-h-96 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
                {JSON.stringify(compiledPacket, null, 2)}
              </pre>
              <div className="mt-5 space-y-3">
                {[
                  "Program edits create a new revision id.",
                  "Phone and Watch receive flattened sessions, not the full editor state.",
                  "Workout history stays separate from future template edits.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-zinc-700">
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
