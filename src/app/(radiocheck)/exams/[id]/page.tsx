import { ExamDetailView } from "@/components/radiocheck/ExamDetailView";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExamDetailView examId={id} />;
}
