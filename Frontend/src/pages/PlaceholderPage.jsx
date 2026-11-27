import { useParams } from "react-router-dom";

// Teammates replace this with their real page (Analyzing, Results, Detail, History, Settings)
export default function PlaceholderPage({ title }) {
  const params = useParams();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">This page is not built yet.</p>
      {Object.keys(params).length > 0 && (
        <pre className="mt-4 inline-block rounded-lg bg-white p-3 text-left text-xs text-gray-600">
          {JSON.stringify(params, null, 2)}
        </pre>
      )}
    </div>
  );
}
