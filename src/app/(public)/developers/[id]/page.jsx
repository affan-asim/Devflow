import DeveloperDetailPage from "@/components/developers/DeveloperDetailPage";

export default async function DeveloperDetailRoute({ params }) {
  const { id } = await params;

  return <DeveloperDetailPage userId={id} />;
}