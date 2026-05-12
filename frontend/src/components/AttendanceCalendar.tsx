type AttendanceRecord = { date: string; status: "Present" | "Absent" };

export default function AttendanceCalendar({ records }: { records: AttendanceRecord[] }) {
  const map = new Map(records.map((r) => [r.date, r.status]));
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = new Date(year, month + 1, 0).getDate();

  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: days }).map((_, i) => {
        const day = i + 1;
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const status = map.get(date);
        const color = status === "Present" ? "bg-green-600 text-white" : status === "Absent" ? "bg-red-600 text-white" : "bg-[var(--surface-2)]";
        return (
          <div key={date} className={`rounded-lg p-2 text-center text-xs ${color}`}>
            <p>{day}</p>
            <p>{status || "-"}</p>
          </div>
        );
      })}
    </div>
  );
}
