import CompanyDetailPage from "@/components/companies/CompanyDetailPage";

export default async function CompanyPage({ params }) {
  const { id } = await params;

  return <CompanyDetailPage companyId={id} />;
}