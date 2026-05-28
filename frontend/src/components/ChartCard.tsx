interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, children }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 flex flex-col gap-3">
      <div>
        <h3 className="m-0 text-slate-100 text-sm font-semibold">{title}</h3>
        {subtitle && <p className="mt-1 text-slate-500 text-xs">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
