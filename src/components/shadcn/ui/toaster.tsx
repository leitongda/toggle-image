import type { ComponentProps } from 'react';
import { Toaster } from 'sonner';

type Props = ComponentProps<typeof Toaster>;

const AppToaster = ({ ...props }: Props) => {
  return <Toaster richColors closeButton position="top-right" {...props} />;
};

export { AppToaster as Toaster };
