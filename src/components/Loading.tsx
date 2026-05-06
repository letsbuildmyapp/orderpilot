export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-24 text-ink-mute">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-2 border-ink/20 border-t-accent rounded-full animate-spin" />
        <p className="eyebrow">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-24 max-w-md mx-auto">
      <p className="display-md mb-3">{title}</p>
      <p className="text-ink-mute mb-6">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="text-center py-24 max-w-md mx-auto">
      <p className="eyebrow text-accent mb-3">Something broke</p>
      <p className="display-md mb-3">We couldn't load this.</p>
      <p className="text-ink-mute mb-6">{message}</p>
      {retry && <button onClick={retry} className="btn-outline">Try again</button>}
    </div>
  );
}
