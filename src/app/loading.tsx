import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="w-full h-40 flex items-center justify-center">
      <Spinner />
    </div>
  );
}
