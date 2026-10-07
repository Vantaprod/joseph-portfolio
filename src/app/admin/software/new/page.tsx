import { SoftwareForm } from "@/components/admin/SoftwareForm";

export default function NewSoftwarePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-base mb-8">
        New Software Project
      </h1>
      <SoftwareForm />
    </div>
  );
}