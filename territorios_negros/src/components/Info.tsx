
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Info({ children }: Props) {
  return (
    <div className="info-box">
      {children}
    </div>
  );
}
