import { RefreshCw } from "lucide-react";

import Container from "./Container";

type Props = {
  className?: string;
};

export default function Loading({ className }: Props) {
  return (
    <Container className={className}>
      <div className="py-20 text-center">
        <div className="flex flex-row gap-4">
          <RefreshCw className="animate-spin" />
          <span>Loading ...</span>
        </div>
      </div>
    </Container>
  );
}
