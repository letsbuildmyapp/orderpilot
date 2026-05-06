import { Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as any;
  return (
    <div className="container-edit py-32 text-center">
      <p className="eyebrow text-accent mb-6">500 · The grinder jammed</p>
      <h1 className="display-xl mb-6">
        Something <em className="italic">broke</em><br />between us.
      </h1>
      <p className="text-ink-mute max-w-md mx-auto mb-2">{error?.message || "An unexpected error occurred."}</p>
      <p className="text-xs text-ink-mute mb-10">{error?.statusText || ""}</p>
      <Link to="/" className="btn-primary">Back home</Link>
    </div>
  );
}
