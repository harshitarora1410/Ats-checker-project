import { Compass } from "lucide-react";
import { PageContainer } from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { ButtonLink } from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <PageContainer className="max-w-2xl">
      <Card>
        <EmptyState icon={Compass} title="Page not found" description="The link may be broken or the page was moved." action={<ButtonLink to="/">Go to the main page</ButtonLink>} />
      </Card>
    </PageContainer>
  );
}
