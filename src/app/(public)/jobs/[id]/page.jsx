import JobDetailPage from "@/components/jobs/JobDetail";


export default async function JobPage({ params }) {
  const { id } = await params;

  return <JobDetailPage jobId={id} />;
}